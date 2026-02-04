// filepath: /Users/mali8/M-Ali/chatdocs/app/api/stores/[storeId]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai-client";
import { FileSearchDocument } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const openai = getOpenAI();
    const { storeId } = await params;

    const response = await openai.vectorStores.files.list(storeId);

    const documents: FileSearchDocument[] = response.data.map((file) => ({
      name: `vectorStores/${storeId}/files/${file.id}`,
      displayName: file.id,
      createTime: new Date(file.created_at * 1000).toISOString(),
      updateTime: new Date(file.created_at * 1000).toISOString(),
      state: file.status === "completed" ? "STATE_ACTIVE" : 
             file.status === "in_progress" ? "STATE_PENDING" :
             file.status === "failed" ? "STATE_FAILED" : "STATE_UNSPECIFIED",
      sizeBytes: "0", // OpenAI doesn't provide file size in vector store files
      mimeType: undefined,
      customMetadata: [],
    }));

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    const message = error instanceof Error ? error.message : "Failed to list documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
