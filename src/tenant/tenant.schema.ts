import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  tenantCode: string;

  @Prop({ required: true })
  tenantName: string;

  @Prop()
  url?: string;

  @Prop()
  active?: boolean;

  @Prop()
  logo?: string;

  @Prop()
  production?: boolean;

  @Prop()
  region?: string;
}

export type TenantDocument = HydratedDocument<Tenant>;
export const TenantSchema = SchemaFactory.createForClass(Tenant);
