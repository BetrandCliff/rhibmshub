import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
const COOKIE = "campushub_session";
const secret = () => process.env.AUTH_SECRET || "development-only-secret";
export function sign(value: string) {
    return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}
export async function createSession(userId: string) {
    const raw = `${userId}.${Date.now()}`;
    const token = `${raw}.${sign(raw)}`;
    (await cookies()).set(COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
}
export async function getCurrentUser() {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3 || sign(`${parts[0]}.${parts[1]}`) !== parts[2])
        return null;
    return db.user.findUnique({
        where: { id: parts[0] },
        include: { department: true, group: true, office: true },
    });
}
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) throw new Error("UNAUTHORIZED");
    return user;
}
export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}
export { bcrypt };
export async function logout() {
    (await cookies()).delete(COOKIE);
}
