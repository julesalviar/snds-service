import { Model, Types } from 'mongoose';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDER } from 'src/common/constants/providers';
import { PpaPlanDocument } from './ppa-plan.schema';
import { CreatePpaPlanDto } from './ppa-plan.dto';
import { UpdatePpaPlanDto } from './ppa-plan.dto';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class PpaPlanService {
  private readonly logger = new Logger(PpaPlanService.name);

  constructor(
    @Inject(PROVIDER.PPA_PLAN_MODEL)
    private readonly ppaPlanModel: Model<PpaPlanDocument>,
    @Inject(PROVIDER.USER_MODEL) private readonly userModel: Model<User>,
  ) {}

  async create(dto: CreatePpaPlanDto) {
    if (!Types.ObjectId.isValid(dto.stakeholderUserId as string)) {
      throw new BadRequestException('Invalid stakeholderUserId');
    }
    const created = await this.ppaPlanModel.create({
      ...dto,
      stakeholderUserId: new Types.ObjectId(dto.stakeholderUserId as string),
      reportUrls: dto.reportUrls ?? [],
      allowedRoles: dto.allowedRoles ?? [],
    });
    return this.toResponse(created);
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      stakeholderUserId?: string;
      implementationStatus?: string;
      classification?: string;
      startDateFrom?: string;
      startDateTo?: string;
      endDateFrom?: string;
      endDateTo?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (filters?.stakeholderUserId) {
      if (!Types.ObjectId.isValid(filters.stakeholderUserId)) {
        throw new BadRequestException('Invalid stakeholderUserId');
      }
      query.stakeholderUserId = new Types.ObjectId(filters.stakeholderUserId);
    }
    if (filters?.implementationStatus) {
      query.implementationStatus = filters.implementationStatus;
    }
    if (filters?.classification) {
      query.classification = filters.classification;
    }
    if (filters?.startDateFrom || filters?.startDateTo) {
      query.implementationStartDate = {};
      if (filters.startDateFrom) {
        (query.implementationStartDate as Record<string, string>).$gte =
          filters.startDateFrom;
      }
      if (filters.startDateTo) {
        (query.implementationStartDate as Record<string, string>).$lte =
          filters.startDateTo;
      }
    }
    if (filters?.endDateFrom || filters?.endDateTo) {
      query.implementationEndDate = {};
      if (filters.endDateFrom) {
        (query.implementationEndDate as Record<string, string>).$gte =
          filters.endDateFrom;
      }
      if (filters.endDateTo) {
        (query.implementationEndDate as Record<string, string>).$lte =
          filters.endDateTo;
      }
    }

    const [items, total] = await Promise.all([
      this.ppaPlanModel
        .find(query)
        .populate('stakeholderUserId', 'name firstName lastName email userName')
        .sort({ implementationStartDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.ppaPlanModel.countDocuments(query),
    ]);

    return {
      success: true,
      data: items.map((doc) => this.toResponse(doc as PpaPlanDocument)),
      meta: {
        count: items.length,
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        timestamp: new Date(),
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid plan id');
    }
    const doc = await this.ppaPlanModel
      .findById(new Types.ObjectId(id))
      .populate('stakeholderUserId', 'name firstName lastName email userName')
      .lean()
      .exec();
    if (!doc) {
      throw new NotFoundException(`Ppa plan with id ${id} not found`);
    }
    return this.toResponse(doc as PpaPlanDocument);
  }

  async update(id: string, dto: UpdatePpaPlanDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid plan id');
    }
    const update: Record<string, unknown> = { ...dto };
    if (dto.stakeholderUserId !== undefined) {
      if (!Types.ObjectId.isValid(dto.stakeholderUserId as string)) {
        throw new BadRequestException('Invalid stakeholderUserId');
      }
      update.stakeholderUserId = new Types.ObjectId(
        dto.stakeholderUserId as string,
      );
    }
    const updated = await this.ppaPlanModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { $set: update },
        { new: true, runValidators: true },
      )
      .populate('stakeholderUserId', 'name firstName lastName email userName')
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException(`Ppa plan with id ${id} not found`);
    }
    return this.toResponse(updated as PpaPlanDocument);
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid plan id');
    }
    const deleted = await this.ppaPlanModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();
    if (!deleted) {
      throw new NotFoundException(`Ppa plan with id ${id} not found`);
    }
    return {
      success: true,
      data: { message: 'Ppa plan deleted successfully', id },
      meta: { timestamp: new Date() },
    };
  }

  private toResponse(
    doc: PpaPlanDocument | Record<string, unknown>,
  ): Record<string, unknown> {
    const obj =
      doc && typeof (doc as { toObject?: (opts?: { versionKey?: boolean }) => Record<string, unknown> }).toObject === 'function'
        ? (doc as { toObject: (opts?: { versionKey?: boolean }) => Record<string, unknown> }).toObject({ versionKey: false })
        : { ...(doc as Record<string, unknown>) };
    const id = obj._id;
    return {
      ...obj,
      _id:
        id != null
          ? typeof id === 'string'
            ? id
            : (id as Types.ObjectId).toString()
          : undefined,
    };
  }
}
