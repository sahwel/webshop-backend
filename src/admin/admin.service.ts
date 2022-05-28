import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from '../commom/definitions/commonDtos';
import { CreateAdminDTO } from './definitions/AdminDefinitions';
import { Admin } from './Models/admin.model';

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
        password: hashedPassword,
      });
      return admin._id;
    } catch (error) {
      throw error;
    }
  }
}
