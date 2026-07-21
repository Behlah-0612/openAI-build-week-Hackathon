import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { Alert } from "@/components/ui/alert";

type SignupSearchParams = Promise<{ error?: string }>;

export default async function Signup({ searchParams }: { searchParams: SignupSearchParams }) {
  const { error } = await searchParams;

  return (
    <main className="p-6">
      <Link href="/" className="inline-flex min-h-11 items-center gap-1 -ml-1 px-1 text-sm font-semibold text-primary">
        <ChevronLeft size={16} aria-hidden="true" /> PantryChef
      </Link>
      <h1 className="mt-14 text-4xl font-bold tracking-tight text-text">Create your account</h1>
      <p className="mt-3 text-muted-text">Start tracking your kitchen and cooking with what you have.</p>

      {error && (
        <Alert variant="error" className="mt-6">
          {error}
        </Alert>
      )}

      <AuthForm mode="signup" />
    </main>
  );
}
