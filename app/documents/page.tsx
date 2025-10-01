import { DocumentsList } from "@/components/documents-list"
import { AppHeader } from "@/components/app-header"

export default function DocumentsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mening Hujjatlarim</h1>
          <p className="text-muted-foreground">Yuklangan hujjatlaringizni ko'ring va boshqaring</p>
        </div>
        <DocumentsList />
      </div>
    </main>
  )
}
