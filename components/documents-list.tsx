"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ImageIcon,
    Video,
    FileSpreadsheet,
    Presentation,
    Search,
    AlertCircle,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient, FileData, PaginationData } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DocumentsList() {
    const router = useRouter();
    const [documents, setDocuments] = useState<FileData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "filename" | "size">("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, [currentPage, searchTerm, sortBy, sortOrder]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.getFiles({
                page: currentPage,
                limit: 20,
                search: searchTerm || undefined,
                sortBy,
                sortOrder,
            });

            console.log("API Response:", response);

            if (response.success && response.data) {
                console.log("Files received:", response.data.files);
                console.log("Pagination:", response.data.pagination);
                setDocuments(response.data.files || []);
                setPagination(response.data.pagination);
            } else {
                console.error("API Error:", response.error);
                setError(response.error || "Fayllarni yuklashda xatolik");
                setDocuments([]);
                setPagination(null);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
            setError("Tarmoq xatosi");
            setDocuments([]);
            setPagination(null);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
        if (!type) return <ImageIcon className="h-5 w-5 text-primary" />;
        if (type.includes("image"))
            return <ImageIcon className="h-5 w-5 text-blue-500" />;
        if (type.includes("video"))
            return <Video className="h-5 w-5 text-purple-500" />;
        if (type.includes("spreadsheet") || type.includes("excel"))
            return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
        if (type.includes("presentation") || type.includes("powerpoint"))
            return <Presentation className="h-5 w-5 text-orange-500" />;
        return <ImageIcon className="h-5 w-5 text-primary" />;
    };

    const getFileTypeLabel = (type: string) => {
        if (!type) return "Hujjat";
        if (type.includes("image")) return "Rasm";
        if (type.includes("video")) return "Video";
        if (type.includes("spreadsheet") || type.includes("excel")) return "Excel";
        if (type.includes("presentation") || type.includes("powerpoint"))
            return "PowerPoint";
        if (type.includes("pdf")) return "PDF";
        if (type.includes("word")) return "Word";
        return "Hujjat";
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

    const isCollaboraDocument = (fileType: string, filename: string) => {
        // Все типы файлов, которые Collabora может открыть
        const collaboraTypes = [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
            "application/msword", // doc
            "application/vnd.ms-excel", // xls
            "application/vnd.ms-powerpoint", // ppt
            "application/pdf", // pdf
            "application/vnd.oasis.opendocument.text", // odt
            "application/vnd.oasis.opendocument.spreadsheet", // ods
            "application/vnd.oasis.opendocument.presentation", // odp
        ];

        // Проверяем по MIME типу или по расширению файла
        return collaboraTypes.some(type => fileType.includes(type)) ||
               /\.(docx?|xlsx?|pptx?|pdf|odt|ods|odp)$/i.test(filename);
    };

    const handleViewDocument = (doc: FileData) => {
        if (isCollaboraDocument(doc.fileType, doc.filename)) {
            // Для Collabora документов открываем в режиме редактирования (как в Word)
            router.push(`/editor?id=${doc.id}&name=${encodeURIComponent(doc.filename)}&mode=edit`);
        } else {
            // Для остальных - стандартный просмотр
            router.push(`/documents/view?id=${doc.id}&name=${doc.filename}&type=${doc.fileType}&url=${doc.fileUrl}&size=${doc.size}&created=${doc.createdAt}&fileType=${doc.fileType}`);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* DEBUG INFO - Удалите после отладки */}
            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="text-sm">🐛 Debug Information</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1">
                    <p><strong>Documents count:</strong> {documents.length}</p>
                    <p><strong>Is loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                    <p><strong>Error:</strong> {error || 'None'}</p>
                    <p><strong>Has pagination:</strong> {pagination ? 'Yes' : 'No'}</p>
                    {pagination && (
                        <p><strong>Pagination:</strong> Page {pagination.currentPage}/{pagination.totalPages}, Total: {pagination.totalItems}</p>
                    )}
                    {documents.length > 0 && (
                        <details>
                            <summary className="cursor-pointer font-semibold">First file data</summary>
                            <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
                                {JSON.stringify(documents[0], null, 2)}
                            </pre>
                        </details>
                    )}
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchDocuments}
                            className="ml-4"
                        >
                            Qayta urinish
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Hujjatlarni qidirish..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="px-3 py-2 border rounded-md bg-background"
                    >
                        <option value="createdAt">Yaratilgan sana</option>
                        <option value="updatedAt">O'zgartirilgan sana</option>
                        <option value="filename">Nom</option>
                        <option value="size">Hajmi</option>
                    </select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                        {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                </div>
            </div>

            {documents.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Hujjatlar topilmadi</h3>
                        <p className="text-muted-foreground">
                            {searchTerm
                                ? "Qidiruv bo'yicha hech narsa topilmadi"
                                : "Hali hech qanday hujjat yuklanmagan"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                        <div className="flex-shrink-0">
                                            {getFileIcon(doc.fileType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-sm font-medium truncate" title={doc.filename}>
                                                {doc.filename}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {formatFileSize(doc.size)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                                        {getFileTypeLabel(doc.fileType)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(doc.createdAt).toLocaleDateString("uz-UZ")}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleViewDocument(doc)}
                                            className="bg-[#387B66] hover:bg-[#2d6352]"
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ochish
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Jami: {pagination.totalItems} ta hujjat
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                        >
                            Oldingi
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">
                                {pagination.currentPage} / {pagination.totalPages}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={!pagination.hasNext}
                        >
                            Keyingi
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}