// filepath: /Users/mali8/M-Ali/chatdocs/app/api/stores/[storeId]/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai-client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const openai = getOpenAI();
    const { storeId } = await params;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const displayName = formData.get("displayName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Upload file to OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: "assistants",
    });

    // Add file to vector store
    await openai.vectorStores.files.create(storeId, {
      file_id: uploadedFile.id,
    });

    // Return operation with done: true to match existing UI behavior
    return NextResponse.json({
      operation: {
        name: `vectorStores/${storeId}/files/${uploadedFile.id}`,
        done: true,
        metadata: {
          fileId: uploadedFile.id,
          displayName: displayName || file.name,
        },
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
