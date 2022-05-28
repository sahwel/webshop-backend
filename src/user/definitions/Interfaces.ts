import { ObjectId } from 'mongodb';
import { LoginDTO } from '../../commom/definitions/commonDtos';
import {
  CommonResponse,
  CommonResponseWithId,
} from '../../commom/definitions/commonDefinitions';
import { ForgotDTO, ForgotSetDTO } from './ForgotDefinitions';
import { CreateUserDTO } from './UserDefinitions';

export interface IUserService {
  RegisterUser: (data: CreateUserDTO) => Promise<string>;
  LoginUser: (data: LoginDTO) => Promise<string>;
  CreateForgotPassword: (data: ForgotDTO) => Promise<CommonResponseWithId>;
  ForgotPassword: (data: ForgotSetDTO, id: ObjectId) => Promise<CommonResponse>;
}
