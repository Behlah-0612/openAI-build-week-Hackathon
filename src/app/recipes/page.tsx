import Link from "next/link";
import { RecipeGenerator } from "@/components/recipe-generator";
export default function Recipes() { return <main className="p-5"><Link href="/dashboard" className="text-sm font-semibold text-herb">← Home</Link><h1 className="mt-5 text-3xl font-bold">What can I cook?</h1><p className="mt-2 text-ink/60">Three ideas based on your pantry, not a perfect grocery haul.</p><RecipeGenerator /></main>; }
