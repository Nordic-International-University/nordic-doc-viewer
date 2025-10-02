"use client";

import { useState } from "react";
import { DocumentsList } from "@/components/documents-list";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/file-upload";
import { PlusCircle } from "lucide-react";

export default function DocumentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const handleUploadComplete = () => {
    setIsUploadDialogOpen(false);
    setUploadCount((prevCount) => prevCount + 1);
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mening Hujjatlarim
            </h1>
            <p className="text-muted-foreground">
              Yuklangan hujjatlaringizni ko'ring va boshqaring
            </p>
          </div>
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-[#387B66]">
                <PlusCircle className="h-4 w-4 mr-2" />
                Fayl yuklash
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Fayl yuklash</DialogTitle>
              </DialogHeader>
              <FileUpload onUploadComplete={handleUploadComplete} />
            </DialogContent>
          </Dialog>
        </div>
        <DocumentsList key={uploadCount} />
      </div>
    </main>
  );
}
