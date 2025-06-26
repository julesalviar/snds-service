import { Model, Number } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

export interface Counter {
  _id: string;
  sequenceValue: number;
}

@Injectable()
export class CounterService {
  constructor(
    @InjectModel('Counter') private readonly counterModel: Model<Counter>,
  ) {}

  async getNextSequenceValue(sequenceName: string): Promise<number> {
    try {
      const counter = await this.counterModel.findByIdAndUpdate(
        sequenceName,
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true },
      );

      return counter.sequenceValue;
    } catch (err) {
      console.error('[getNextSequenceValue] Raw error:', err);
      throw new Error('Failed to get next sequence value');
    }
  }
}
