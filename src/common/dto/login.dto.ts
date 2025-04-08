import { IsNotEmpty, IsDefined, IsString } from 'class-validator';

export class LoginDto {
    @IsDefined()
    @IsNotEmpty()
    userName: string;

    @IsDefined()
    password: string;
 }
