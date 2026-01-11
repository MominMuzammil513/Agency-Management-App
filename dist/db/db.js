"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// scripts/test-db.ts (Fixed & Working Version)
const client_1 = require("@libsql/client");
const libsql_1 = require("drizzle-orm/libsql");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = (0, client_1.createClient)({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
exports.db = (0, libsql_1.drizzle)(client);
