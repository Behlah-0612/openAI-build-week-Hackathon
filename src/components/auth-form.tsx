"use client";

import { login, signup } from "@/app/login/actions";
import { useState } from "react";

export function AuthForm({ demo }: { demo?: boolean }) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const action = mode === "login" ? login : signup;

  return (
    <form action={action} className="mt-8 grid gap-4">
      <input
        aria-label="Email"
        name="email"
        required
        type="email"
        defaultValue={demo ? "demo@pantrychef.app" : ""}
        placeholder="Email address"
        className="rounded-xl border border-ink/15 bg-white px-4 py-4 outline-herb"
      />

      <input
        aria-label="Password"
        name="password"
        required
        minLength={8}
        type="password"
        defaultValue={demo ? "PantryChefDemo!2026" : ""}
        placeholder="Password"
        className="rounded-xl border border-ink/15 bg-white px-4 py-4 outline-herb"
      />

      <button
        className="min-h-14 rounded-xl bg-herb px-4 font-semibold text-white"
        type="submit"
      >
        {demo
          ? "Enter demo kitchen"
          : mode === "login"
            ? "Log in"
            : "Create account"}
      </button>

      {!demo && (
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-sm font-semibold text-herb"
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>
      )}
    </form>
  );
}