import { Button } from "@/components/ui/button"
import { FileText, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">O'qituvchi Hujjat Ko'rish</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Imkoniyatlar
            </a>
            <a href="#auth" className="text-muted-foreground hover:text-foreground transition-colors">
              Kirish
            </a>
            <a href="#viewer" className="text-muted-foreground hover:text-foreground transition-colors">
              Hujjatlar
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
              Yordam
            </Button>
            <Button className="md:hidden" variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
