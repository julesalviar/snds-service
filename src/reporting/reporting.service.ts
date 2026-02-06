import { Inject, Injectable } from '@nestjs/common';
import { CloudflareService } from 'src/reporting/cloudflare.service';

@Injectable()
export class ReportingService {
  constructor(
    @Inject('BASIC_TEMPLATE') private basicTemplate: (context: any) => string,
    private readonly cloudflareService: CloudflareService,
  ) {}

  async generateReport() {
    const html = this.basicTemplate({
      columns: [
        { header: 'Partner Name', field: 'partnerName' },
        { header: 'Contribution Type', field: 'contributionType' },
        { header: 'Quantity', field: 'quantity' },
      ],
      rows: [
        {
          partnerName: 'ABC Corp',
          contributionType: 'Books',
          quantity: 100,
        },
        {
          partnerName: 'XYZ Foundation',
          contributionType: 'Computers',
          quantity: 10,
        },
      ],
    });

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

    const pdf = await this.cloudflareService.generatePdfStream(options);
    return pdf.body;
  }
}
