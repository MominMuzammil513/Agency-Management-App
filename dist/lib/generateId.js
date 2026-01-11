"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
const crypto_1 = __importDefault(require("crypto"));
function generateId(length = 16) {
    return crypto_1.default.randomBytes(length).toString("base64url").slice(0, length);
}
