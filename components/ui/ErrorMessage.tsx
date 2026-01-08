// src/components/ui/ErrorMessage.tsx
type ErrorMessageProps = {
  message?: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return <p className="text-red-400 text-sm text-center mt-2">{message}</p>;
}
