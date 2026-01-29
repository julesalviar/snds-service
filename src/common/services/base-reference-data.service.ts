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
      const filteredValue = this.filterValueByStatus(item.value, status);
      if (filteredValue !== null) {
        acc[item.key] = filteredValue;
      }
      return acc;
    }, {});
  }

  async getByKey(
    key: string,
    status: ReferenceStatus = 'active',
    sort?: string,
  ): Promise<any> {
    const filter: Record<string, any> = { key };

    if (status === 'active') {
      filter.active = true;
    } else if (status === 'inactive') {
      filter.active = false;
    }

    const entry = (await this.model.findOne(filter).lean()) as T | null;
    if (!entry) {
      return null;
    }

    let value = this.filterValueByStatus(entry.value, status);
    if (
      (sort === 'asc' || sort === 'desc') &&
      this.isArrayOfStrings(value)
    ) {
      value = [...value].sort(
        sort === 'asc'
          ? (a, b) => a.localeCompare(b)
          : (a, b) => b.localeCompare(a),
      );
    }
    return value;
  }

  private isArrayOfStrings(value: any): value is string[] {
    return (
      Array.isArray(value) && value.every((item) => typeof item === 'string')
    );
  }

  async updateByKey(key: string, value: any): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ key }, { value }, { new: true })
      .lean()
      .exec() as Promise<T | null>;
  }

  private filterValueByStatus(value: any, status: ReferenceStatus): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.filter((item) => {
        if (typeof item === 'object' && item !== null && 'active' in item) {
          if (status === 'active') {
            return item.active === true;
          } else if (status === 'inactive') {
            return item.active === false;
          }
          // status === 'all', include all
          return true;
        }
        // Item doesn't have active property, include it
        return true;
      });
    }

    if (typeof value === 'object' && 'active' in value) {
      if (status === 'active' && value.active !== true) {
        return null;
      }
      if (status === 'inactive' && value.active !== false) {
        return null;
      }
      // status === 'all' or matches the status, return the value
      return value;
    }

    // Value doesn't have active property, return as is
    return value;
  }
}
