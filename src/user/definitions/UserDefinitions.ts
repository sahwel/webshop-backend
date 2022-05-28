import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { NameDTO } from '../../commom/definitions/commonDtos';
import { Match } from '../../commom/validators/PasswordValidator';

export class UserDTO {
  @IsEmail()
  @MaxLength(512)
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(512)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
    message: 'Password too week!',
  })
  password: string;

  @ValidateNested()
  @Type(() => NameDTO)
  name: NameDTO;
}

export class CreateUserDTO extends UserDTO {
  @Match('password')
  re_password: string;
}
