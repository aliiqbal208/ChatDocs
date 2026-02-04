"use client";

import React, { useState, useCallback } from "react";
import { useUploadDocument } from "@/hooks/use-documents";
import { ChunkingConfig, CustomMetadata } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChunkingConfigForm } from "@/components/documents/chunking-config";
import { MetadataEditor } from "@/components/documents/metadata-editor";
import { Upload, Loader2, FileUp, X } from "lucide-react";
import { toast } from "sonner";

interface UploadDialogProps {
  storeId: string;
}

export function UploadDialog({ storeId }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [chunkingConfig, setChunkingConfig] = useState<ChunkingConfig>({});
  const [customMetadata, setCustomMetadata] = useState<CustomMetadata[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const { upload, uploading, polling, reset } = useUploadDocument();

  const resetForm = useCallback(() => {
    setFiles([]);
    setDisplayNames({});
    setChunkingConfig({});
    setCustomMetadata([]);
    setUploadingFiles(new Set());
    reset();
  }, [reset]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    if (droppedFiles.length > 0) {
      setFiles((prev: File[]) => [...prev, ...droppedFiles]);
      // Set default display names for new files
      const newDisplayNames: Record<string, string> = {};
      droppedFiles.forEach(f => {
        newDisplayNames[f.name] = f.name;
      });
      setDisplayNames((prev: Record<string, string>) => ({ ...prev, ...newDisplayNames }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length > 0) {
      setFiles((prev: File[]) => [...prev, ...selectedFiles]);
      // Set default display names for new files
      const newDisplayNames: Record<string, string> = {};
      selectedFiles.forEach(f => {
        newDisplayNames[f.name] = f.name;
      });
      setDisplayNames((prev: Record<string, string>) => ({ ...prev, ...newDisplayNames }));
    }
  };

  const removeFile = (fileName: string) => {
    setFiles((prev: File[]) => prev.filter((f: File) => f.name !== fileName));
    setDisplayNames((prev: Record<string, string>) => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    try {
      // Upload files sequentially
      for (const file of files) {
        setUploadingFiles((prev: Set<string>) => new Set(prev).add(file.name));
        
        await upload({
          storeId,
          file,
          config: {
            displayName: displayNames[file.name] || file.name,
            chunkingConfig:
              chunkingConfig.maxTokensPerChunk || chunkingConfig.maxOverlapTokens
                ? chunkingConfig
                : undefined,
            customMetadata: customMetadata.length > 0 ? customMetadata : undefined,
          },
        });
        
        setUploadingFiles((prev: Set<string>) => {
          const updated = new Set(prev);
          updated.delete(file.name);
          return updated;
        });
      }
      
      toast.success(`Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`);
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload documents"
      );
    }
  };

  const isProcessing = uploading || polling || uploadingFiles.size > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen: boolean) => {
        if (!isProcessing) {
          setOpen(newOpen);
          if (!newOpen) {
            resetForm();
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload one or more files to this vector store. Supports PDF, TXT, MD,
            and many other formats (max 100MB per file).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : files.length > 0
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {files.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <FileUp className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 px-1">
                    {files.map((file: File) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-2 bg-white p-3 rounded border text-sm shadow-sm"
                      >
                        <FileUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{file.name}</div>
                          <div className="text-slate-500 text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.name)}
                          className="h-8 w-8 p-0 flex-shrink-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t">
                    <label className="inline-block">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <span className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-sm font-medium">
                        + Add more files
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <>
                  <FileUp className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600 mb-2">
                    Drag and drop files here, or
                  </p>
                  <label>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <span className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-medium">
                      browse to select
                    </span>
                  </label>
                </>
              )}
            </div>

            {/* Note about shared settings */}
            {files.length > 1 && (
              <div className="text-sm text-slate-600 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start gap-2">
                <span className="text-lg flex-shrink-0">📝</span>
                <span>
                  The chunking configuration and metadata settings below will be applied to all {files.length} files.
                </span>
              </div>
            )}

            {/* Advanced options */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="chunking">
                <AccordionTrigger className="text-sm font-medium">
                  Chunking Configuration
                </AccordionTrigger>
                <AccordionContent>
                  <ChunkingConfigForm
                    value={chunkingConfig}
                    onChange={setChunkingConfig}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="metadata">
                <AccordionTrigger className="text-sm font-medium">
                  Custom Metadata
                </AccordionTrigger>
                <AccordionContent>
                  <MetadataEditor
                    value={customMetadata}
                    onChange={setCustomMetadata}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={files.length === 0 || isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {uploading || uploadingFiles.size > 0
                ? `Uploading (${Array.from(uploadingFiles).length}/${files.length})...`
                : polling
                ? "Processing..."
                : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
