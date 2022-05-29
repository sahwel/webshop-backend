import mongoose, { ObjectId } from 'mongoose';
import { stringReq } from '../../commom/helpers/Schema.helper';
import { UserDTO } from '../definitions/UserDefinitions';

export const UserSchema = new mongoose.Schema({
  email: { ...stringReq, max: 512, unique: true },
  password: { ...stringReq, max: 512 },
  name: {
    firstName: {
      ...stringReq,
      max: 512,
    },
    lastName: {
      ...stringReq,
      max: 256,
    },
  },
});

export interface User extends mongoose.Document, UserDTO {}

export interface UserModel extends UserDTO {
  _id: ObjectId;
}
