import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'immersion_venue' })
export class ImmersionVenue extends Document {
    @Prop({ type: Types.ObjectId, ref: 'ImmersionInfo', required: true })
    immersionInfoId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    immersionCode: number;

    @Prop({ required: true })
    classification: string;

    @Prop({ required: true })
    track: string;

    @Prop({ required: true })
    strand: string;




    @Prop({ required: true })
    contactPerson: string;

    @Prop({ required: true })
    contactNumber: string;

    @Prop({ required: true })
    requiredHours: number;

    @Prop()
    totalMaleBeneficiary: number;

    @Prop()
    totalFMaleBeneficiary: number;

    @Prop()
    createdBy: string;

    @Prop()
    updatedBy: string;

    
}

export type ImmersionVenueDocument = HydratedDocument<ImmersionVenue>;
export const ImmersionVenueSchema = SchemaFactory.createForClass(ImmersionVenue);
