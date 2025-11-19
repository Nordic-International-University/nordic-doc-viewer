"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, AlertCircle, Edit3, Lock } from "lucide-react";
import { apiClient } from "@/lib/api";

interface CollaboraEditorProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

export function CollaboraEditor({ fileId, fileName, onClose }: CollaboraEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [wopiData, setWopiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEditor();
  }, [fileId]);

  const loadEditor = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getWOPIEditorUrl(fileId);

      if (response.success && response.data) {
        console.log("WOPI Data:", response.data);
        setWopiData(response.data);

        // Формируем URL для Collabora Office
        const WOPI_SRC = `${response.data.wopiSrc}?access_token=${response.data.accessToken}`;
        const COLLABORA_URL = `https://office.nordicuniversity.org/browser/e808afa229/cool.html?WOPISrc=${encodeURIComponent(WOPI_SRC)}`;

        console.log("WOPI_SRC:", WOPI_SRC);
        console.log("Collabora URL:", COLLABORA_URL);

        // Устанавливаем URL в iframe
        if (iframeRef.current) {
          iframeRef.current.src = COLLABORA_URL;
        }
      } else {
        setError(response.error || "Muharrir URL ni olishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Error loading editor:", err);
      setError("Muharrirni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header Skeleton */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>

        {/* Editor Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <p className="text-muted-foreground">Hujjat yuklanmoqda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md mx-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                Iltimos, qaytadan urinib ko'ring
              </span>
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={loadEditor}>
                Qayta urinish
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Yopish
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{fileName}</h2>
              <Badge variant="outline" className="font-medium">
                <Edit3 className="mr-1 h-3 w-3" />
                Tahrirlash
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="px-4 pb-3 max-w-screen-2xl mx-auto">
          <Alert className="py-2">
            <AlertDescription className="text-sm">
              Collabora Office muharriri. Barcha o'zgarishlar avtomatik saqlanadi.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title={`Editing ${fileName}`}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
