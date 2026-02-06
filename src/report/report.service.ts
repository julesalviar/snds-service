import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, getConnectionToken } from '@nestjs/mongoose';
import { ClsService } from 'nestjs-cls';
import { Report, ReportDocument } from 'src/report/report.schema';
import { Connection, Model } from 'mongoose';
import {
  ReportTemplate,
  ReportTemplateDocument,
} from 'src/report/report-template/report-template.schema';
import {
  ReportQuery,
  ReportQueryDocument,
} from 'src/report/report-query/report-query.schema';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { expandPermissions } from 'src/common/guards/permission-hierarchy';
import { toReportResponseDto, ReportResponseDto } from 'src/report/report.dto';
import { TenantService } from 'src/tenant/tenant.service';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Aip, AipSchema } from 'src/aip/aip.schema';
import {
  ImmersionInfo,
  ImmersionInfoSchema,
} from 'src/shs-immersion/shs-immersion-info.schema';
import {
  SchoolNeed,
  SchoolNeedSchema,
} from 'src/school-need/school-need.schema';
import { School, SchoolSchema } from 'src/schools/school.schema';
import {
  ImageUpload,
  ImageUploadSchema,
} from 'src/upload/schemas/image-upload.schema';
import { Cluster, ClusterSchema } from 'src/cluster/cluster.schema';
import {
  InternalReferenceData,
  InternalReferenceDataSchema,
} from 'src/internal-reference-data/internal-reference-data.schema';
import { Engagement, EngagementSchema } from 'src/engagement/engagement.schema';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,

    @InjectModel(ReportTemplate.name)
    private readonly reportTemplateModel: Model<ReportTemplateDocument>,

    @InjectModel(ReportQuery.name)
    private readonly reportQueryModel: Model<ReportQueryDocument>,

    @Inject(getConnectionToken())
    private readonly defaultConnection: Connection,

    private readonly tenantService: TenantService,
    private readonly clsService: ClsService,
  ) {}

  async getAllReports(
    userRole?: string,
    userPermissions?: PermissionsEnum[],
  ): Promise<{ success: boolean; data: ReportResponseDto[] }> {
    this.logger.log('Retrieving all reporting');
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
    tenantCode?: string,
  ) {
    this.logger.log(`Running report with ID: ${reportId}`);
    const report = await this.reportModel.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Check if a user has access to this report
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
    const resolvedTenantCode = tenantCode || this.clsService.get('tenantCode');

    if (!resolvedTenantCode) {
      throw new BadRequestException(
        'Tenant code is required to run reporting that query tenant data. Please provide tenant header or ensure tenant context is available.',
      );
    }

    const tenant = await this.tenantService.getTenantById(resolvedTenantCode);
    if (!tenant) {
      throw new NotFoundException(
        `Tenant with code ${resolvedTenantCode} not found`,
      );
    }

    const tenantConnection = this.defaultConnection.useDb(
      `snds_${resolvedTenantCode}`,
    );
    this.registerTenantModels(tenantConnection);

    const targetModel = this.getTenantModel(
      tenantConnection,
      queryDef.modelName,
    );

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
      title: report.title,
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

  /**
   * Register all tenant models on the connection
   * This ensures models are available when querying tenant data
   */
  private registerTenantModels(connection: Connection): void {
    // Register all tenant models (model() will return existing if already registered)
    connection.model(User.name, UserSchema);
    connection.model(Aip.name, AipSchema);
    connection.model(ImmersionInfo.name, ImmersionInfoSchema);
    connection.model(SchoolNeed.name, SchoolNeedSchema);
    connection.model(School.name, SchoolSchema);
    connection.model(ImageUpload.name, ImageUploadSchema);
    connection.model(Cluster.name, ClusterSchema);
    connection.model(InternalReferenceData.name, InternalReferenceDataSchema);
    connection.model(Engagement.name, EngagementSchema);
  }

  /**
   * Get a tenant model by name, registering it if necessary
   */
  private getTenantModel(
    connection: Connection,
    modelName: string,
  ): Model<any> {
    // Map of model names to their schemas
    const modelMap: Record<string, any> = {
      User: { name: User.name, schema: UserSchema },
      Aip: { name: Aip.name, schema: AipSchema },
      ImmersionInfo: { name: ImmersionInfo.name, schema: ImmersionInfoSchema },
      SchoolNeed: { name: SchoolNeed.name, schema: SchoolNeedSchema },
      School: { name: School.name, schema: SchoolSchema },
      ImageUpload: { name: ImageUpload.name, schema: ImageUploadSchema },
      Cluster: { name: Cluster.name, schema: ClusterSchema },
      InternalReferenceData: {
        name: InternalReferenceData.name,
        schema: InternalReferenceDataSchema,
      },
      Engagement: { name: Engagement.name, schema: EngagementSchema },
    };

    const modelInfo = modelMap[modelName];
    if (!modelInfo) {
      throw new BadRequestException(
        `Unknown model name: ${modelName}. Supported models: ${Object.keys(modelMap).join(', ')}`,
      );
    }

    // Get or register the model (model() returns existing if registered, or registers new one)
    return connection.model(modelInfo.name, modelInfo.schema);
  }
}
