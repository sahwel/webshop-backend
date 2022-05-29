import mongoose, { ObjectId } from 'mongoose';
import { stringReq } from '../../commom/helpers/Schema.helper';
import { AdminDTO } from '../definitions/AdminDefinitions';

export const AdminSchema = new mongoose.Schema({
  email: { ...stringReq, max: 512, unique: true },
  password: { ...stringReq, max: 512 },
  passowrd_modified_at: { type: Date, default: new Date() },
  roles: [{ type: Number, min: 1, max: 4, default: 4 }],
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

export interface Admin extends mongoose.Document, AdminDTO {}

export interface AdminModel extends AdminDTO {
  _id: ObjectId;
  passowrd_modified_at: Date;
}