import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import {
  closeMongoConnection,
  rootMongooseTestModule,
} from '../../test_utils/mongo/rootMongooseTestModule';
import { AdminController } from '../admin.controller';
import { adminJwtFactory } from '../admin.module';
import { AdminService } from '../admin.service';
import { AdminJwtStrategy } from '../guards/adminJwt.strategy';
import { AdminSchema } from '../Models/admin.model';
import { superAdminStub } from './stubs/';
import { config } from 'dotenv';
import { AdminJwtGuard } from '../guards/adminJwt.guard';
import { CanEditAdminGuard } from '../guards/canEditAdmins.guard';
config();

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;
  let registerSpy: any;
  let loginSpy: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
        JwtModule.registerAsync(adminJwtFactory),
        PassportModule,
      ],
      controllers: [AdminController],
      providers: [AdminService, JwtService, AdminJwtStrategy],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
    registerSpy = jest.spyOn(service, 'RegisterAdmin');
    loginSpy = jest.spyOn(service, 'LoginAdmin');
  });

  afterEach(async () => {
    await closeMongoConnection();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return _id', async () => {
      const stub = superAdminStub();
      const response = await controller.RegisterAdmin({
        ...stub,
      });

      expect(response).toBeInstanceOf(ObjectId);
      expect(registerSpy).toBeCalledWith({ ...stub });
    });

    it('should ensure the JwtAuthGuard is applied to the user method', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        controller.RegisterAdmin,
      );

      const firstGuard = new guards[0]();
      const secondGuard = new guards[1]();

      expect(firstGuard).toBeInstanceOf(AdminJwtGuard);
      expect(secondGuard).toBeInstanceOf(CanEditAdminGuard);
    });
  });

  describe('login', () => {
    it('should return jwt token', async () => {
      const stub = superAdminStub();
      await controller.RegisterAdmin({
        ...stub,
      });
      const response = await service.LoginAdmin({ ...stub });
      expect(response).toBeDefined();
      expect(response).not.toBeNull();
      expect(loginSpy).toBeCalledWith({ ...stub });
    });
  });
});
