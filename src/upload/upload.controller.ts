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
    try {
      this.logger.log('Upload request received', {
        fileName: file?.originalname,
        category: category || 'uncategorized',
        fileSize: file?.size,
      });

      if (!file) {
        throw new BadRequestException('File is required');
      }

      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing');
      }

      const result = await this.uploadService.uploadImage(
        file,
        category || 'uncategorized',
      );

      this.logger.log('Upload successful', { id: result.id });

      return {
        id: result.id,
        category: category || 'uncategorized',
        originalUrl: result.originalUrl,
        thumbnailUrl: result.thumbnailUrl,
      };
    } catch (error) {
      this.logger.error('Upload failed', error.stack);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Upload failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  @Delete('image/:uuid/cancel')
  async cancelImage(@Param('uuid') uuid: string) {
    const image = await this.imageUploadModel.findOne({ uuid });

    if (!image) throw new NotFoundException(`Image not found: ${uuid}`);

    // await deleteFromR2(image.originalUrl);
    // await deleteFromR2(image.thumbUrl);

    await image.deleteOne();

    return { message: 'Image deleted successfully.' };
  }
}
