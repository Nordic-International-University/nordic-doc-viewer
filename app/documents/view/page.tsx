"use client";

import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { FilePreview } from "@/components/document-viewer";
import PdfViewer from "@/components/pdf-viewer"; // Убедитесь, что PdfViewer принимает пропс `url`

export default function DocumentViewPage() {
    const params = useSearchParams();

    const doc = {
        name: params.get("name") || "",
        type: params.get("type") || "",
        url: params.get("url") || "",
        fileType: params.get("fileType") || "",
        size: Number(params.get("size")) || 0,
        created_at: params.get("created") || "",
    };

    // Получаем расширение файла из его имени
    console.log(doc)

    return (
        <>
            <AppHeader />

            {/* Контейнер для центрирования содержимого */}
            <div style={{ padding: '20px' }}>
                {/* Проверяем расширение файла */}
                { doc.fileType=== "application/pdf" ? (
                    // Если это PDF, показываем PdfViewer
                        <PdfViewer url={doc.url} onClose={function (): void {
                            throw new Error("Function not implemented.");
                        }} />

                ) : (
                    // Для всех остальных файлов показываем FilePreview
                    <FilePreview
                        name={doc.name}
                        url={doc.url}
                        size={doc.size}

                    />
                )}
            </div>
        </>
    );
}