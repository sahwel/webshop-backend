import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserSchema } from '../Models/user.model';
import { UserService } from '../user.service';
import { IUserService } from '../definitions/Interfaces';
import { forgotStub, userStub } from './stubs/user.stubs';
import { ObjectId } from 'mongodb';
import { HttpException, HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateUserDTO } from '../definitions/UserDefinitions';
import { plainToInstance } from 'class-transformer';
import { generateString } from '../../test_utils/generators/string.generators';
import { ForgotSchema } from '../Models/forgot.model';
import { ForgotDTO, ForgotSetDTO } from '../definitions/ForgotDefinitions';
import {
  closeMongoConnection,
  rootMongooseTestModule,
} from '../../test_utils/mongo/rootMongooseTestModule';
import { stringified } from '../../test_utils/helpers';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { userJwtFactory } from '../user.module';
import { PassportModule } from '@nestjs/passport';
import { config } from 'dotenv';
config();

describe('UserService', () => {
  let service: IUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Forgot', schema: ForgotSchema }]),
        JwtModule.registerAsync(userJwtFactory),
        PassportModule,
      ],
      providers: [UserService, JwtService],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register user', () => {
    let response: string;

    beforeEach(async () => {
      response = await service.RegisterUser({
        ...userStub(),
      });
    });

    it('should return _id', async () => {
      expect(response).toBeInstanceOf(ObjectId);
    });

    it('should be return error if email is taken', async () => {
      await expect(async () => {
        await service.RegisterUser({
          ...userStub(),
        });
      }).rejects.toThrowError(
        new HttpException(
          {
            error: 'This email is taken!',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should be return error if email is not an email', async () => {
      const payload = plainToInstance(CreateUserDTO, {
        ...userStub(),
        email: 'test',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`email must be an email`);
    });

    it('should be return error if password not match with re_password', async () => {
      const payload = plainToInstance(CreateUserDTO, {
        ...userStub(),
        re_password: 'bad_password',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(
        `password and re_password don't match`,
      );
    });

    it('should be return error if email length too long', async () => {
      const payload = plainToInstance(CreateUserDTO, {
        ...userStub(),
        email: generateString(512) + '@gmail.com',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`email must be an email`);
    });

    it('should be return error if last name length greater then 512', async () => {
      const payload = plainToInstance(CreateUserDTO, {
        ...userStub(),
        name: {
          firstName: 'John',
          lastName: generateString(513),
        },
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(
        `lastName must be shorter than or equal to 512 characters`,
      );
    });

    it('should be return error if first name length greater then 512', async () => {
      const payload = plainToInstance(CreateUserDTO, {
        ...userStub(),
        name: {
          firstName: generateString(513),
          lastName: 'Doe',
        },
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(
        `firstName must be shorter than or equal to 512 characters`,
      );
    });

    it('should be return error if password is too week', async () => {
      const payload = plainToInstance(CreateUserDTO, {
        ...userStub(),
        password: 'password',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`Password too week!`);
    });
  });

  describe('Login user', () => {
    it('should be return error when user not defined', async () => {
      await expect(
        async () => await service.LoginUser({ ...userStub() }),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should be return error when password not match', async () => {
      await service.RegisterUser({ ...userStub() });

      await expect(
        async () =>
          await service.LoginUser({ ...userStub(), password: 'bad_password' }),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should be return jwt token', async () => {
      await service.RegisterUser({ ...userStub() });
      const response = await service.LoginUser({ ...userStub() });
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
    });
  });

  describe('create forgot password', () => {
    it('should throw error when email is not email', async () => {
      const payload = plainToInstance(ForgotDTO, {
        email: 'test',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`email must be an email`);
    });

    it('should not throw error when user is not exists', async () => {
      const response = await service.CreateForgotPassword({
        email: 'john.doe@gmail.com',
      });
      expect(response.msg).toBe('Email sent successfully!');
      expect(response.id).toBeUndefined();
    });

    it('should give back id when user is found', async () => {
      await service.RegisterUser(userStub());
      const response = await service.CreateForgotPassword({
        email: 'john.doe@test.com',
      });
      expect(response.id).not.toBeUndefined();
      expect(response.msg).toBe('Email sent successfully!');
    });

    it('should give back id when request already created', async () => {
      await service.RegisterUser(userStub());
      await service.CreateForgotPassword({
        email: 'john.doe@test.com',
      });
      const response = await service.CreateForgotPassword({
        email: 'john.doe@test.com',
      });
      expect(response.id).not.toBeUndefined();
      expect(response.msg).toBe('Email sent successfully!');
    });
  });

  describe('forgot password setter', () => {
    it('should be return error if password not match with re_password', async () => {
      const payload = plainToInstance(ForgotSetDTO, {
        ...forgotStub(),
        re_password: 'bad_password',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(
        `password and re_password don't match`,
      );
    });

    it('should be return error if password is too week', async () => {
      const payload = plainToInstance(ForgotSetDTO, {
        ...forgotStub(),
        password: 'password',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`Password too week!`);
    });

    it('should throw error when request is not found', async () => {
      await expect(async () => {
        await service.ForgotPassword(
          forgotStub(),
          new ObjectId('627ea1e2fde69594e2d9bdce'),
        );
      }).rejects.toThrowError(
        new HttpException(
          { error: 'Request not found!' },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should not throw error if everything is fine', async () => {
      await service.RegisterUser(userStub());
      const forgot = await service.CreateForgotPassword({
        email: userStub().email,
      });
      const response = await service.ForgotPassword(
        forgotStub(),
        new ObjectId(forgot.id),
      );

      expect(response).toEqual({ msg: 'Password changed!' });
    });
  });

  afterEach(async () => {
    await closeMongoConnection();
  });
});
