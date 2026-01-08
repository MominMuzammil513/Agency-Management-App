"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export default function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");

  // 🔑 Hardcoded password constant
  const CORRECT_PASSWORD = "alhamdullilah"; // change this to whatever you want

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password === CORRECT_PASSWORD) {
      // ✅ Redirect if password matches
      router.push("/superadmin/alhamdullilah"); // replace with your route
    } else {
      // ❌ Show error if password is wrong
      alert("Incorrect password. Try again!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          placeholder="••••••••"
          required
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
