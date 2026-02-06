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
import fs from 'node:fs';
import path from 'node:path';
import HandleBars from 'handlebars';
import { registerHelpers } from 'src/report/handlebars-helper';

const basicTemplateProvider = {
  provide: 'BASIC_TEMPLATE',
  useFactory: async () => {
    registerHelpers();
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
  controllers: [
    ReportController,
    ReportTemplateController,
    ReportQueryController,
  ],
  providers: [
    ReportService,
    ReportTemplateService,
    ReportQueryService,
    basicTemplateProvider,
  ],
  exports: [ReportService],
})
export class ReportModule {}
