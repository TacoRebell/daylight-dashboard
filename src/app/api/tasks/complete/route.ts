import { NextResponse } from "next/server";
import { completeTask } from "@/lib/google";

// WRONG: export default async function POST...
// CORRECT: export async function POST...

export async function POST(request: Request) {
  const body = await request.json();
  const { listId, taskId } = body;

  if (!listId || !taskId) {
    return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
  }

  const success = await completeTask(listId, taskId);
  
  if (success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Failed to update Google" }, { status: 500 });
  }
}