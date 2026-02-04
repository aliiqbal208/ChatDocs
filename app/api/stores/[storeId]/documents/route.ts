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

    // Fetch file details for each file to get size and other metadata
    const documents: FileSearchDocument[] = await Promise.all(
      response.data.map(async (file) => {
        try {
          // Retrieve the actual file details from OpenAI Files API
          const fileDetails = await openai.files.retrieve(file.id);
          
          return {
            name: `vectorStores/${storeId}/files/${file.id}`,
            displayName: fileDetails.filename || file.id,
            createTime: new Date(file.created_at * 1000).toISOString(),
            updateTime: new Date(file.created_at * 1000).toISOString(),
            state: file.status === "completed" ? "STATE_ACTIVE" : 
                   file.status === "in_progress" ? "STATE_PENDING" :
                   file.status === "failed" ? "STATE_FAILED" : "STATE_UNSPECIFIED",
            sizeBytes: fileDetails.bytes?.toString() || "0",
            mimeType: undefined, // OpenAI doesn't provide mime type
            customMetadata: [],
          };
        } catch (fileError) {
          console.error(`Error fetching file details for ${file.id}:`, fileError);
          // Fallback if file details fetch fails
          return {
            name: `vectorStores/${storeId}/files/${file.id}`,
            displayName: file.id,
            createTime: new Date(file.created_at * 1000).toISOString(),
            updateTime: new Date(file.created_at * 1000).toISOString(),
            state: file.status === "completed" ? "STATE_ACTIVE" : 
                   file.status === "in_progress" ? "STATE_PENDING" :
                   file.status === "failed" ? "STATE_FAILED" : "STATE_UNSPECIFIED",
            sizeBytes: "0",
            mimeType: undefined,
            customMetadata: [],
          };
        }
      })
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    const message = error instanceof Error ? error.message : "Failed to list documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
