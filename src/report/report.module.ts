import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from 'src/user/user.module';
import { ReportService } from 'src/report/report.service';
import { ReportController } from './report.controller';
import { ReportTemplateService } from './report-template/report-template.service';
import { ReportTemplateController } from './report-template/report-template.controller';
import { ReportQueryService } from './report-query/report-query.service';
import { ReportQueryController } from './report-query/report-query.controller';
import { Report, ReportSchema } from './report.schema';
import {
  ReportTemplate,
  ReportTemplateSchema,
} from './report-template/report-template.schema';
import {
  ReportQuery,
  ReportQuerySchema,
} from './report-query/report-query.schema';
import { TenantModule } from 'src/tenant/tenant.module';

@Module({
  imports: [
    UserModule,
    TenantModule,
    MongooseModule.forFeature([
      {
        name: Report.name,
        schema: ReportSchema,
      },
      {
        name: ReportTemplate.name,
        schema: ReportTemplateSchema,
      },
      {
        name: ReportQuery.name,
        schema: ReportQuerySchema,
      },
    ]),
  ],
  controllers: [
    ReportController,
    ReportTemplateController,
    ReportQueryController,
  ],
  providers: [
    ReportService,
    ReportTemplateService,
    ReportQueryService,
  ],
  exports: [ReportService],
})
export class ReportModule {}
