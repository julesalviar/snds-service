import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from 'src/tenant/tenantSchema';
export async function seedTenant(app) {
  const tenantModel = app.get(
    getModelToken(Tenant.name),
  ) as Model<TenantDocument>;

  const seedData: Partial<Tenant>[] = [
    { tenantCode: 'dev', tenantName: 'Development Server' },
    { tenantCode: 'gensan', tenantName: 'General Santos' },
  ];

  console.log(' Seeding tenants...');

  for (const data of seedData) {
    const exists = await tenantModel.findOne({ tenantCode: data.tenantCode });
    if (!exists) {
      await tenantModel.create(data);
      console.log(` _/ Inserted tenant: ${data.tenantCode}`);
    } else {
      console.log(` >>  Skipped existing tenant: ${data.tenantCode}`);
    }
  }
}
