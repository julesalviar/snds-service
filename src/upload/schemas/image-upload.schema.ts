import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'image_uploads' })
export class ImageUpload extends Document {
  @Prop()
  uuid: string;

  @Prop()
  category: string;

  @Prop()
  originalUrl: string;

  @Prop()
  thumbUrl: string;

  @Prop({ default: 'pending' }) // 'pending', 'confirmed', 'cancelled'
  status: string;
}

export type ImageUploadDocument = HydratedDocument<ImageUpload>;
export const ImageUploadSchema = SchemaFactory.createForClass(ImageUpload);
