import mongoose from 'mongoose';
import { IUser } from './User';

interface IAnswer {
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  votes: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  tags: string[];
  answers: IAnswer[];
  votes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<IAnswer>(
  {
    content: {
      type: String,
      required: [true, '请提供回答内容'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const questionSchema = new mongoose.Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, '请提供问题标题'],
      trim: true,
      minlength: [10, '标题至少需要10个字符'],
    },
    content: {
      type: String,
      required: [true, '请提供问题详情'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    answers: [answerSchema],
    votes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 添加全文搜索索引
questionSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema); 