import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Tenant, TenantDocument } from './tenantSchema';
import { Model, Connection } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectConnection() private connection: Connection,
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

  // async createTenant(tenantData: Partial<Tenant>): Promise<TenantDocument> {
  //   // Check if a tenant with the same ID already exists
  //   const existingTenant = await this.tenantModel
  //     .findOne({ tenantId: tenantData.tenantCode })
  //     .exec();
  //   if (existingTenant) {
  //     throw new ConflictException(
  //       `Tenant with ID ${tenantData.tenantCode} already exists`,
  //     );
  //   }
  //
  //   const newTenant = new this.tenantModel(tenantData);
  //   return await newTenant.save();
  // }
  async createTenant(tenantData: Partial<Tenant>): Promise<TenantDocument> {
    const existingTenant = await this.tenantModel
      .findOne({ tenantCode: tenantData.tenantCode })
      .exec();
    if (existingTenant) {
      throw new ConflictException(
        `Tenant with ID ${tenantData.tenantCode} already exists`,
      );
    }

    return await this.tenantModel.create(tenantData); // Use create() instead of new
  }
}
