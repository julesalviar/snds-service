import { IsNotEmpty, IsDefined } from 'class-validator';

export class LoginDto {
  @IsDefined()
  @IsNotEmpty()
  userName: string;

  @IsDefined()
  password: string;
}
