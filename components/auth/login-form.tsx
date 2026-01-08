// src/components/auth/LoginForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormValues } from "@/lib/zod.schema/auth.schema";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false, // Prevents field unregister on re-render
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: LoginFormValues) => {
console.log(data,"datadata");
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });
    if (res?.error) {
      form.setError("root", {
        type: "manual",
        message: res.error || "Login failed",
      });
    } else if(res?.status === 200) {
      // Success
      alert("Login successful! Redirecting...");
      router.push("/");
      router.refresh();
    }
    // try {
    //   const res = await fetch("/api/auth/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });

    //   const result = await res.json();

    //   if (!res.ok) {
    //     throw new Error(result.error || "Login failed");
    //   }

    //   // Success
    //   alert("Login successful! Redirecting...");
    //   router.push("/dashboard");
    //   router.refresh();
    // } catch (error: any) {
    //   form.setError("root", {
    //     type: "manual",
    //     message: error.message || "Kuch galat ho gaya",
    //   });
    // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@euroindiafoods.com"
          autoComplete="email"
          {...form.register("email")}
        />
        <ErrorMessage message={form.formState.errors.email?.message} />
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...form.register("password")}
        />
        <ErrorMessage message={form.formState.errors.password?.message} />
      </div>

      {/* Global form error */}
      <ErrorMessage message={form.formState.errors.root?.message} />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <p className="text-slate-500 text-xs text-center mt-6">
        Contact admin for login credentials
      </p>
    </form>
  );
}
