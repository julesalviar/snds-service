import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDER } from 'src/common/constants/providers';
import { ReportDocument } from 'src/report/report.schema';
import { Connection, Model } from 'mongoose';
import { ReportTemplateDocument } from 'src/report/report-template/report-template.schema';
import { ReportQueryDocument } from 'src/report/report-query/report-query.schema';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { expandPermissions } from 'src/common/guards/permission-hierarchy';
import { toReportResponseDto, ReportResponseDto } from 'src/report/report.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @Inject(PROVIDER.REPORT_MODEL)
    private readonly reportModel: Model<ReportDocument>,

    @Inject(PROVIDER.REPORT_TEMPLATE_MODEL)
    private readonly reportTemplateModel: Model<ReportTemplateDocument>,

    @Inject(PROVIDER.REPORT_QUERY_MODEL)
    private readonly reportQueryModel: Model<ReportQueryDocument>,

    @Inject(PROVIDER.TENANT_CONNECTION)
    private readonly tenantConnection: Connection,
  ) {}

  async getAllReports(
    userRole?: string,
    userPermissions?: PermissionsEnum[],
  ): Promise<{ success: boolean; data: ReportResponseDto[] }> {
    this.logger.log('Retrieving all reports');
    const reports = await this.reportModel
      .find()
      .populate({
        path: 'reportTemplateId',
        select: '-_id orientation paperSize parameters reportType table',
      })
      .exec();

    const accessibleReports = reports.filter((report) =>
      this.hasAccessToReport(report, userRole, userPermissions),
    );

    const sanitizedReports = accessibleReports.map(toReportResponseDto);

    return {
      success: true,
      data: sanitizedReports,
    };
  }

  async runReport(
    reportId: string,
    params: Record<string, any>,
    userRole?: string,
    userPermissions?: PermissionsEnum[],
  ) {
    this.logger.log(`Running report with ID: ${reportId}`);
    const report = await this.reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check if user has access to this report
    if (!this.hasAccessToReport(report, userRole, userPermissions)) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to access this report',
      );
    }

    const template = await this.reportTemplateModel.findById(
      report.reportTemplateId,
    );
    const queryDef = await this.reportQueryModel.findById(report.reportQueryId);
    if (!template || !queryDef)
      throw new BadRequestException('Report template or query not found');

    // Resolve target model dynamically using model name from queryDef
    const targetModel = this.tenantConnection.model(
      queryDef.modelName,
    ) as Model<any>;

    const results = await Promise.all(
      queryDef.queries.map(async (q) => {
        if (q.type === 'find') {
          let query = targetModel.find(
            this.injectParams(q.filter, params),
            q.projection,
          );

          if (q.populate) {
            q.populate.forEach((p) => {
              const populateOptions: any = { path: p.path };
              if (p.select) {
                populateOptions.select = p.select.includes('-_id')
                  ? p.select
                  : `${p.select} -_id`;
              } else {
                populateOptions.select = '-_id';
              }
              query = query.populate(populateOptions);
            });
          }
          if (q.sort) query = query.sort(q.sort);
          if (q.skip) query = query.skip(this.resolveParam(q.skip, params));
          if (q.limit) query = query.limit(this.resolveParam(q.limit, params));

          return await query.exec();
        } else if (q.type === 'count') {
          return targetModel
            .countDocuments(this.injectParams(q.filter, params))
            .exec();
        } else if (q.type === 'aggregate') {
          return targetModel.aggregate(q.pipeline as any[]).exec();
        }

        throw new Error(`Unsupported query type: ${(q as any).type}`);
      }),
    );

    return {
      template,
      data: results[0], // TODO: Only one query is supported for now
    };
  }

  private injectParams(obj: any, params: Record<string, any>): any {
    const str = JSON.stringify(obj);
    const replaced = str.replace(/{{(.*?)}}/g, (_, key) => params[key] ?? '');
    return JSON.parse(replaced);
  }

  private resolveParam(
    value: number | string,
    params: Record<string, any>,
  ): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.startsWith('{{')) {
      const key = value.replace(/[{}]/g, '');
      return Number(params[key] || 0);
    }
    return 0;
  }

  private hasAccessToReport(
    report: ReportDocument,
    userRole?: string,
    userPermissions?: PermissionsEnum[],
  ): boolean {
    // If no restrictions are configured, allow access
    const hasRoleRestriction =
      report.allowedRoles && report.allowedRoles.length > 0;
    const hasPermissionRestriction =
      report.allowedPermissions && report.allowedPermissions.length > 0;

    if (!hasRoleRestriction && !hasPermissionRestriction) {
      return true;
    }

    // Check role-based access
    if (hasRoleRestriction && userRole) {
      if (report.allowedRoles.includes(userRole)) {
        return true;
      }
    }

    // Check permission-based access
    if (hasPermissionRestriction && userPermissions) {
      const expandedPerms = expandPermissions(userPermissions);
      const hasRequiredPermission = report.allowedPermissions.some((perm) =>
        expandedPerms.includes(perm as PermissionsEnum),
      );
      if (hasRequiredPermission) {
        return true;
      }
    }

    return false;
  }
}
