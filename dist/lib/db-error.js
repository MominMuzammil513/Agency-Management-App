"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDbError = handleDbError;
const api_error_1 = require("./api-error");
function handleDbError(error) {
    if (typeof (error === null || error === void 0 ? void 0 : error.message) === "string" &&
        error.message.includes("UNIQUE constraint failed")) {
        if (error.message.includes("users.email")) {
            throw new api_error_1.ApiError("Email already exists", 409);
        }
    }
    throw error;
}
