import { ReportDocument } from 'src/report/report.schema';

export class ReportResponseDto {
  _id: string;
  reportTemplateId?: any;
  reportQueryId?: any;
  title: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function toReportResponseDto(report: ReportDocument): ReportResponseDto {
  const reportObj: any = report.toObject({ versionKey: false });
  delete reportObj.allowedRoles;
  delete reportObj.allowedPermissions;

  const dto = new ReportResponseDto();
  dto._id = report._id.toString();
  dto.reportTemplateId = reportObj.reportTemplateId;
  dto.reportQueryId = reportObj.reportQueryId;
  dto.title = reportObj.title;
  dto.name = reportObj.name;
  dto.description = reportObj.description;
  dto.createdAt = reportObj.createdAt;
  dto.updatedAt = reportObj.updatedAt;
  return dto;
}


