import { Schema } from 'mongoose';

export const CounterSchema = new Schema({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});
