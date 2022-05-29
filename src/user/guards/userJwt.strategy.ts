import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../models/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'userJwt') {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.USER_SECRET,
    });
  }

  async validate(payload: { _id: string }) {
    const user = await this.userModel.findById(payload._id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
