import { NextResponse } from "next/server";
import { completeTask } from "@/lib/google";

export async function POST(request: Request) {
  let body: { listId?: unknown; taskId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listId, taskId } = body ?? {};
  if (typeof listId !== "string" || typeof taskId !== "string" || !listId || !taskId) {
    return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
  }

  // Block cross-site requests: the dashboard's own fetch is same-origin, so a
  // browser-initiated request from another origin is never legitimate.
  const origin = request.headers.get("origin");
  if (origin && origin.replace(/^[a-z]+:\/\//i, "") !== request.headers.get("host")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const success = await completeTask(listId, taskId);

  if (success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Failed to update Google" }, { status: 500 });
  }
}
