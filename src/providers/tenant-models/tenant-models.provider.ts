import { PROVIDER } from 'src/common/constants/providers';
import { Connection, Model } from 'mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Tenant, TenantSchema } from 'src/tenant/tenant.schema';
import { Aip, AipSchema } from 'src/aip/aip.schema';
import {
  ImmersionInfo,
  ImmersionInfoSchema,
} from 'src/shs-immersion/shs-immersion-info.schema';
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
import {
  InternalReferenceData,
  InternalReferenceDataSchema,
} from 'src/internal-reference-data/internal-reference-data.schema';
import { Engagement, EngagementSchema } from 'src/engagement/engagement.schema';
import { Report, ReportSchema } from 'src/report/report.schema';
import {
  ReportTemplate,
  ReportTemplateSchema,
} from 'src/report/report-template/report-template.schema';
import {
  ReportQuery,
  ReportQuerySchema,
} from 'src/report/report-query/report-query.schema';

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

  immersionInfoModel: {
    provide: PROVIDER.IMMERSION_INFO_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<ImmersionInfo>> => {
      return tenantConnection.model(ImmersionInfo.name, ImmersionInfoSchema);
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

  internalReferenceDataModel: {
    provide: PROVIDER.INTERNAL_REFERENCE_DATA_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<InternalReferenceData>> => {
      return tenantConnection.model(
        InternalReferenceData.name,
        InternalReferenceDataSchema,
      );
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  engagementModel: {
    provide: PROVIDER.ENGAGEMENT_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<Engagement>> => {
      return tenantConnection.model(Engagement.name, EngagementSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  reportModel: {
    provide: PROVIDER.REPORT_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<Report>> => {
      return tenantConnection.model(Report.name, ReportSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  reportTemplateModel: {
    provide: PROVIDER.REPORT_TEMPLATE_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<ReportTemplate>> => {
      return tenantConnection.model(ReportTemplate.name, ReportTemplateSchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },

  reportQueryModel: {
    provide: PROVIDER.REPORT_QUERY_MODEL,
    useFactory: async (
      tenantConnection: Connection,
    ): Promise<Model<ReportQuery>> => {
      return tenantConnection.model(ReportQuery.name, ReportQuerySchema);
    },
    inject: [PROVIDER.TENANT_CONNECTION],
  },
};
