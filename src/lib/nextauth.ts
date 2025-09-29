import { prisma } from "./db"
import {DefaultSession, getServerSession, NextAuthOptions} from "next-auth";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth"{
    interface Session{
        user:{
            id: string;      
    } & DefaultSession["user"]
}
}

declare module "next-auth/jwt"{
    interface JWT{
        id: string;
    }
}
// export const authOptions : NextAuthOptions = {
//     session:{
//         strategy:"jwt"
//     },
//     callbacks:{
//         jwt: async ({token})=>{
//             const db_user = await prisma.user.findFirst({
//                 where:{
//                     email: token?.email
//                 }
//             })
//             if(db_user){
//                 token.id = db_user.id;
//             }
//             return token;
//         },
//         session: ({session, token})=>{
//             if(token){
//                 session.user.id = token.id as string;
//                 session.user.name = token.name as string;
//                 session.user.email = token.email as string;
//                 session.user.image = token.image as string;
//             }
//             return session;
//         }
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//     adapter: PrismaAdapter(prisma), 
//     providers:[
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
//         })
//     ]
// }

export const authOptions: NextAuthOptions = {
    session:{
        strategy:"jwt"
    },
    callbacks:{
        jwt: async ({token})=>{
            const db_user = await prisma.user.findFirst({
                where:{
                    email: token?.email
                }
            })
            if(db_user){
            token.id = db_user.id;
        }
        return token;
        },
        session: ({session, token})=>{
            if(token){
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.image = token.image as string;
            }
            return session;
        }
        
    },
    secret: process.env.NEXTAUTH_SECRET,
    adapter:PrismaAdapter(prisma),
    providers:[
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ]
}

export const getAuthSession = ()=>{
    return getServerSession(authOptions);
}