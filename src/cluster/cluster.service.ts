import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { COUNTER } from 'src/common/constants/counters';
import { CounterService } from 'src/common/counter/counter.services';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClusterDto, UpdateClusterDto } from './cluster.dto';
import { ClusterDocument, Cluster } from './cluster.schema';

@Injectable()
export class ClusterService {
  private readonly logger = new Logger(ClusterService.name);

  constructor(
    @Inject(PROVIDER.CLUSTER_MODEL)
    private readonly clusterModel: Model<Cluster>,
    private readonly counterService: CounterService,
  ) {}

  async createCluster(clusterDto: ClusterDto): Promise<ClusterDocument> {
    const { division } = clusterDto;

    try {
      // Division validation
      if (!division || division.trim() === '') {
        throw new BadRequestException(`Division is required`);
      }

      this.logger.log(
        'Creating new Cluster information with the following data:',
        clusterDto,
      );

      const code =
        clusterDto.code ||
        (await this.counterService.getNextSequenceValue(COUNTER.CLUSTER_CODE));

      const createdCluster = new this.clusterModel({
        ...clusterDto,
        code,
      });

      const savedCluster = await createdCluster.save();

      this.logger.log(
        `Cluster created successfully with ID: ${createdCluster._id.toString()}`,
      );
      return savedCluster;
    } catch (error) {
      this.logger.error('Error creating Cluster', error.stack);
      throw error;
    }
  }

  async deleteCluster(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id))
        throw new BadRequestException(`Invalid Cluster ID format: ${id}`);

      const objectId = new Types.ObjectId(id);
      this.logger.log(`Attempting to delete Cluster with ID: ${id}`);

      const deletedCluster =
        await this.clusterModel.findByIdAndDelete(objectId);
      if (!deletedCluster) {
        this.logger.warn(`No Cluster found with ID: ${objectId}`);
        throw new NotFoundException(`Cluster with ID ${objectId} not found`);
      }

      this.logger.log(`Cluster deleted successfully with ID: ${objectId}`);

      return {
        success: true,
        data: { message: 'Cluster deleted successfully', objectId },
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error deleting Cluster', error.stack);
      throw error;
    }
  }

  async getAll(page = 1, limit = 10, division?: string) {
    try {
      this.logger.log(`Attempting to retrieve all clusters`);

      const skip = (page - 1) * limit;

      const queryFilter: any = {};
      if (division && division.trim() !== '') {
        queryFilter.division = division;
      }

      const [clusters, total] = await Promise.all([
        this.clusterModel
          .find(queryFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.clusterModel.countDocuments(queryFilter),
      ]);

      return {
        success: true,
        data: clusters,
        meta: {
          count: clusters.length,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting clusters', error.stack);
      throw error;
    }
  }

  async getCluster(param: string): Promise<any> {
    try {
      const isObjectId = Types.ObjectId.isValid(param);
      const query = isObjectId
        ? { _id: new Types.ObjectId(param) }
        : { code: param };
      const identifierType = isObjectId ? 'ID' : 'code';

      this.logger.log(
        `Attempting to retrieve Cluster with ${identifierType}: ${param}`,
      );

      const retrievedCluster = await this.clusterModel.findOne(query).exec();

      if (!retrievedCluster) {
        this.logger.warn(`No Cluster found with ${identifierType}: ${param}`);
        throw new NotFoundException(
          `Cluster with ${identifierType} ${param} not found`,
        );
      }

      this.logger.log(
        `Cluster retrieved successfully with ${identifierType}: ${param}`,
      );
      return {
        success: true,
        data: retrievedCluster,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Error getting Cluster by ${Types.ObjectId.isValid(param) ? 'ID' : 'code'}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateCluster(id: string, clusterDto: UpdateClusterDto): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.log(`Attempting to update Cluster with ID: ${id}`);

      const objectId = new Types.ObjectId(id);
      const updatedCluster = await this.clusterModel
        .findByIdAndUpdate(
          objectId,
          { $set: { ...clusterDto } },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedCluster) {
        this.logger.warn(`No Cluster found with ID: ${objectId}`);
        throw new NotFoundException(`Cluster with ID ${objectId} not found`);
      }

      this.logger.log(`Cluster updated successfully with ID: ${objectId}`);
      return {
        success: true,
        data: updatedCluster,
        meta: {
          timestamp: new Date(),
        },
      };
    } catch (error) {
      if (error.name === 'CastError') {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      this.logger.error('Error updating Cluster', error.stack);
      throw error;
    }
  }
}
