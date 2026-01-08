// src/components/ui/Label.tsx
import { LabelHTMLAttributes } from "react";

export default function Label({
  children,
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className="block text-slate-300 text-sm mb-2 font-medium" {...props}>
      {children}
    </label>
  );
}
