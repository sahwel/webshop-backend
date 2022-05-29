import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { NameDTO } from '../../commom/definitions/commonDtos';
import { Match } from '../../commom/validators/PasswordValidator';
import { Roles } from './Roles';

export class AdminDTO {
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

  @IsArray()
  @IsOptional()
  @ArrayUnique()
  @ArrayMaxSize(4)
  @ArrayMaxSize(1)
  @IsEnum(Roles, { each: true })
  roles: Roles[];
}

export class CreateAdminDTO extends AdminDTO {
  @Match('password')
  re_password: string;
}

export class SetAdminPasswordDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {
    message: 'Password too week!',
  })
  password: string;
  @Match('password')
  re_password: string;

  @IsEmail()
  @MaxLength(512)
  @IsNotEmpty()
  email: string;
}
