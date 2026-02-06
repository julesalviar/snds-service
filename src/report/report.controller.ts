import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from 'src/report/report.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UserInfo } from 'src/user/user.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { ReportResponseDto } from 'src/report/report.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cloudflare } from 'cloudflare';
import { PDFCreateParams } from 'cloudflare/resources/browser-rendering/pdf';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('reports')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);
  private readonly accountId: string;
  private readonly cloudflare: Cloudflare;

  constructor(
    private readonly reportService: ReportService,
    private readonly configService: ConfigService,
    @Inject('BASIC_TEMPLATE') private basicTemplate: (context: any) => string,
  ) {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');

    this.cloudflare = new Cloudflare({
      apiToken: apiToken,
    });
  }

  @Post(':reportId/generate')
  async generateReport(
    @UserInfo('activeRole') activeRole: string,
    @UserInfo('schoolId') schoolId: string,
    @UserInfo('perms') userPermissions: PermissionsEnum[],
    @Param('reportId') reportId: string,
    @Body() param: any,
    @Headers('tenant') tenantHeader?: string,
    @Req() request?: Request,
  ) {
    const tenantCode =
      tenantHeader ||
      (request as any)?.tenantCode ||
      (request as any)?.headers?.['tenant'];

    switch (activeRole) {
      case UserRole.SCHOOL_ADMIN:
        param.schoolId = schoolId;
        return this.reportService.runReport(
          reportId,
          param,
          activeRole,
          userPermissions,
          tenantCode,
        );
      case UserRole.DIVISION_ADMIN:
        return this.reportService.runReport(
          reportId,
          param,
          activeRole,
          userPermissions,
          tenantCode,
        );
      default:
        throw new Error('Unauthorized');
    }
  }

  @Post(':reportId/generatePdf')
  async generatePdf(
    @Res() res: Response,
    @Headers('tenant') tenantHeader: string,
    @Req() request: Request,
    @UserInfo('activeRole') activeRole: string,
    @UserInfo('schoolId') schoolId: string,
    @UserInfo('perms') userPermissions: PermissionsEnum[],
    @Param('reportId') reportId: string,
    @Body() param: any,
  ) {
    try {
      const tenantCode =
        tenantHeader ||
        (request as any)?.tenantCode ||
        (request as any)?.headers?.['tenant'];

      param.schoolId = schoolId;
      const report = await this.reportService.runReport(
        reportId,
        param,
        activeRole,
        userPermissions,
        tenantCode,
      );

      const headerTemplate = `
      <div style="font-size: 14px; padding: 10px; width: 100%; text-align: center">
        ${report.title}
      </div>`;

      const footerTemplate = `
      <div style="font-size: 10px; padding: 10px; width: 100%; text-align: center;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`;

      const landscape = report.template?.orientation === 'landscape';

      const pdfOptions: PDFCreateParams.PDFOptions = {
        format: report.template.paperSize ?? 'a4',
        printBackground: true,
        landscape: landscape ?? false,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
        displayHeaderFooter: true,
        headerTemplate: headerTemplate,
        footerTemplate: footerTemplate,
        scale: report.template.scale ?? 1.0,
        preferCSSPageSize: true,
      };

      const plain = JSON.parse(JSON.stringify(report));
      const html = this.basicTemplate(plain);

      this.logger.warn(html);

      const cfResponse = await this.cloudflare.browserRendering.pdf.create({
        account_id: this.accountId,
        html,
        pdfOptions,
      });

      const nodeStream = cfResponse.body as unknown as NodeJS.ReadableStream;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${report.title} - ${reportId}.pdf"`,
      );
      nodeStream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming PDF' });
        } else {
          res.end();
        }
      });
      nodeStream.pipe(res);
    } catch (error) {
      this.logger.error(
        'Error generating the PDF',
        error.stack || error.message,
      );
      throw new HttpException(
        'Error generating the PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllReport(
    @UserInfo('activeRole') activeRole: string,
    @UserInfo('perms') userPermissions: PermissionsEnum[],
  ): Promise<{ success: boolean; data: ReportResponseDto[] }> {
    return this.reportService.getAllReports(activeRole, userPermissions);
  }
}
