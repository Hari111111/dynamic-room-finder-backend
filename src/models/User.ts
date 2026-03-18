import mongoose, { InferSchemaType, Model } from 'mongoose';

export const USER_ROLES = ['user', 'admin', 'superadmin'] as const;
export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    approvalStatus: {
      type: String,
      enum: APPROVAL_STATUSES,
      default: 'approved',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = (mongoose.models.User as Model<UserDocument>) || mongoose.model('User', userSchema);
