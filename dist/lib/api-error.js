"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.handleApiError = handleApiError;
const server_1 = require("next/server");
const zod_1 = require("zod");
class ApiError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}
exports.ApiError = ApiError;
function handleApiError(error) {
    console.error("❌ API ERROR:", error);
    // ZOD ERROR
    if (error instanceof zod_1.ZodError) {
        return server_1.NextResponse.json({
            success: false,
            type: "VALIDATION_ERROR",
            message: "Invalid request data",
            errors: error.flatten().fieldErrors,
        }, { status: 422 });
    }
    // CUSTOM API ERROR
    if (error instanceof ApiError) {
        return server_1.NextResponse.json({
            success: false,
            type: "API_ERROR",
            message: error.message,
        }, { status: error.status });
    }
    // UNKNOWN
    return server_1.NextResponse.json({
        success: false,
        type: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong. Please try again.",
    }, { status: 500 });
}
