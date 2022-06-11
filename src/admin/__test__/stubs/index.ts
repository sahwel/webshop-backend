import { CreateAdminDTO } from '../../definitions/AdminDefinitions';
import { Roles } from '../../definitions/Roles';

export const superAdminStub = (
  roles: Roles[] = [Roles.super_admin],
): CreateAdminDTO & {
  re_password: string;
  passowrd_modified_at: Date;
  old_passwords: string[];
} => {
  return {
    email: 'john.doe@test.com',
    name: { firstName: 'John', lastName: 'Doe' },
    password: 'Password1',
    re_password: 'Password1',
    passowrd_modified_at: new Date(),
    roles: roles,
    old_passwords: [],
  };
};

export const SetAdminPAsswordStub = () => {
  return {
    email: 'john.doe@test.com',
    password: 'NewPassword1',
    re_password: 'NewPassword1',
  };
};
