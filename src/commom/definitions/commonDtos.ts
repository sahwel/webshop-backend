import { IsString, MaxLength, MinLength } from 'class-validator';

export class NameDTO {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(512)
  lastName: string;
}

export class LoginDTO {
  @IsString()
  email: string;
  @IsString()
  password: string;
}
