import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { Alert } from "@/components/ui/alert";

type LoginSearchParams = Promise<{ demo?: string; error?: string; message?: string }>;

export default async function Login({ searchParams }: { searchParams: LoginSearchParams }) {
  const { demo, error, message } = await searchParams;
  const isDemo = demo === "1";

  return (
    <main className="p-6">
      <Link href="/" className="inline-flex min-h-11 items-center gap-1 -ml-1 px-1 text-sm font-semibold text-primary">
        <ChevronLeft size={16} aria-hidden="true" /> PantryChef
      </Link>
      <h1 className="mt-14 text-4xl font-bold tracking-tight text-text">{isDemo ? "Welcome to the demo" : "Welcome back"}</h1>
      <p className="mt-3 text-muted-text">
        {isDemo ? "Explore a stocked kitchen. Your changes are reset on every demo login." : "Your kitchen is waiting."}
      </p>

      {error && (
        <Alert variant="error" className="mt-6">
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="info" className="mt-6">
          {message}
        </Alert>
      )}

      <AuthForm mode="login" demo={isDemo} />

      {!isDemo && (
        <Link href="/login?demo=1" className="mt-6 block text-center text-sm font-semibold text-primary">
          Try the fully stocked demo instead
        </Link>
      )}
    </main>
  );
}
