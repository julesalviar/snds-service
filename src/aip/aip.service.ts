import { Model, Types } from 'mongoose';
import { PROVIDER } from '../common/constants/providers';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
// import { EncryptionService } from 'src/encryption/encryption.service';
import { AipDto } from 'src/common/dto/aip.dto';
import { Aip } from './aip.schema';

@Injectable()
export class AipService {
    private readonly logger = new Logger(AipService.name);

    constructor(
        @Inject(PROVIDER.AIP_MODEL) private readonly aipModel: Model<Aip>, // Inject the custom provider
    ) { }

    // Create a New AIP
    async createAip(aipDto: AipDto): Promise<any> {
        try {
            this.logger.log(
                'Creating new AIP information with the following data:',
                aipDto,
            );
            
            const createdAip = new this.aipModel(aipDto);
            const savedAip = await createdAip.save();

            this.logger.log(
                `AIP created successfully with ID: ${createdAip._id}`,
            );
            return savedAip;
        } catch (error) {
            this.logger.error('Error creating AIP', error.stack);
            throw error;
        }
    }

    // async deleteAip(id: string): Promise<any> {
    //     try {
    //         this.logger.log(`Attempting to delete AIP with ID: ${id}`);
    //         const objectId = new Types.ObjectId(id); 

    //         return objectId;

    //         const deletedAip = await this.aipModel.findByIdAndDelete(objectId);

    //         if (!deletedAip) {
    //             this.logger.warn(`No AIP found with ID: ${objectId}`);
    //             throw new Error(`AIP with ID ${objectId} not found`);
    //         }

    //         this.logger.log(`AIP deleted successfully with ID: ${objectId}`);
    //         return { message: 'AIP deleted successfully', objectId };
    //     } catch (error) {
    //         this.logger.error('Error deleting AIP', error.stack);
    //         throw error;
    //     }
    // }

}