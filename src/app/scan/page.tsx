import Link from "next/link";
import { ReceiptScanner } from "@/components/receipt-scanner";
export default function Scan() { return <main className="p-5"><Link href="/dashboard" className="text-sm font-semibold text-herb">← Home</Link><h1 className="mt-5 text-3xl font-bold">Scan a receipt</h1><p className="mt-2 text-ink/60">I’ll suggest items, then you stay in control.</p><ReceiptScanner /></main>; }
