"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";

const EditorPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get("id") || "";
  const fileName = searchParams.get("name") || "";
  const mode = searchParams.get("mode") || "edit"; // По умолчанию режим редактирования
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [wopiData, setWopiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fileId) {
      loadWopiData();
    }
  }, [fileId, mode]); // Добавили mode в зависимости

  const loadWopiData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading WOPI data for file:", fileId, "mode:", mode);
      const response = await apiClient.getWOPIEditorUrl(fileId);

      if (response.success && response.data) {
        console.log("WOPI Data received:", response.data);
        setWopiData(response.data);
      } else {
        console.error("WOPI Error:", response.error);
        setError(response.error || "WOPI ma'lumotlarini yuklashda xatolik");
      }
    } catch (err) {
      console.error("Error loading WOPI data:", err);
      setError("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(wopiData, "WOPI data");

  useEffect(() => {
    if (wopiData && iframeRef.current) {
      // 🔧 ИСПРАВЛЕНО: Формируем WOPI_SRC с токеном И permission
      const permission = mode === "edit" ? "edit" : "view";
      console.log(wopiData.accessToken, "accessToken");
      const WOPI_SRC = `${wopiData.wopiSrc}?access_token=${wopiData.accessToken}&permission=${permission}`;

      // Формируем URL для Collabora Office
      const COLLABORA_URL = `https://present-office.nordicuniversity.org/browser/e808afa229/cool.html?WOPISrc=${encodeURIComponent(WOPI_SRC)}`;

      console.log("🔑 Mode:", mode);
      console.log("📄 WOPI_SRC:", WOPI_SRC);
      console.log("🌐 Collabora URL:", COLLABORA_URL);

      // Устанавливаем URL в iframe
      iframeRef.current.src = COLLABORA_URL;
    }
  }, [wopiData, mode]); // Добавили mode в зависимости

  const handleGoBack = () => {
    router.back();
  };

  if (!fileId) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Fayl ID topilmadi. URL'da id parametri bo'lishi kerak.
          </AlertDescription>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Button>
        </Alert>
      </div>
    );
  }

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
            <p className="text-sm text-muted-foreground">
              Collabora Office muharriri tayyorlanmoqda
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <br />
            <span className="text-sm text-muted-foreground mt-2 block">
              Iltimos, qaytadan urinib ko'ring yoki orqaga qaytib boshqa faylni
              tanlang.
            </span>
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={loadWopiData}>
              Qayta urinish
            </Button>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Button>

            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate max-w-md">
                {fileName || "Hujjat"}
              </h2>
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

      {/* Editor iframe */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full border-0"
          title={`Editing ${fileName}`}
          allow="clipboard-read; clipboard-write"
          // 🔧 ДОБАВЛЕНО: Принудительная перезагрузка при смене режима
          key={`${fileId}-${mode}`}
        />
      </div>
    </div>
  );
};

export default EditorPage;
