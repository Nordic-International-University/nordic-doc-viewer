"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import JSZip from "jszip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Download,
  ExternalLink,
  Archive,
  ImageIcon,
  Video,
  Music,
  FileSpreadsheet,
  FileCode,
  File,
  Play,
  AlertCircle,
  Maximize2,
  X,
} from "lucide-react";
import PDFViewer from "@/components/pdf-viewer";
import { PptxViewer } from "@/components/ui/pptPrewiev";

/* ───────── 1. Динамические импорты с правильной типизацией ───────── */
const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    ),
  },
);

/* ───────── 2. Тип пропсов ───────── */
type FilePreviewProps = {
  url: string;
  name: string;
  size?: number;
};

/* ───────── 3. Утилитарные функции ───────── */
const getFileIcon = (ext: string) => {
  const imageTypes = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"];
  const videoTypes = ["mp4", "webm", "ogg", "avi", "mov", "wmv"];
  const audioTypes = ["mp3", "wav", "ogg", "m4a", "aac"];
  const spreadsheetTypes = ["csv", "xls", "xlsx"];
  const codeTypes = [
    "js",
    "ts",
    "jsx",
    "tsx",
    "json",
    "css",
    "html",
    "php",
    "py",
    "java",
    "cpp",
    "c",
  ];
  const archiveTypes = ["zip", "rar", "7z", "tar", "gz"];
  const textTypes = ["txt", "md", "rtf"];

  if (imageTypes.includes(ext)) return ImageIcon;
  if (videoTypes.includes(ext)) return Video;
  if (audioTypes.includes(ext)) return Music;
  if (spreadsheetTypes.includes(ext)) return FileSpreadsheet;
  if (codeTypes.includes(ext)) return FileCode;
  if (archiveTypes.includes(ext)) return Archive;
  if (textTypes.includes(ext)) return FileText;
  return File;
};

const getFileTypeColor = (ext: string) => {
  const imageTypes = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"];
  const videoTypes = ["mp4", "webm", "ogg", "avi", "mov", "wmv"];
  const audioTypes = ["mp3", "wav", "ogg", "m4a", "aac"];
  const spreadsheetTypes = ["csv", "xls", "xlsx"];
  const codeTypes = [
    "js",
    "ts",
    "jsx",
    "tsx",
    "json",
    "css",
    "html",
    "php",
    "py",
    "java",
    "cpp",
    "c",
  ];
  const archiveTypes = ["zip", "rar", "7z", "tar", "gz"];
  const pdfTypes = ["pdf"];
  const officeTypes = ["doc", "docx", "ppt", "pptx"];

  if (imageTypes.includes(ext))
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (videoTypes.includes(ext))
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  if (audioTypes.includes(ext))
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (spreadsheetTypes.includes(ext))
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
  if (codeTypes.includes(ext))
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  if (archiveTypes.includes(ext))
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (pdfTypes.includes(ext))
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (officeTypes.includes(ext))
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
};

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

/* ───────── 4. Компонент ───────── */
export function FilePreview({ url, name, size }: FilePreviewProps) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  const FileIcon = getFileIcon(ext);

  const [zipEntries, setZipEntries] = useState<string[] | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  /* ―― ZIP: читаем список файлов ―― */
  useEffect(() => {
    if (ext === "zip") {
      setIsLoading(true);
      setLoadError(false);
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.arrayBuffer();
        })
        .then((buf) => JSZip.loadAsync(buf))
        .then((zip) => {
          const entries = Object.keys(zip.files).filter(
            (path) => !zip.files[path].dir,
          );
          setZipEntries(entries);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("ZIP loading error:", error);
          setZipEntries([]);
          setLoadError(true);
          setIsLoading(false);
        });
    }
  }, [url, ext]);

  /* ―― plain-text / исходники / CSV ―― */
  useEffect(() => {
    const textTypes = [
      "txt",
      "js",
      "ts",
      "php",
      "jsx",
      "tsx",
      "json",
      "md",
      "css",
      "html",
      "csv",
      "py",
      "java",
      "cpp",
      "c",
    ];
    if (textTypes.includes(ext)) {
      setIsLoading(true);
      setLoadError(false);
      fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
        .then((content) => {
          setTextContent(content);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Text file loading error:", error);
          setLoadError(true);
          setIsLoading(false);
        });
    }
  }, [url, ext]);

  /* ―― Полноэкранный модальный компонент ―― */
  const FullscreenModal = ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-full max-h-full overflow-auto">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-screen-xl max-h-screen overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );

  /* ―― Компонент заголовка файла ―― */
  const FileHeader = ({
    showFullscreen = false,
  }: {
    showFullscreen?: boolean;
  }) => (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between max-md:flex-col max-md:gap-4">
        <div className="flex items-center gap-2 mt-1 justify-around max-md:flex-col  ">
          <div className=" rounded-lg bg-muted max-md:hidden">
            <FileIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg font-semibold truncate">
            {name}
          </CardTitle>
          <Badge variant="secondary" className={getFileTypeColor(ext)}>
            {ext.toUpperCase()}
          </Badge>
          {size && (
            <span className="text-sm text-muted-foreground">
              {formatFileSize(size)}
            </span>
          )}
        </div>

        <div className="flex space-x-2 flex-shrink-0">
          {showFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ochish
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href={url} download={name}>
              <Download className="h-4 w-4 mr-2" />
              Yuklab olish
            </a>
          </Button>
        </div>
      </div>
    </CardHeader>
  );

  /* ―― Компонент загрузки ―― */
  const LoadingState = ({ message }: { message: string }) => (
    <Card className="w-full">
      <FileHeader />
      <CardContent>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /* ―― Компонент ошибки ―― */
  const ErrorState = ({ message }: { message: string }) => (
    <Card className="w-full">
      <FileHeader />
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  /* ───────── 5. Роутинг по типам ───────── */

  /* ZIP */
  if (ext === "zip" || ext === "rar" || ext === "7z") {
    if (isLoading) return <LoadingState message="Arxiv yuklanmoqda..." />;
    if (loadError) return <ErrorState message="Arxivni ochib bo'lmadi." />;

    return (
      <Card className="w-full">
        <FileHeader />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Arxiv ichidagi fayllar</h4>
              <Badge variant="outline">{zipEntries?.length || 0} ta fayl</Badge>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <div className="p-4 space-y-2">
                {zipEntries && zipEntries.length > 0 ? (
                  zipEntries.map((path, index) => (
                    <div
                      key={`${path}-${index}`}
                      className="flex items-center space-x-2 text-sm py-1"
                    >
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{path}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Arxivda fayllar topilmadi
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* Изображения */
  const imageTypes = ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"];
  if (imageTypes.includes(ext)) {
    const ImageContent = () => (
      <div className="flex justify-center">
        {!imageError ? (
          <img
            src={url}
            alt={name}
            className="max-w-full h-auto rounded-lg shadow-sm border"
            style={{ maxHeight: "600px" }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p>Rasmni yuklab bo'lmadi</p>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <>
        <Card className="w-full">
          <FileHeader showFullscreen={!imageError} />
          <CardContent>
            <ImageContent />
          </CardContent>
        </Card>

        {isFullscreen && !imageError && (
          <FullscreenModal onClose={() => setIsFullscreen(false)}>
            <div className="p-4">
              <ImageContent />
            </div>
          </FullscreenModal>
        )}
      </>
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  /* Видео */
  const videoTypes = ["mp4", "webm", "ogg", "avi", "mov", "wmv"];
  if (videoTypes.includes(ext)) {
    return (
      <Card className="w-full">
        <FileHeader showFullscreen />
        <CardContent>
          <div className="relative">
            <video
              ref={videoRef}
              src={url}
              controls
              className="w-full rounded-lg shadow-sm"
              style={{ maxHeight: "600px" }}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
              onError={() => console.error("Video loading error")}
            >
              Brauzeringiz video faylni qo'llab-quvvatlamaydi.
            </video>
            {!isVideoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => videoRef.current?.play()}
                >
                  <Play className="h-12 w-12 text-white" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* Аудио */
  const audioTypes = ["mp3", "wav", "ogg", "m4a", "aac"];
  if (audioTypes.includes(ext)) {
    return (
      <Card className="w-full">
        <FileHeader />
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-md space-y-4">
              <div className="flex items-center justify-center">
                <Music className="h-24 w-24 text-muted-foreground" />
              </div>
              <audio
                src={url}
                controls
                className="w-full"
                onError={() => console.error("Audio loading error")}
              >
                Brauzeringiz audio faylni qo'llab-quvvatlamaydi.
              </audio>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* Текст / исходники */
  const codeTypes = [
    "txt",
    "js",
    "ts",
    "php",
    "jsx",
    "tsx",
    "json",
    "md",
    "css",
    "html",
    "py",
    "java",
    "cpp",
    "c",
  ];
  if (codeTypes.includes(ext)) {
    if (isLoading) return <LoadingState message="Fayl yuklanmoqda..." />;
    if (loadError) return <ErrorState message="Faylni ochib bo'lmadi." />;

    return (
      <Card className="w-full">
        <FileHeader showFullscreen />
        <CardContent>
          <div className="rounded-lg overflow-hidden border">
            <SyntaxHighlighter
              language={ext === "txt" ? "text" : ext}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                fontSize: "14px",
                margin: 0,
                borderRadius: "0",
                maxHeight: "600px",
              }}
            >
              {textContent || ""}
            </SyntaxHighlighter>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* CSV fayllar */
  if (ext === "csv") {
    if (isLoading) return <LoadingState message="CSV fayl yuklanmoqda..." />;
    if (loadError) return <ErrorState message="CSV faylni ochib bo'lmadi." />;

    const rows = textContent?.split("\n").filter((row) => row.trim()) || [];
    const headers = rows[0]?.split(",") || [];
    const dataRows = rows.slice(1);

    return (
      <Card className="w-full overflow-hidden">
        <FileHeader showFullscreen />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">CSV ma'lumotlari</h4>
              <Badge variant="outline">{dataRows.length} qator</Badge>
            </div>
            <div className="rounded-lg border overflow-auto max-h-96">
              <table className="w-full min-w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-sm font-semibold border-r last:border-r-0 whitespace-nowrap"
                      >
                        {header.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.slice(0, 100).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t hover:bg-muted/50">
                      {row.split(",").map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-2 text-sm border-r last:border-r-0 whitespace-nowrap"
                        >
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dataRows.length > 100 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Faqat birinchi 100 qator ko'rsatildi. To'liq ma'lumot uchun
                  faylni yuklab oling.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const [showPdfViewer, setShowPdfViewer] = useState(true);
  /* PDF fayllar */
  if (ext === "pdf") {
    return (
      <div className="w-full h-full p-4 sm:p-8 md:p-12">
        <div className="max-w-7xl mx-auto">
          <PDFViewer url={url} onClose={() => setShowPdfViewer(false)} />
        </div>
      </div>
    );
  }

  const officeTypes = ["ppt", "pptx", "doc", "docx", "xls", "xlsx"];
  if (officeTypes.includes(ext)) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

    return (
      <Card className="w-full">
        <FileHeader showFullscreen />
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Office faylini ko'rish uchun Microsoft Office Online
                ishlatilmoqda.
              </AlertDescription>
            </Alert>
            <div
              className="rounded-lg border overflow-hidden bg-gray-100"
              style={{ height: "600px" }}
            >
              <iframe
                src={officeUrl}
                width="100%"
                height="100%"
                title={name}
                className="border-0"
                onError={() => console.error("Office iframe failed to load")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <FileHeader />
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <File className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h4 className="font-semibold text-lg">{name}</h4>
            <p className="text-muted-foreground">
              Bu fayl turini oldindan ko'rib bo'lmaydi
            </p>
            {size && (
              <p className="text-sm text-muted-foreground">
                Hajmi: {formatFileSize(size)}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ochish
              </a>
            </Button>
            <Button asChild>
              <a href={url} download={name}>
                <Download className="h-4 w-4 mr-2" />
                Yuklab olish
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
