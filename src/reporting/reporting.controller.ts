import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import { CloudflareService } from 'src/reporting/cloudflare.service';

@Controller('reporting')
export class ReportingController {
  constructor(readonly cloudflareService: CloudflareService) {}

  @Get(':reportId/generate')
  async generateReport() {
    try {
      const landscape = true;

      const headerTemplate = `
      <div style="font-size: 14px; padding: 10px; width: 100%; text-align: center">
        This is the title
      </div>`;

      const footerTemplate = `
      <div style="font-size: 10px; padding: 10px; width: 100%; text-align: center;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`;

      const options = {
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        landscape,
      };

      const response = await this.cloudflareService.generatePdfStream(options);
      const pdfBuffer = Buffer.from(await response.arrayBuffer());

      return new StreamableFile(pdfBuffer, {
        type: 'application/pdf',
        disposition: 'attachment; filename="sample.pdf"',
      });
    } catch (error) {
      console.error('Cloudflare PDF generation error:', error);
      throw new HttpException(
        `Failed to generate PDF using Cloudflare: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
