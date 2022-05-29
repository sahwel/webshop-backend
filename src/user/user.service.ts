import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { ForgotDTO, ForgotSetDTO } from './definitions/ForgotDefinitions';
import { IUserService } from './definitions/Interfaces';
import { CreateUserDTO } from './definitions/UserDefinitions';
import { Forgot } from './models/forgot.model';
import { User } from './models/user.model';
import { LoginDTO } from '../commom/definitions/commonDtos';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Forgot') private readonly forgotModel: Model<Forgot>,
    private readonly jwtService: JwtService,
  ) {}

  async RegisterUser(data: CreateUserDTO) {
    try {
      const isExists = await this.userModel.exists({ email: data.email });

      if (isExists)
        throw new HttpException(
          {
            error: 'This email is taken!',
          },
          HttpStatus.BAD_REQUEST,
        );
      const hashedPassword = await hash(data.password, 10);
      const user = await this.userModel.create({
        ...data,
        password: hashedPassword,
      });
      return user._id;
    } catch (error) {
      throw error;
    }
  }

  async LoginUser(data: LoginDTO) {
    try {
      const user = await this.userModel.findOne({ email: data.email });
      if (!user)
        throw new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        );

      const validPassword = await compare(data.password, user.password);
      if (!validPassword)
        throw new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        );

      const token = this.jwtService.sign(
        {
          _id: user._id,
        },
        { secret: process.env.USER_SECRET },
      );

      return token;
    } catch (error) {
      throw error;
    }
  }

  async CreateForgotPassword(data: ForgotDTO) {
    try {
      const isExists = await this.forgotModel.findOne({ email: data.email });

      if (isExists) {
        await this.forgotModel.deleteOne({ _id: isExists._id });
      }

      const user = await this.userModel.findOne({ email: data.email });

      let id = undefined;
      if (user) {
        const newForgot = await this.forgotModel.create({ ...data });
        id = newForgot._id;
        //send email
      }

      return { msg: 'Email sent successfully!', id };
    } catch (error) {
      throw error;
    }
  }

  async ForgotPassword(data: ForgotSetDTO, id: ObjectId) {
    try {
      const isExists = await this.forgotModel.findById(id);
      if (!isExists) {
        throw new HttpException(
          { error: 'Request not found!' },
          HttpStatus.NOT_FOUND,
        );
      }

      const user = await this.userModel.findOne({ email: isExists.email });
      if (!user)
        throw new HttpException(
          { error: 'User not found!' },
          HttpStatus.NOT_FOUND,
        );

      const hashedPassword = await hash(data.password, 10);
      user.password = hashedPassword;
      const deleteRequest = this.forgotModel.deleteOne({ _id: id });
      const updateUser = user.save();

      await Promise.all([deleteRequest, updateUser]);
      return { msg: 'Password changed!' };
    } catch (error) {
      throw error;
    }
  }
}
