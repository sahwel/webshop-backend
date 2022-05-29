import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { LoginDTO } from '../commom/definitions/commonDtos';
import {
  CreateAdminDTO,
  SetAdminPasswordDTO,
} from './definitions/AdminDefinitions';
import { Admin, AdminModelWithId } from './models/admin.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Admin') private readonly admins: Model<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async LoginAdmin(data: LoginDTO) {
    try {
      const admin = await this.admins.findOne({ email: data.email });
      if (!admin)
        throw new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        );

      const validPassword = await compare(data.password, admin.password);
      if (!validPassword)
        throw new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        );

      const token = this.jwtService.sign(
        {
          _id: admin._id,
        },
        { secret: process.env.ADMIN_SECRET },
      );

      return token;
    } catch (error) {
      throw error;
    }
  }

  async RegisterAdmin(data: CreateAdminDTO) {
    try {
      const isExists = await this.admins.exists({
        email: data.email,
      });

      if (isExists)
        throw new HttpException(
          {
            error: 'This email is taken!',
          },
          HttpStatus.BAD_REQUEST,
        );
      const hashedPassword = await hash(data.password, 10);
      const admin = await this.admins.create({
        ...data,
        roles: data.roles.length === 0 ? [4] : data.roles,
        password: hashedPassword,
      });
      return admin._id;
    } catch (error) {
      throw error;
    }
  }

  async SetPassword(
    data: SetAdminPasswordDTO,
    loggedInAdmin: AdminModelWithId,
  ) {
    try {
      const admin = await this.admins.findOne({ email: data.email });

      if (!admin || loggedInAdmin._id !== loggedInAdmin._id)
        throw new HttpException(
          { error: 'Invalid request!' },
          HttpStatus.BAD_REQUEST,
        );

      admin.old_passwords.push(admin.password);
      admin.old_passwords = admin.old_passwords.slice(0, 5);

      for (const e of admin.old_passwords) {
        if (await compare(data.password, e)) {
          throw new HttpException(
            { error: 'Password cant match with your 5 old password!' },
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const hashedPassword = await hash(data.password, 10);
      admin.password = hashedPassword;
      await admin.save();
      return { msg: 'Password changed!' };
    } catch (error) {
      throw error;
    }
  }
}
