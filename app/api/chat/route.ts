// filepath: /Users/mali8/M-Ali/chatdocs/app/api/chat/route.ts
import { NextRequest } from "next/server";
import { getOpenAI, DEFAULT_MODEL } from "@/lib/ai-client";
import { ChatRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAI();
    const body: ChatRequest = await request.json();
    const { storeId, messages, model = DEFAULT_MODEL } = body;

    if (!storeId) {
      return new Response(JSON.stringify({ error: "storeId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create or get assistant with file search
    const assistant = await openai.beta.assistants.create({
      model: model,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [storeId],
        },
      },
    });

    // Create thread with messages
    const thread = await openai.beta.threads.create({
      messages: messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    });

    // Stream the response
    const stream = await openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistant.id,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const citations: Array<{ uri?: string; title?: string; text?: string }> = [];

          for await (const event of stream) {
            // Handle text deltas
            if (event.event === "thread.message.delta") {
              const delta = event.data.delta;
              if (delta.content) {
                for (const content of delta.content) {
                  if (content.type === "text" && content.text?.value) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "text", content: content.text.value })}\n\n`
                      )
                    );
                  }
                }
              }
            }

            // Handle completed messages to extract citations
            if (event.event === "thread.message.completed") {
              const message = event.data;
              if (message.content) {
                for (const content of message.content) {
                  if (content.type === "text" && content.text?.annotations) {
                    for (const annotation of content.text.annotations) {
                      if (annotation.type === "file_citation") {
                        const fileCitation = annotation.file_citation;
                        citations.push({
                          uri: `file://${fileCitation.file_id}`,
                          title: fileCitation.file_id,
                          text: annotation.text || "",
                        });
                      }
                    }
                  }
                }
              }
            }
          }

          // Send final message with citations
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                citations: citations.map((c) => ({ retrievedContext: c })),
              })}\n\n`
            )
          );
          controller.close();

          // Clean up assistant after completion
          await openai.beta.assistants.del(assistant.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat:", error);
    const message = error instanceof Error ? error.message : "Failed to generate response";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
