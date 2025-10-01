import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Video, ImageIcon, FileSpreadsheet } from "lucide-react"

export function Hero() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance">
            O'qituvchilar uchun <span className="text-primary">hujjat ko'rish</span> platformasi
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            DOCX, PDF, Excel, PowerPoint, rasm va video fayllarni oson ko'ring va boshqaring. Telegram bot orqali
            xavfsiz kirish va barcha hujjatlaringizni bir joyda saqlash.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8">
              Boshlash
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Demo ko'rish
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <FileText className="h-12 w-12 text-primary" />
              <span className="text-sm text-muted-foreground">PDF & DOCX</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <FileSpreadsheet className="h-12 w-12 text-primary" />
              <span className="text-sm text-muted-foreground">Excel & PPT</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <ImageIcon className="h-12 w-12 text-primary" />
              <span className="text-sm text-muted-foreground">Rasmlar</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Video className="h-12 w-12 text-primary" />
              <span className="text-sm text-muted-foreground">Videolar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
