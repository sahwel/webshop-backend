import { AuthGuard } from '@nestjs/passport';

export class UserJwtGuard extends AuthGuard('userJwt') {
  constructor() {
    super();
  }
}
