import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'editor' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '请提供用户名'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少需要3个字符'],
    },
    email: {
      type: String,
      required: [true, '请提供邮箱'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, '请提供密码'],
      minlength: [6, '密码至少需要6个字符'],
    },
    role: {
      type: String,
      enum: ['user', 'editor', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// 添加 comparePassword 方法
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return this.password === candidatePassword;
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 