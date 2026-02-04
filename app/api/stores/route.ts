// filepath: /Users/mali8/M-Ali/chatdocs/app/api/stores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai-client";
import { FileSearchStore } from "@/lib/types";

export async function GET() {
  try {
    const openai = getOpenAI();
    const response = await openai.vectorStores.list();

    const stores: FileSearchStore[] = response.data.map((store) => ({
      name: `vectorStores/${store.id}`,
      displayName: store.name || store.id,
      createTime: new Date(store.created_at * 1000).toISOString(),
      updateTime: new Date(store.created_at * 1000).toISOString(),
      activeDocumentsCount: store.file_counts?.completed?.toString() || "0",
      pendingDocumentsCount: store.file_counts?.in_progress?.toString() || "0",
      failedDocumentsCount: store.file_counts?.failed?.toString() || "0",
      sizeBytes: (store.usage_bytes || 0).toString(),
    }));

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Error listing stores:", error);
    const message = error instanceof Error ? error.message : "Failed to list stores";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const body = await request.json();
    const { displayName } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "displayName is required" },
        { status: 400 }
      );
    }

    const vectorStore = await openai.vectorStores.create({
      name: displayName,
    });

    const store: FileSearchStore = {
      name: `vectorStores/${vectorStore.id}`,
      displayName: vectorStore.name || vectorStore.id,
      createTime: new Date(vectorStore.created_at * 1000).toISOString(),
      updateTime: new Date(vectorStore.created_at * 1000).toISOString(),
      activeDocumentsCount: "0",
      pendingDocumentsCount: "0",
      failedDocumentsCount: "0",
      sizeBytes: "0",
    };

    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error creating store:", error);
    const message = error instanceof Error ? error.message : "Failed to create store";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
