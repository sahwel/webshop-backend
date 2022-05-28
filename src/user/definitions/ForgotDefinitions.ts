import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Match } from '../../commom/validators/PasswordValidator';

export class ForgotDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ForgotSetDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
    message: 'Password too week!',
  })
  password: string;

  @Match('password')
  re_password: string;
}
