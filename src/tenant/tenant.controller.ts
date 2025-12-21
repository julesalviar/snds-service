import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { PublicTenantDto } from './tenant.dto';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @UseGuards(BasicAuthGuard)
  @Get('public')
  async getAllTenants(): Promise<PublicTenantDto[]> {
    const tenants = await this.tenantService.findAllProduction();
    return tenants.map((tenant) => ({
      tenantName: tenant.tenantName,
      url: tenant.url,
      logo: tenant.logo,
    }));
  }
}
