import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Admin } from '../Models/admin.model';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(@InjectModel('Admin') private readonly adminModel: Model<Admin>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ADMIN_SECRET,
    });
  }

  async validate(payload: { _id: string }) {
    console.log(payload);

    const admin = await this.adminModel.findById(payload._id);
    if (!admin) {
      throw new UnauthorizedException();
    }

    return admin;
  }
}
