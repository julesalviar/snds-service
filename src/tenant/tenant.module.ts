import { Global, Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './tenant.schema';
import { TenantConnectionProvider } from '../providers/tenant-connection/tenant-connection';
import { TenantConnectionResolverService } from '../providers/tenant-connection/tenant-connection-resolver.service';

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
  providers: [TenantService, TenantConnectionProvider, TenantConnectionResolverService],
  exports: [TenantService, TenantConnectionProvider, TenantConnectionResolverService],
})
export class TenantModule {}
