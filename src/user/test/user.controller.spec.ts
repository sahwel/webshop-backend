import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  closeMongoConnection,
  rootMongooseTestModule,
} from '../../test_utils/mongo/rootMongooseTestModule';
import { UserController } from '../user.controller';
import { UserSchema } from '../Models/user.model';
import { UserService } from '../user.service';
import { ObjectId } from 'mongodb';
import { createForgotStub, forgotStub, userStub } from './stubs/user.stubs';
import { ForgotSchema } from '../Models/forgot.model';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { userJwtFactory } from '../user.module';
import { PassportModule } from '@nestjs/passport';
import { config } from 'dotenv';
config();

describe('AuthController', () => {
  let controller: UserController;
  let service: UserService;
  let registerSpy: any;
  let loginSpy: any;
  let createForgotSpy: any;
  let setForgotSpy: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Forgot', schema: ForgotSchema }]),
        JwtModule.registerAsync(userJwtFactory),
        PassportModule,
      ],
      controllers: [UserController],
      providers: [UserService, JwtService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    registerSpy = jest.spyOn(service, 'RegisterUser');
    loginSpy = jest.spyOn(service, 'LoginUser');
    createForgotSpy = jest.spyOn(service, 'CreateForgotPassword');
    setForgotSpy = jest.spyOn(service, 'ForgotPassword');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return _id', async () => {
      const response = await controller.RegisterUser({
        ...userStub(),
      });

      expect(response).toBeInstanceOf(ObjectId);
      expect(registerSpy).toBeCalledWith({ ...userStub() });
    });
  });

  describe('login', () => {
    it('should return jwt token', async () => {
      await controller.RegisterUser({
        ...userStub(),
      });
      const response = await service.LoginUser({ ...userStub() });
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(loginSpy).toBeCalledWith({ ...userStub() });
    });
  });

  describe('forgot', () => {
    it('should generate forgot request password', async () => {
      await controller.RegisterUser({
        ...userStub(),
      });

      const response = await controller.CreateForgotPassword({
        ...createForgotStub(),
      });
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(response).toHaveProperty('msg');
      expect(response).toHaveProperty('id');
      expect(createForgotSpy).toBeCalledWith({ ...createForgotStub() });
    });
  });

  describe('forgot setter', () => {
    it('should set password', async () => {
      await controller.RegisterUser({
        ...userStub(),
      });

      const forgotRequest: { msg: string; id: string } =
        await controller.CreateForgotPassword({
          ...createForgotStub(),
        });

      const response = await controller.ForgotPassword(
        {
          ...forgotStub(),
        },
        forgotRequest.id,
      );

      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(response).toEqual({ msg: 'Password changed!' });
      expect(setForgotSpy).toBeCalledWith(
        { ...forgotStub() },
        forgotRequest.id,
      );
    });
  });

  afterEach(async () => {
    await closeMongoConnection();
  });
});
