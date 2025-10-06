"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2,
  X,
  Expand,
  Shrink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// --- Стили для анимации ---
const styles = `
.pdf-image-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}
.pdf-fullscreen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
}
@keyframes fadeIn {
    from { opacity: 0.4; }
    to { opacity: 1; }
}
`;

interface PDFViewerProps {
  url: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageCanvas, setPageCanvas] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [cachedPages, setCachedPages] = useState<{ [key: number]: string }>({});
  const [isSlideshow, setIsSlideshow] = useState(false);

  const slideshowSpeed = 5;
  const autoStartSlideshow = false;

  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const renderQueue = useRef(new Set());

  const { toast } = useToast();

  useEffect(() => {
    if (window.pdfjsLib) return;

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !window.pdfjsLib || pageNum < 1 || pageNum > totalPages)
        return;
      if (cachedPages[pageNum] || renderQueue.current.has(pageNum)) return;

      try {
        renderQueue.current.add(pageNum);
        const page = await pdfDoc.getPage(pageNum);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Динамический расчет масштаба в зависимости от размера экрана
        const pixelRatio = window.devicePixelRatio || 1;
        const screenWidth = window.innerWidth;

        // Увеличиваем масштаб для больших экранов
        let scale = 2.0; // базовый масштаб
        if (screenWidth > 1920) {
          scale = 3.5; // для 4K мониторов
        } else if (screenWidth > 1440) {
          scale = 3.0; // для 2K мониторов
        } else if (screenWidth > 1024) {
          scale = 2.5; // для Full HD мониторов
        }

        // Учитываем pixel ratio для Retina дисплеев
        scale = scale * pixelRatio;

        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        // Увеличиваем качество JPEG до 0.95 для лучшего качества
        const dataURL = canvas.toDataURL("image/jpeg", 0.95);
        setCachedPages((prev) => ({ ...prev, [pageNum]: dataURL }));
      } catch (err) {
        console.error(`Ошибка рендеринга страницы ${pageNum}:`, err);
        toast({
          title: "Xatolik",
          description: `Sahifani render qilishda xatolik yuz berdi: ${pageNum}`,
          variant: "destructive",
        });
      } finally {
        renderQueue.current.delete(pageNum);
      }
    },
    [pdfDoc, totalPages, cachedPages, toast],
  );

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const stopSlideshow = useCallback(() => {
    setIsSlideshow(false);
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
  }, []);

  const startSlideshow = useCallback(() => {
    if (totalPages <= 1 || isSlideshow) return;
    stopSlideshow();
    setIsSlideshow(true);
    slideshowIntervalRef.current = setInterval(() => {
      setCurrentPage((prev) => {
        if (prev >= totalPages) {
          stopSlideshow();
          return prev;
        }
        return prev + 1;
      });
    }, slideshowSpeed * 1000);
  }, [slideshowSpeed, totalPages, isSlideshow, stopSlideshow]);

  const toggleSlideshow = useCallback(() => {
    if (isSlideshow) stopSlideshow();
    else startSlideshow();
  }, [isSlideshow, startSlideshow, stopSlideshow]);

  const toggleFullscreen = useCallback(() => {
    const elem = presentationRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => console.error(err));
      setIsPresentationMode(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsPresentationMode(false);
    }
  }, []);

  const loadPDF = useCallback(
    async (fileUrl: string) => {
      if (!fileUrl || !fileUrl.trim()) {
        setError("URL-адрес PDF не предоставлен.");
        setIsLoading(false);
        return;
      }
      if (!window.pdfjsLib) {
        setTimeout(() => loadPDF(fileUrl), 100);
        return;
      }

      setIsLoading(true);
      setError("");
      setCachedPages({});
      setPageCanvas(null);
      setCurrentPage(1);
      setPdfDoc(null);

      try {
        const pdf = await window.pdfjsLib.getDocument(fileUrl).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (err) {
        console.error("Ошибка загрузки PDF:", err);
        setError(
          "Не удалось загрузить PDF. Проверьте URL или CORS-политику сервера.",
        );
        toast({
          title: "Xatolik",
          description:
            "PDF faylni yuklab bo'lmadi. URL manzilini yoki serverning CORS siyosatini tekshiring.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (url) {
      loadPDF(url);
    } else {
      setIsLoading(false);
      setError("URL для PDF не был передан компоненту.");
    }
  }, [url, loadPDF]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresentationMode(false);
        stopSlideshow();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [stopSlideshow]);

  useEffect(() => {
    if (!totalPages) return;
    if (cachedPages[currentPage]) {
      setPageCanvas(cachedPages[currentPage]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      renderPage(currentPage);
    }
  }, [currentPage, cachedPages, totalPages, renderPage]);

  useEffect(() => {
    if (!pdfDoc) return;
    if (currentPage + 1 <= totalPages) renderPage(currentPage + 1);
    if (currentPage - 1 > 0) renderPage(currentPage - 1);
  }, [currentPage, pdfDoc, totalPages, renderPage]);

  useEffect(() => {
    const presentationElement = presentationRef.current;
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPreviousPage();
          break;
        case "ArrowRight":
          goToNextPage();
          break;
        case "Escape":
          if (isPresentationMode) toggleFullscreen();
          else onClose();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case " ":
          e.preventDefault();
          toggleSlideshow();
          break;
        default:
          break;
      }
    };
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const swipeDistance = e.changedTouches[0].clientX - touchStartX.current;
      if (swipeDistance > 50) goToPreviousPage();
      else if (swipeDistance < -50) goToNextPage();
      touchStartX.current = null;
    };
    document.addEventListener("keydown", handleKeyPress);
    presentationElement?.addEventListener("touchstart", handleTouchStart);
    presentationElement?.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      presentationElement?.removeEventListener("touchstart", handleTouchStart);
      presentationElement?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isPresentationMode,
    goToPreviousPage,
    goToNextPage,
    toggleFullscreen,
    toggleSlideshow,
    onClose,
  ]);

  const renderContent = () => {
    if (isLoading && !pageCanvas) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Hujjat yuklanmoqda...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Xatolik</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (pageCanvas) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center">
            <img
              key={currentPage}
              src={pageCanvas}
              alt={`Sahifa ${currentPage} / ${totalPages}`}
              className={`pdf-image-fade-in ${isPresentationMode ? "pdf-fullscreen" : ""}`}
              style={{
                objectFit: "contain",
                touchAction: "none",
              }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <style>{styles}</style>
      <div
        ref={presentationRef}
        className={`bg-background ${isPresentationMode ? "fixed inset-0 z-50" : "relative"}`}
      >
        <Card
          className={`w-full h-full flex flex-col ${isPresentationMode ? "border-0 rounded-none" : ""}`}
        >
          {!isPresentationMode && (
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle>Hujjatni ko'rish</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={toggleFullscreen}
                    className="bg-[#387B66] text-white"
                  >
                    {isPresentationMode ? (
                      <Shrink className="h-8 w-8" />
                    ) : (
                      <Expand className="h-8 w-8" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-[#387B66] text-white"
                    onClick={onClose}
                  >
                    <X className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          )}
          <CardContent className="flex-grow overflow-hidden p-0">
            {renderContent()}
          </CardContent>
          {!isPresentationMode && (
            <CardFooter className="flex-shrink-0 flex items-center justify-center gap-4 p-4">
              <Button
                variant="outline"
                size="lg"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button variant="outline" onClick={toggleSlideshow}>
                {isSlideshow ? (
                  <Pause className="h-5 w-5 mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {isSlideshow ? "Pauza" : "Boshlash"}
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardFooter>
          )}
          {isPresentationMode && (
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleFullscreen}
                className="bg-[#387B66] text-white"
              >
                <Shrink className="h-10 w-10" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default PDFViewer;
