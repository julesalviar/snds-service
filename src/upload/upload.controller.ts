import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Delete,
  Param,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { multerOptions } from 'src/config/multer-options';
import { PROVIDER } from 'src/common/constants/providers';
import { Model } from 'mongoose';
import { ImageUpload } from 'src/upload/schemas/image-upload.schema';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly uploadService: UploadService,

    @Inject(PROVIDER.IMAGE_UPLOAD_MODEL)
    private readonly imageUploadModel: Model<ImageUpload>,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
  ) {
    const requestId = Math.random().toString(36).substring(7);
    const requestContext = {
      requestId,
      fileName: file?.originalname,
      category: category || 'uncategorized',
      fileSize: file?.size,
      mimetype: file?.mimetype,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.log('Upload request received', requestContext);

      if (!file) {
        this.logger.warn('Upload failed: No file provided', requestContext);
        throw new BadRequestException('File is required');
      }

      if (!file.buffer) {
        this.logger.warn('Upload failed: File buffer is missing', requestContext);
        throw new BadRequestException('File buffer is missing');
      }

      this.logger.log('Starting image upload process', requestContext);

      const result = await this.uploadService.uploadImage(
        file,
        category || 'uncategorized',
      );

      this.logger.log('Upload successful', { 
        ...requestContext, 
        uploadId: result.id,
        originalUrl: result.originalUrl,
        thumbnailUrl: result.thumbnailUrl,
      });

      return {
        id: result.id,
        category: category || 'uncategorized',
        originalUrl: result.originalUrl,
        thumbnailUrl: result.thumbnailUrl,
      };
    } catch (error) {
      const errorContext = {
        ...requestContext,
        errorName: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack,
        errorCode: error.code,
        errorStatus: error.status,
      };

      this.logger.error('Upload failed with detailed error information', errorContext);

      if (error instanceof BadRequestException) {
        this.logger.warn('Bad request error (400)', errorContext);
        throw error;
      }

      // Log additional context for 500 errors
      this.logger.error('Internal server error (500) - Upload failed', {
        ...errorContext,
        additionalInfo: {
          fileProvided: !!file,
          bufferExists: !!file?.buffer,
          bufferLength: file?.buffer?.length || 0,
          categoryProvided: !!category,
        },
      });

      throw new InternalServerErrorException(
        `Upload failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  @Delete('image/:uuid/cancel')
  async cancelImage(@Param('uuid') uuid: string) {
    const requestId = Math.random().toString(36).substring(7);
    const requestContext = {
      requestId,
      uuid,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.log('Cancel image request received', requestContext);

      const image = await this.imageUploadModel.findOne({ uuid });

      if (!image) {
        this.logger.warn('Image not found for cancellation', requestContext);
        throw new NotFoundException(`Image not found: ${uuid}`);
      }

      this.logger.log('Image found, proceeding with deletion', {
        ...requestContext,
        imageId: image._id,
        originalUrl: image.originalUrl,
        thumbUrl: image.thumbUrl,
      });

      // await deleteFromR2(image.originalUrl);
      // await deleteFromR2(image.thumbUrl);

      await image.deleteOne();

      this.logger.log('Image deleted successfully', requestContext);

      return { message: 'Image deleted successfully.' };
    } catch (error) {
      const errorContext = {
        ...requestContext,
        errorName: error.constructor.name,
        errorMessage: error.message,
        errorStack: error.stack,
        errorCode: error.code,
        errorStatus: error.status,
      };

      this.logger.error('Cancel image failed with detailed error information', errorContext);

      if (error instanceof NotFoundException) {
        this.logger.warn('Not found error (404)', errorContext);
        throw error;
      }

      // Log additional context for 500 errors
      this.logger.error('Internal server error (500) - Cancel image failed', {
        ...errorContext,
        additionalInfo: {
          uuidProvided: !!uuid,
          uuidLength: uuid?.length || 0,
        },
      });

      throw new InternalServerErrorException(
        `Cancel image failed: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
