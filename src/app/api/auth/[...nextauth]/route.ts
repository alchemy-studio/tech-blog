import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// 扩展 Session 类型
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      username: string;
      role: string;
    }
  }
  interface User {
    id: string;
    username: string;
    role: string;
  }
}

// 扩展 JWT 类型
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('请输入邮箱和密码');
          }

          await connectDB();

          const user = await User.findOne({ email: credentials.email.toLowerCase() });

          if (!user) {
            throw new Error('邮箱或密码错误');
          }

          const isValid = await user.comparePassword(credentials.password);

          if (!isValid) {
            throw new Error('邮箱或密码错误');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            role: user.role,
          };
        } catch (error: any) {
          console.error('认证错误:', error);
          throw new Error(error.message || '认证失败');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 