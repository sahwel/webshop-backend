import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
config();

@Module({
  imports: [
    UserModule,
    AdminModule,
    MongooseModule.forRoot(process.env.DB_URI),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
