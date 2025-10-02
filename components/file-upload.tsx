'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react' // Import XCircle
import { apiClient } from '@/lib/api'

interface FileUploadProps {
  onUploadComplete?: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null) // Add uploadError state
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null) // Reset error on new upload

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        const result = await apiClient.uploadFile(file)
        if (result.success) {
          setUploadedFiles((prev) => [...prev, file.name])
        } else {
          setUploadError(result.error || 'Fayl yuklashda xatolik')
          break // Stop upload on first error
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadError('Tarmoq xatosi')
        break // Stop upload on network error
      }

      setUploadProgress(((i + 1) / files.length) * 100)
    }

    setIsUploading(false)
    if (!uploadError) {
      onUploadComplete?.()

      // Reset after 3 seconds on success
      setTimeout(() => {
        setUploadedFiles([])
        setUploadProgress(0)
      }, 3000)
    }
  }

  const resetState = () => {
    setIsDragging(false)
    setUploadProgress(0)
    setIsUploading(false)
    setUploadedFiles([])
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mov"
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Fayllar yuklanmoqda...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}% tugallandi
                </p>
              </div>
            </div>
          ) : uploadError ? (
            <div className="space-y-4">
              <XCircle className="h-8 w-8 text-red-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">Xatolik!</p>
                <p className="text-xs text-muted-foreground">{uploadError}</p>
              </div>
              <Button variant="outline" onClick={resetState}>
                Qaytadan urinish
              </Button>
            </div>
          ) : uploadedFiles.length > 0 ? (
            <div className="space-y-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">
                  Muvaffaqiyatli yuklandi!
                </p>
                <div className="space-y-1">
                  {uploadedFiles.map((fileName, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {fileName}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Fayllarni bu yerga sudrab olib keling
                </p>
                <p className="text-xs text-muted-foreground">
                  yoki fayllarni tanlash uchun bosing
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Fayllarni tanlash
              </Button>
              <div className="text-xs text-muted-foreground">
                Qo'llab-quvvatlanadigan formatlar: PDF, Word, Excel, PowerPoint,
                Rasm, Video
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}