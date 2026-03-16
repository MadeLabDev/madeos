import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT,JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: {
        id: string;
        name: string;
        displayName: string;
      }[];
      permissions: Record<string, string[]>;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    roles?: {
      id: string;
      name: string;
      displayName: string;
    }[];
    permissions?: Record<string, string[]>;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    roles: {
      id: string;
      name: string;
      displayName: string;
    }[];
    permissions: Record<string, string[]>;
  }
}
