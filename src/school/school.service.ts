import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class SchoolService {}
