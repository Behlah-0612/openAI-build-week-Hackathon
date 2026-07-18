import { NextResponse } from "next/server";
import { resetDemoAccount } from "@/lib/demo-seed";
export async function GET(request: Request) { if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await resetDemoAccount(); return NextResponse.json({ ok: true }); }
