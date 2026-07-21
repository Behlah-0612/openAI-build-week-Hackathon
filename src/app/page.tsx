import Link from "next/link";
import { ChefHat } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col justify-center p-6">
      <ChefHat className="text-primary" size={32} aria-hidden="true" />
      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-primary">PantryChef</p>
      <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight text-text">Cook more. Waste less.</h1>
      <p className="mt-5 text-lg text-muted-text">A personal chef for everything already in your kitchen.</p>
      <div className="mt-10 grid gap-3">
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Get started
        </Link>
        <Link href="/login?demo=1" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Try the demo
        </Link>
      </div>
    </main>
  );
}
