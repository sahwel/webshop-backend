import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export const ForgotAdminSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
});

export interface ForgotAdmin extends mongoose.Document, ForgotAdminModel {}

export interface ForgotAdminModelModelWithId {
  _id: ObjectId;
}

export interface ForgotAdminModel {
  admin: ObjectId;
}
