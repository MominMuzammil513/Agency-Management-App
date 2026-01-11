"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const db_1 = require("@/db/db");
const schemas_1 = require("@/db/schemas");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ------------------------------
// NextAuth Options
// ------------------------------
exports.authOptions = {
    providers: [
        (0, credentials_1.default)({
            type: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!(credentials === null || credentials === void 0 ? void 0 : credentials.email) || !(credentials === null || credentials === void 0 ? void 0 : credentials.password))
                    return null;
                // Fetch user from DB
                const [user] = await db_1.db
                    .select({
                    id: schemas_1.users.id,
                    email: schemas_1.users.email,
                    name: schemas_1.users.name,
                    passwordHash: schemas_1.users.passwordHash,
                    role: schemas_1.users.role,
                    agencyId: schemas_1.users.agencyId, // ← Yeh line zaroori hai!
                })
                    .from(schemas_1.users)
                    .where((0, drizzle_orm_1.eq)(schemas_1.users.email, credentials.email.toLowerCase()))
                    .limit(1);
                if (!user || !user.passwordHash)
                    return null;
                // Verify password
                const isValid = await bcryptjs_1.default.compare(credentials.password, user.passwordHash);
                if (!isValid)
                    return null;
                // Return typed user object (TS safe)
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    agencyId: user.agencyId,
                    role: user.role,
                };
            },
        }),
    ],
    pages: {
        signIn: "/login", // Custom login page
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        // Add role and id to JWT token
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.agencyId = user.agencyId;
            }
            return token;
        },
        // Make role and id available in session
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.agencyId = token.agencyId;
            }
            return session;
        },
    },
};
