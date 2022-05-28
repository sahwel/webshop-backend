import mongoose, { ObjectId } from 'mongoose';
import { ForgotDTO } from '../definitions/ForgotDefinitions';
import { stringReq } from '../../commom/helpers/Schema.helper';

export const ForgotSchema = new mongoose.Schema(
  {
    email: { ...stringReq, max: 512, unique: true },
  },
  { timestamps: true },
);

export interface Forgot extends mongoose.Document, ForgotDTO {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
