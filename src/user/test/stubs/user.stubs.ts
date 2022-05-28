import {
  ForgotDTO,
  ForgotSetDTO,
} from '../../../user/definitions/ForgotDefinitions';
import { CreateUserDTO } from '../../../user/definitions/UserDefinitions';

export const userStub = (): CreateUserDTO => {
  return {
    email: 'john.doe@test.com',
    name: { firstName: 'John', lastName: 'Doe' },
    password: 'Password1',
    re_password: 'Password1',
  };
};

export const createForgotStub = (): ForgotDTO => {
  return {
    email: 'john.doe@test.com',
  };
};

export const forgotStub = (): ForgotSetDTO => {
  return {
    password: 'Password1',
    re_password: 'Password1',
  };
};
