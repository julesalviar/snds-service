import { PROVIDER } from 'src/common/constants/providers';
import { Connection, Model } from 'mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Tenant, TenantSchema } from 'src/tenant/tenantSchema';
import { Aip, AipSchema } from 'src/aip/aip.schema';
import {
  SchoolNeedSchema,
  SchoolNeed,
} from 'src/school-need/school-need.schema';
import { School, SchoolSchema } from 'src/schools/school.schema';
import {
  ImageUpload,
  ImageUploadSchema,
} from 'src/upload/schemas/image-upload.schema';
import { Cluster, ClusterSchema } from 'src/cluster/cluster.schema';

export const TenantModels = {
  userModel: {
    provide: PROVIDER.USER_MODEL,
    useFactory: async (tenantConnection: Connection): Promise<Model<User>> => {
      return tenantConnection.model(User.name, UserSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  aipModel: {
    provide: PROVIDER.AIP_MODEL,
    useFactory: async (tenantConnection: Connection): Promise<Model<Aip>> => {
      return tenantConnection.model(Aip.name, AipSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  schoolNeedModel: {
    provide: PROVIDER.SCHOOL_NEED_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<SchoolNeed>> => {
      return tenantConnection.model(SchoolNeed.name, SchoolNeedSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  schoolModel: {
    provide: PROVIDER.SCHOOL_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<School>> => {
      return tenantConnection.model(School.name, SchoolSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  imageUploadModel: {
    provide: PROVIDER.IMAGE_UPLOAD_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<ImageUpload>> => {
      return tenantConnection.model(ImageUpload.name, ImageUploadSchema);
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

  clusterModel: {
    provide: PROVIDER.CLUSTER_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<Cluster>> => {
      return tenantConnection.model(Cluster.name, ClusterSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
};
