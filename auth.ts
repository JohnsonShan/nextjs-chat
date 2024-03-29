import NextAuth, { type DefaultSession } from 'next-auth'
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google"

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })],
  callbacks: {
    jwt({ token, profile }) {
      // console.log('jwt: token, profile', token, profile)
      if (profile) {
        token.id = profile.id
        token.image = profile.avatar_url || profile.picture
      }
      return token
    },
    session: ({ session, token }) => {
      // console.log('session: session, token', session, token)
      if (session?.user) {
        if (token?.id) {
          session.user.id = String(token.id)
        } else if (token?.sub) {
          session.user.id = String(token.sub)
        }
      }
      return session
    },
    authorized({ auth }) {
      // console.log('auth: auth', auth)
      return !!auth?.user // this ensures there is a logged in user for -every- request
    }
  },
  pages: {
    signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  }
})
