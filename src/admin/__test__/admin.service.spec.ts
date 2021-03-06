import { HttpException, HttpStatus } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ObjectId } from 'mongodb';
import { stringified } from '../../test_utils/helpers';
import { generateString } from '../../test_utils/generators/string.generators';
import {
  closeMongoConnection,
  rootMongooseTestModule,
} from '../../test_utils/mongo/rootMongooseTestModule';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../admin.service';
import { CreateAdminDTO } from '../definitions/AdminDefinitions';
import { AdminSchema } from '../models/admin.model';
import { SetAdminPAsswordStub, superAdminStub } from './stubs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { adminJwtFactory } from '../admin.module';
import { config } from 'dotenv';
import { ForgotAdminSchema } from '../models/forgotAdmin.model';
config();

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
        MongooseModule.forFeature([
          { name: 'ForgotAdmin', schema: ForgotAdminSchema },
        ]),
        JwtModule.registerAsync(adminJwtFactory),
        PassportModule,
      ],
      providers: [AdminService, JwtService],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  afterEach(async () => {
    await closeMongoConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register admin', () => {
    let response: string;

    beforeEach(async () => {
      response = await service.RegisterAdmin({
        ...superAdminStub(),
      });
    });

    it('should return _id', async () => {
      expect(response).toBeInstanceOf(ObjectId);
    });

    it('should be return error if email is taken', async () => {
      await expect(async () => {
        await service.RegisterAdmin({
          ...superAdminStub(),
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
      const payload = plainToInstance(CreateAdminDTO, {
        ...superAdminStub(),
        email: 'test',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`email must be an email`);
    });

    it('should be return error if password not match with re_password', async () => {
      const payload = plainToInstance(CreateAdminDTO, {
        ...superAdminStub(),
        re_password: 'bad_password',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(
        `password and re_password don't match`,
      );
    });

    it('should be return error if email length too long', async () => {
      const payload = plainToInstance(CreateAdminDTO, {
        ...superAdminStub(),
        email: generateString(512) + '@gmail.com',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`email must be an email`);
    });

    it('should be return error if last name length greater then 512', async () => {
      const payload = plainToInstance(CreateAdminDTO, {
        ...superAdminStub(),
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
      const payload = plainToInstance(CreateAdminDTO, {
        ...superAdminStub(),
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
      const payload = plainToInstance(CreateAdminDTO, {
        ...superAdminStub(),
        password: 'password',
      });
      const errors = await validate(payload);
      expect(errors.length).not.toBe(0);
      expect(stringified(errors)).toContain(`Password too week!`);
    });

    it('should add the readonly role if the roles array is empty', async () => {
      const response = await service.RegisterAdmin({
        ...superAdminStub([]),
        email: 'mezosijoci2@gmail.com',
      });
      expect(response).toBeInstanceOf(ObjectId);
    });
  });

  describe('Login admin', () => {
    it('should be return error when admin not defined', async () => {
      await expect(
        async () => await service.LoginAdmin({ ...superAdminStub() }),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should be return error when password not match', async () => {
      await service.RegisterAdmin({ ...superAdminStub() });
      await expect(
        async () =>
          await service.LoginAdmin({
            ...superAdminStub(),
            password: 'bad_password',
          }),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Invalid credidentals!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should be return jwt token', async () => {
      await service.RegisterAdmin({ ...superAdminStub() });
      const response = await service.LoginAdmin({ ...superAdminStub() });
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
    });
  });

  describe('set admin password', () => {
    it('should return message password changed', async () => {
      const _id = await service.RegisterAdmin({ ...superAdminStub() });
      const response = await service.SetPassword(
        { ...SetAdminPAsswordStub() },
        { _id, ...superAdminStub() },
      );
      expect(response).toEqual({ msg: 'Password changed!' });
    });

    it('should return error when admin not found', async () => {
      await expect(
        async () =>
          await service.SetPassword(
            {
              ...SetAdminPAsswordStub(),
            },
            { _id: new ObjectId(), ...superAdminStub() },
          ),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Invalid request!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return error when password match with old password', async () => {
      const _id = await service.RegisterAdmin({ ...superAdminStub() });
      await service.SetPassword(
        {
          ...SetAdminPAsswordStub(),
        },
        { _id, ...superAdminStub() },
      );
      await expect(
        async () =>
          await service.SetPassword(
            {
              ...SetAdminPAsswordStub(),
              password: 'Password1',
              re_password: 'Password1',
            },
            { _id, ...superAdminStub() },
          ),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Password cant match with your 5 old password!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return error when logged in user is not match', async () => {
      await service.RegisterAdmin({ ...superAdminStub() });
      const _id = await service.RegisterAdmin({
        ...superAdminStub(),
        email: 'mezosijoci2@gmail.com',
      });
      await expect(
        async () =>
          await service.SetPassword(
            {
              ...SetAdminPAsswordStub(),
              password: 'Password1',
              re_password: 'Password1',
            },
            { _id, ...superAdminStub() },
          ),
      ).rejects.toThrowError(
        new HttpException(
          { error: 'Password cant match with your 5 old password!' },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
