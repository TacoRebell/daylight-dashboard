import { NextResponse } from "next/server";
import { getFamilyTasks } from "@/lib/google";

export const dynamic = 'force-dynamic';

export async function GET() {
  const tasks = await getFamilyTasks();
  return NextResponse.json(tasks);
}