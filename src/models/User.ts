import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// 密码加密中间件
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 密码比对方法
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// 处理重复键错误
userSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(new Error(`${field === 'username' ? '用户名' : '邮箱'}已被使用`));
  } else {
    next(error);
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 