"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().trim().min(1, "Email address is required.").email("Enter a valid email address.").max(254),
  ),
  password: z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, "Password is required.").min(8, "Password must be at least 8 characters.").max(256, "Password must be 256 characters or fewer."),
  ),
});

function credentialsFrom(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function redirectWithMessage(path: "/login" | "/signup", key: "error" | "message", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

function validationMessage(credentials: ReturnType<typeof credentialsFrom>) {
  if (credentials.success) return "";
  return credentials.error.issues[0]?.message ?? "The submitted details are invalid.";
}

function loginMessage(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password. Please try again.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email address before logging in.";
  }

  return message || "Supabase did not return a reason for the failed login.";
}

function signupMessage(message: string) {
  if (/already registered|already exists/i.test(message)) {
    return "An account already exists for that email address. Please log in instead.";
  }

  return message || "Supabase did not return a reason the account could not be created.";
}

export async function login(formData: FormData) {
  const credentials = credentialsFrom(formData);
  if (!credentials.success) {
    redirectWithMessage("/login", "error", validationMessage(credentials));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.data.email,
    password: credentials.data.password,
  });

  if (error) {
    redirectWithMessage("/login", "error", loginMessage(error.message));
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const credentials = credentialsFrom(formData);
  if (!credentials.success) {
    redirectWithMessage("/signup", "error", validationMessage(credentials));
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: credentials.data.email,
    password: credentials.data.password,
  });

  if (error) {
    redirectWithMessage("/signup", "error", signupMessage(error.message));
  }

  // With Supabase's email-enumeration protection enabled, an existing email can
  // return an obfuscated user (no identities) instead of an error response.
  if (data.user && data.user.identities?.length === 0) {
    redirectWithMessage(
      "/signup",
      "error",
      "Supabase did not create a new account for this email. An account may already exist; try logging in or resetting its password.",
    );
  }

  // When email confirmation is disabled, Supabase creates a session immediately.
  // Sign it out so every newly-created account returns to the login screen as promised.
  if (data.session) {
    await supabase.auth.signOut();
  }

  redirectWithMessage(
    "/login",
    "message",
    "Account created. Confirm your email if required, then log in with your new credentials.",
  );
}
