import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");const COOKIE = "skanmakery_session";
export type Session = {userId:string;email:string;name:string;role:"user"|"admin"};
export async function createSession(session: Session) {const token=await new SignJWT(session).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(secret);const jar=await cookies();jar.set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*30});}
export async function getSession():Promise<Session|null>{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;try{const {payload}=await jwtVerify(token,secret);return payload as unknown as Session}catch{return null}}
export async function logout(){(await cookies()).delete(COOKIE)}