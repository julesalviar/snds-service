import { Model } from 'mongoose';
import { ReferenceStatus } from 'src/reference-data/reference-status.enum';

export abstract class BaseReferenceDataService<
  T extends { key: string; value: any; active: boolean },
> {
  protected abstract model: Model<T>;

  async getByStatus(
    status: ReferenceStatus = 'active',
  ): Promise<Record<string, any>> {
    const filter: Record<string, any> = {};

    if (status === 'active') {
      filter.active = true;
    } else if (status === 'inactive') {
      filter.active = false;
    }

    const entries = await this.model.find(filter).lean();
    return entries.reduce((acc: Record<string, any>, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }

  async getByKey(
    key: string,
    status: ReferenceStatus = 'active',
  ): Promise<any> {
    const filter: Record<string, any> = { key };

    if (status === 'active') {
      filter.active = true;
    } else if (status === 'inactive') {
      filter.active = false;
    }

    const entry = (await this.model.findOne(filter).lean()) as T | null;
    return entry ? entry.value : null;
  }
}
