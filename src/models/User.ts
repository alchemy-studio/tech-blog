import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'editor';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '请提供用户名'],
      trim: true,
      minlength: [3, '用户名至少需要3个字符'],
      validate: {
        validator: async function(username: string) {
          if (this.isNew || this.isModified('username')) {
            const existingUser = await mongoose.models.User.findOne({ username });
            return !existingUser;
          }
          return true;
        },
        message: '该用户名已被使用'
      }
    },
    email: {
      type: String,
      required: [true, '请提供邮箱地址'],
      trim: true,
      lowercase: true,
      validate: {
        validator: async function(email: string) {
          if (this.isNew || this.isModified('email')) {
            const existingUser = await mongoose.models.User.findOne({ email });
            return !existingUser;
          }
          return true;
        },
        message: '该邮箱已被注册'
      }
    },
    password: {
      type: String,
      required: [true, '请提供密码'],
      minlength: [6, '密码至少需要6个字符'],
    },
    role: {
      type: String,
      enum: ['user', 'editor'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// 创建索引以提高查询性能
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// 简单的密码比对方法
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return this.password === candidatePassword;
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 