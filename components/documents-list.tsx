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
    Upload,
} from "lucide-react";
import Link from "next/link";
import Cookie from "js-cookie";
import { API_BASE_URL } from "@/lib/api";

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    created_at: string;
    url: string;
}

export function DocumentsList() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = Cookie.get("auth_token");
            const response = await fetch(`${API_BASE_URL}api/files`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("API data:", data);

                const mappedDocs: Document[] = (data || []).map((file: any) => ({
                    id: file.id,
                    name: file.filename,
                    type: file.fileType,
                    size: file.size || 0,
                    created_at: file.createdAt,
                    url: file.fileUrl,
                }));

                setDocuments(mappedDocs);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
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
        if (type.includes("image")) return "Rasm";
        if (type.includes("video")) return "Video";
        if (type.includes("spreadsheet") || type.includes("excel")) return "Excel";
        if (type.includes("presentation") || type.includes("powerpoint"))
            return "PowerPoint";
        if (type.includes("pdf")) return "PDF";
        if (type.includes("word")) return "Word";
        return "Hujjat";
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
        );
    };

    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Hujjatlarni qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

            </div>

            {filteredDocuments.length === 0 ? (
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
                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow overflow-hidden">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                        <div className="flex-shrink-0">
                                            {getFileIcon(doc.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-sm font-medium truncate" title={doc.name}>
                                                {doc.name}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {formatFileSize(doc.size)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                                        {getFileTypeLabel(doc.type)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(doc.created_at).toLocaleDateString("uz-UZ")}
                                    </span>
                                    <Link
                                        href={{
                                            pathname: "/documents/view",
                                            query: {
                                                name: doc.name,
                                                type: doc.type,
                                                url: doc.url,
                                                size: doc.size,
                                                created: doc.created_at,
                                            },
                                        }}
                                    >
                                        <Button size="sm" variant="outline">
                                            Ko'rish
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}