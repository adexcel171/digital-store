import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const { email, password } = credentials;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) throw new Error("No account found with this email.");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error("Incorrect password.");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.walletBalance = user.walletBalance;
      }
      // Allow client to force-refresh wallet balance in token
      if (trigger === "update" && session?.walletBalance !== undefined) {
        token.walletBalance = session.walletBalance;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.walletBalance = token.walletBalance;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
