import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cloudflare } from 'cloudflare';
import type { PDFCreateParams } from 'cloudflare/resources/browser-rendering/pdf';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly accountId: string;
  private readonly cloudflare: Cloudflare;

  constructor(private readonly configService: ConfigService) {
    this.accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');

    this.cloudflare = new Cloudflare({
      apiToken: apiToken,
    });
  }

  async generatePdfStream(options: any) {
    try {
      const html = '';
      const pdfOptions: PDFCreateParams.PDFOptions = {
        format: options?.format || 'a4',
        printBackground: options?.printBackground ?? true,
        landscape: options?.landscape ?? false,
        margin: options?.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: options?.displayHeaderFooter ?? false,
        headerTemplate: options?.headerTemplate || '',
        footerTemplate: options?.footerTemplate || '',
        scale: options?.scale || 1,
        preferCSSPageSize: true,
      };

      return this.cloudflare.browserRendering.pdf.create({
        account_id: this.accountId,
        html,
        pdfOptions,
      });
    } catch (error) {
      this.logger.error('Error generating PDF', error.stack);
    }
  }
}
