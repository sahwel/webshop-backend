import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ForgotSchema } from './Models/forgot.model';
import { UserSchema } from './Models/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtStrategy } from './guards/userJwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

export const userJwtFactory = {
  useFactory: async () => ({
    secret: process.env.USER_SECRET,
    signOptions: {
      expiresIn: '12h',
    },
  }),
};
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Forgot', schema: ForgotSchema }]),
    JwtModule.registerAsync(userJwtFactory),
    PassportModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
