import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminSchema } from './Models/admin.model';
import { JwtModule } from '@nestjs/jwt';
import { AdminJwtStrategy } from './guards/adminJwt.strategy';
import { PassportModule } from '@nestjs/passport';

export const adminJwtFactory = {
  useFactory: async () => ({
    secret: process.env.ADMIN_SECRET,
    signOptions: {
      expiresIn: '12h',
    },
  }),
};
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),
    JwtModule.registerAsync(adminJwtFactory),
    PassportModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtStrategy],
})
export class AdminModule {}
