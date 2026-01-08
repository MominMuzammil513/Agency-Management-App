import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(error: unknown) {
  console.error("❌ API ERROR:", error);

  // ZOD ERROR
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        type: "VALIDATION_ERROR",
        message: "Invalid request data",
        errors: error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // CUSTOM API ERROR
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        type: "API_ERROR",
        message: error.message,
      },
      { status: error.status }
    );
  }

  // UNKNOWN
  return NextResponse.json(
    {
      success: false,
      type: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
    },
    { status: 500 }
  );
}
