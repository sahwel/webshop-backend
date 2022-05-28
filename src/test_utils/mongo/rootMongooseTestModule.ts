import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { disconnect } from 'mongoose';

let mongo: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongo = await MongoMemoryServer.create();
      const mongoUri = mongo.getUri();

      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

export const closeMongoConnection = async () => {
  await disconnect();
  if (mongo) await mongo.stop();

  mongoose.disconnect();
  mongoose.connection.close();
};
