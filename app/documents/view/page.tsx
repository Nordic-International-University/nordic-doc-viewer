"use client";

import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { FilePreview } from "@/components/document-viewer";

export default function DocumentViewPage() {
  const params = useSearchParams();

  const doc = {
    id: params.get("id") || undefined,
    name: params.get("name") || "",
    type: params.get("type") || "",
    url: params.get("url") || "",
    fileType: params.get("fileType") || "",
    size: Number(params.get("size")) || 0,
    created_at: params.get("created") || "",
  };

  return (
    <>
      <AppHeader />

      {/* Контейнер для центрирования содержимого */}
      <div style={{ padding: "20px" }}>
        {/* Все файлы теперь обрабатываются через FilePreview, включая PDF */}
        <FilePreview
          name={doc.name}
          url={doc.url}
          size={doc.size}
          fileId={doc.id}
        />
      </div>
    </>
  );
}
