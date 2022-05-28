import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
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
  @ArrayUnique()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsEnum(Roles, { each: true })
  roles: Roles[];
}

export class CreateAdminDTO extends AdminDTO {
  @Match('password')
  re_password: string;
}
