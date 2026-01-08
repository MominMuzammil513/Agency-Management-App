import { FieldError } from "react-hook-form";

export function FormError({ error }: { error?: FieldError }) {
  if (!error?.message) return null;

  return <p className="text-red-500 text-xs mt-1">{String(error.message)}</p>;
}
