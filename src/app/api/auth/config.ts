import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";

const adminEmails = ['ozalyildirim@firat.edu.tr']; // Admin e-posta adresi

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.isAdmin = adminEmails.includes(session.user.email || '');
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Kullanıcıyı giriş yaptıktan sonra ana sayfaya yönlendir
      return baseUrl;
    }
  },
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin'
  }
};

export default authOptions;
