import mongoose from 'mongoose';
import { IUser } from './User';

interface IArticleVersion {
  content: string;
  editor: mongoose.Types.ObjectId | IUser;
  editedAt: Date;
  changeDescription?: string;
}

export interface IArticle extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  tags: string[];
  status: 'draft' | 'published' | 'pending_review';
  versions: IArticleVersion[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const articleVersionSchema = new mongoose.Schema<IArticleVersion>({
  content: {
    type: String,
    required: true,
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  editedAt: {
    type: Date,
    default: Date.now,
  },
  changeDescription: {
    type: String,
  },
});

const articleSchema = new mongoose.Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, '请提供文章标题'],
      trim: true,
      minlength: [3, '标题至少需要3个字符'],
    },
    content: {
      type: String,
      required: [true, '请提供文章内容'],
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
    status: {
      type: String,
      enum: ['draft', 'published', 'pending_review'],
      default: 'draft',
    },
    versions: [articleVersionSchema],
    currentVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 创建新版本的中间件
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.versions.push({
      content: this.content,
      editor: this.isNew ? this.author : this.get('editor'),
      editedAt: new Date(),
      changeDescription: this.get('changeDescription'),
    });
    this.currentVersion = this.versions.length - 1;
  }
  next();
});

// 添加全文搜索索引
articleSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

export default mongoose.models.Article || mongoose.model<IArticle>('Article', articleSchema); 