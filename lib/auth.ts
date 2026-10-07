import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
const COOKIE = "campushub_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;
const secret = () => {
    const configuredSecret = process.env.AUTH_SECRET;
    if (configuredSecret && (process.env.NODE_ENV !== "production" || configuredSecret.length >= 32)) {
        return configuredSecret;
    }
    if (process.env.NODE_ENV === "production") {
        throw new Error("AUTH_SECRET must be configured with at least 32 characters in production.");
    }
    return "development-only-secret";
};
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
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}
export async function getCurrentUser() {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[0] || !/^\d+$/.test(parts[1]) || !/^[\da-f]{64}$/i.test(parts[2])) return null;
    const issuedAt = Number(parts[1]);
    const now = Date.now();
    if (!Number.isSafeInteger(issuedAt) || issuedAt > now + 60_000 || now - issuedAt > SESSION_MAX_AGE_MS) return null;
    const expectedSignature = Buffer.from(sign(`${parts[0]}.${parts[1]}`), "hex");
    const actualSignature = Buffer.from(parts[2], "hex");
    if (!crypto.timingSafeEqual(expectedSignature, actualSignature)) return null;
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
