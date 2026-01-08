import { ApiError } from "./api-error";

export function handleDbError(error: any) {
  if (
    typeof error?.message === "string" &&
    error.message.includes("UNIQUE constraint failed")
  ) {
    if (error.message.includes("users.email")) {
      throw new ApiError("Email already exists", 409);
    }
  }

  throw error;
}
