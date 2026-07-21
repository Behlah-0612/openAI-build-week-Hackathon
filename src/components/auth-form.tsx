import Link from "next/link";
import { login, signup } from "@/app/login/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AuthForm({
  mode,
  demo = false,
}: {
  mode: "login" | "signup";
  demo?: boolean;
}) {
  const isSignup = mode === "signup";
  const action = isSignup ? signup : login;

  return (
    <form action={action} className="mt-8 grid gap-4">
      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          required
          type="email"
          autoComplete="email"
          defaultValue={demo ? "demo@pantrychef.app" : ""}
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Password" htmlFor="password" required hint={!demo ? "At least 8 characters." : undefined}>
        <Input
          id="password"
          name="password"
          required
          minLength={8}
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          defaultValue={demo ? "PantryChefDemo!2026" : ""}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" size="lg" className="mt-2">
        {demo ? "Enter demo kitchen" : isSignup ? "Create account" : "Log in"}
      </Button>

      {!demo && (
        <Link href={isSignup ? "/login" : "/signup"} className="text-center text-sm font-semibold text-primary">
          {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
        </Link>
      )}
    </form>
  );
}
