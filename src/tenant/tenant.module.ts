import { Global, Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './tenantSchema';
import { TenantConnectionProvider } from '../providers/tenant-connection/tenant-connection';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tenant.name,
        schema: TenantSchema,
      },
    ]),
  ],
  controllers: [TenantController],
  providers: [TenantService, TenantConnectionProvider],
  exports: [TenantService, TenantConnectionProvider],
})
export class TenantModule {}
