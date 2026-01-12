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
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (res?.error) {
        // Handle specific error messages
        let errorMessage = "Login failed";
        if (res.error === "CredentialsSignin") {
          errorMessage = "Invalid email or password";
        } else if (res.error) {
          errorMessage = res.error;
        }
        
        form.setError("root", {
          type: "manual",
          message: errorMessage,
        });
        return;
      }

      // Success - check if ok is true or if there's no error
      if (res?.ok || !res?.error) {
        // Force a hard redirect to ensure session is loaded
        window.location.href = "/";
      } else {
        form.setError("root", {
          type: "manual",
          message: "Login failed. Please try again.",
        });
      }
    } catch (error: any) {
      form.setError("root", {
        type: "manual",
        message: error.message || "An error occurred. Please try again.",
      });
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
