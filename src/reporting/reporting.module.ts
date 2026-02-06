import { Module } from '@nestjs/common';
import { ReportingController } from './reporting.controller';
import { UserModule } from 'src/user/user.module';
import { TenantModule } from 'src/tenant/tenant.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from 'src/report/report.schema';
import {
  ReportTemplate,
  ReportTemplateSchema,
} from 'src/report/report-template/report-template.schema';
import {
  ReportQuery,
  ReportQuerySchema,
} from 'src/report/report-query/report-query.schema';
import { ReportingService } from 'src/reporting/reporting.service';
import { ReportQueryService } from 'src/report/report-query/report-query.service';
import { ReportTemplateService } from 'src/report/report-template/report-template.service';
import { CloudflareService } from 'src/reporting/cloudflare.service';
import * as fs from 'node:fs';
import path from 'node:path';
import * as HandleBars from 'handlebars';

const basicTemplateProvider = {
  provide: 'BASIC_TEMPLATE',
  useFactory: async () => {
    const source = await fs.promises.readFile(
      path.join(process.cwd(), 'src', 'reporting', 'templates', 'basic.hbs'),
      'utf8',
    );
    return HandleBars.compile(source);
  },
};

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
  controllers: [ReportingController],
  providers: [
    ReportingService,
    ReportTemplateService,
    ReportQueryService,
    CloudflareService,
    basicTemplateProvider,
  ],
  exports: ['BASIC_TEMPLATE'],
})
export class ReportingModule {}
