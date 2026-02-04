// filepath: /Users/mali8/M-Ali/chatdocs/app/api/stores/[storeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const openai = getOpenAI();
    const { storeId } = await params;

    const vectorStore = await openai.vectorStores.retrieve(storeId);

    const store = {
      name: `vectorStores/${vectorStore.id}`,
      displayName: vectorStore.name || vectorStore.id,
      createTime: new Date(vectorStore.created_at * 1000).toISOString(),
      updateTime: new Date(vectorStore.created_at * 1000).toISOString(),
      activeDocumentsCount: vectorStore.file_counts?.completed?.toString() || "0",
      pendingDocumentsCount: vectorStore.file_counts?.in_progress?.toString() || "0",
      failedDocumentsCount: vectorStore.file_counts?.failed?.toString() || "0",
      sizeBytes: (vectorStore.usage_bytes || 0).toString(),
    };

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error getting store:", error);
    const message = error instanceof Error ? error.message : "Failed to get store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const openai = getOpenAI();
    const { storeId } = await params;

    await openai.vectorStores.del(storeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    const message = error instanceof Error ? error.message : "Failed to delete store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
