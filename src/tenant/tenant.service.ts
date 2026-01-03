import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tenant, TenantDocument } from './tenant.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
  ) {}

  async getTenantById(tenantCode: string): Promise<TenantDocument | null> {
    const tenant = await this.tenantModel.findOne({ tenantCode }).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantCode} not found`);
    }
    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().lean().exec();
  }

  async findAllPublicTenants(region?: string): Promise<Tenant[]> {
    const query: any = { production: true };
    if (region) {
      query.region = region;
    }
    return this.tenantModel.find(query).lean().exec();
  }

  async createTenant(tenantData: Partial<Tenant>): Promise<TenantDocument> {
    const existingTenant = await this.tenantModel
      .findOne({ tenantCode: tenantData.tenantCode })
      .exec();

    if (existingTenant) {
      throw new ConflictException(
        `Tenant with ID ${tenantData.tenantCode} already exists`,
      );
    }

    return await this.tenantModel.create(tenantData);
  }
}
