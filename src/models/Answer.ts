import mongoose from 'mongoose';

export interface IAnswer extends mongoose.Document {
  content: string;
  author: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<IAnswer>(
  {
    content: {
      type: String,
      required: [true, '回答内容不能为空'],
      minlength: [10, '回答内容至少需要10个字符'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '回答必须有作者'],
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, '回答必须关联到一个问题'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Answer || mongoose.model<IAnswer>('Answer', answerSchema); 