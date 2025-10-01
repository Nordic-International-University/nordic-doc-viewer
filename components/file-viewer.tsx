"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Search, Calendar, User } from "lucide-react"
import {API_BASE_URL} from "@/lib/api";

interface FileItem {
  id: string
  filename: string
  fileUrl: string
  fileType: string
  uploadedBy: string
  createdAt: string
  originalName?: string
  size?: number
}

export function FileViewer() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch(
        `${API_BASE_URL}api/files?page=1&limit=20&sortBy=createdAt&sortOrder=desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setFiles(Array.isArray(data) ? data : data.files || [])
      }
    } catch (error) {
      console.error("Fayllarni yuklashda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const filteredFiles = files.filter(
    (file) =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.originalName && file.originalName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("word") || fileType.includes("document")) return "📝"
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊"
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "📈"
    if (fileType.includes("image")) return "🖼️"
    if (fileType.includes("video")) return "🎥"
    return "📁"
  }

  const openFile = (file: FileItem) => {
    setSelectedFile(file)
    window.open(file.fileUrl, "_blank")
  }

  return (
    <section id="viewer" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">Hujjatlar Ko'rish</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Yuklangan hujjatlaringizni ko'ring va boshqaring
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Fayl nomi bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchFiles} disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Yangilash"}
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredFiles.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {loading ? "Fayllar yuklanmoqda..." : "Hech qanday fayl topilmadi"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFiles.map((file) => (
                <Card key={file.id} className="border-border bg-card hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-2xl">{getFileTypeIcon(file.fileType)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{file.originalName || file.filename}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(file.createdAt).toLocaleDateString("uz-UZ")}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{file.uploadedBy.slice(0, 8)}...</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="mt-2">
                            {file.fileType.split("/")[1]?.toUpperCase() || "FILE"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openFile(file)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ko'rish
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.open(file.fileUrl, "_blank")}>
                          <Download className="h-4 w-4 mr-2" />
                          Yuklab olish
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
