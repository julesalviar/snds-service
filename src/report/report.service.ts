import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor() {}
}
