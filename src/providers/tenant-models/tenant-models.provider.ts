import { PROVIDER } from 'src/common/constants/providers';
import { Connection, Model } from 'mongoose';
import { User, UserSchema } from 'src/user/user.schema';
import { School, SchoolSchema } from 'src/school/school.schema';
import { Tenant, TenantSchema } from 'src/tenant/tenantSchema';

export const TenantModels = {
  userModel: {
    provide: PROVIDER.USER_MODEL,
    useFactory: async (tenantConnection: Connection): Promise<Model<User>> => {
      return tenantConnection.model(User.name, UserSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  schoolModel: {
    provide: PROVIDER.SCHOOL_MODEL,
    useFactory: async (tenantConnection: Connection): Promise<Model<School>> => {
      return tenantConnection.model(School.name, SchoolSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  tenantModel: {
    provide: PROVIDER.TENANT_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Tenant.name, TenantSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
};
