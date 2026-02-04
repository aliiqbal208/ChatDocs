// filepath: /Users/mali8/M-Ali/chatdocs/app/api/stores/[storeId]/documents/[docId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai-client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; docId: string }> }
) {
  try {
    const openai = getOpenAI();
    const { storeId, docId } = await params;

    await openai.vectorStores.files.del(storeId, docId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    const message = error instanceof Error ? error.message : "Failed to delete document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
