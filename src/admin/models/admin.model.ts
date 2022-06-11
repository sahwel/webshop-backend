import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { numberReq, stringReq } from '../../commom/helpers/Schema.helper';
import { AdminDTO } from '../definitions/AdminDefinitions';
import { Roles } from '../definitions/Roles';

export const AdminSchema = new mongoose.Schema({
  email: { ...stringReq, max: 512, unique: true },
  password: { ...stringReq, max: 512 },
  passowrd_modified_at: { type: Date, default: new Date() },
  old_passwords: [{ ...stringReq, max: 512 }],
  roles: {
    type: [{ ...numberReq, enum: Roles, min: 1, max: 4 }],
    default: [4],
  },
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

export interface Admin extends mongoose.Document, AdminModel {}

export interface AdminModelWithId extends AdminDTO {
  _id: ObjectId;
  passowrd_modified_at: Date;
  old_passwords: string[];
}

export interface AdminModel extends AdminDTO {
  passowrd_modified_at: Date;
  old_passwords: string[];
}
