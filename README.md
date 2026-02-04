# ChatDocs

A modern web-based GUI for managing OpenAI's Vector Stores and File Search (RAG) API. Upload documents, manage vector stores, and test retrieval via an integrated chat playground using GPT-4 Turbo.

## Features

- **Vector Store Management** - Create, list, and delete vector stores
- **Document Uploads** - Drag-and-drop file uploads to vector stores
- **Async Processing** - Real-time status monitoring for document ingestion
- **RAG Playground** - Chat interface with model selection and citation display
- **File Search Integration** - Powered by OpenAI's Assistants API with file search

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd chatdocs
   npm install
   ```

2. **Configure API key**

   Create a `.env.local` file and add your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys):
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Run**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** TanStack Query
- **SDK:** openai

## Project Structure

```
app/
├── page.tsx                     # Dashboard - store grid
├── stores/[storeId]/page.tsx    # Store detail - docs + chat
└── api/
    ├── stores/                  # Store CRUD endpoints
    └── chat/                    # RAG chat endpoint

components/
├── chat/                        # Chat interface components
│   ├── chat-playground.tsx      # Main chat UI
│   └── citation-display.tsx     # Citation renderer
├── documents/                   # Document management
│   ├── document-list.tsx        # Documents table
│   ├── upload-dialog.tsx        # Upload with config
│   ├── chunking-config.tsx      # Chunking settings
│   └── metadata-editor.tsx      # Document metadata
├── layout/                      # App layout components
│   ├── sidebar.tsx              # Navigation sidebar
│   └── providers.tsx            # Query provider
├── stores/                      # Store management
│   ├── store-card.tsx           # Store display card
│   ├── create-store-dialog.tsx  # Create store modal
│   └── delete-store-dialog.tsx  # Delete store modal
└── ui/                          # shadcn/ui components
└── citation-display.tsx         # Source citations

hooks/
├── use-stores.ts                # Store queries/mutations
├── use-documents.ts             # Document + upload hooks
└── use-chat.ts                  # Chat mutation
```

## Supported File Types

PDF, TXT, MD, CSV, JSON, DOCX, XLSX, and 100+ other formats. Max file size: 100MB.

## Documentation

- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [OpenAI File Search](https://platform.openai.com/docs/assistants/tools/file-search)
- [Vector Stores API](https://platform.openai.com/docs/api-reference/vector-stores)

## License

MIT

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by OpenAI. "OpenAI," "GPT," and related trademarks are property of OpenAI.
