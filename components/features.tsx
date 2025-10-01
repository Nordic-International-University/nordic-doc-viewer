import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Eye, Cloud, Smartphone, Users } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Shield,
      title: "Xavfsiz Kirish",
      description: "Telegram bot orqali xavfsiz autentifikatsiya va token bilan himoyalangan kirish",
    },
    {
      icon: Eye,
      title: "Ko'p Formatli Ko'rish",
      description: "PDF, DOCX, Excel, PowerPoint, rasm va video fayllarni to'g'ridan-to'g'ri brauzerda oching",
    },
    {
      icon: Zap,
      title: "Tez Yuklash",
      description: "Optimallashtirilgan fayl yuklash va tez ko'rish imkoniyati",
    },
    {
      icon: Cloud,
      title: "Bulutli Saqlash",
      description: "Barcha hujjatlaringiz xavfsiz bulutda saqlanadi va istalgan vaqtda kirish mumkin",
    },
    {
      icon: Smartphone,
      title: "Mobil Mos",
      description: "Telefon, planshet va kompyuterda mukammal ishlaydi",
    },
    {
      icon: Users,
      title: "O'qituvchilar Uchun",
      description: "Maxsus o'qituvchilar ehtiyojlari uchun mo'ljallangan interfeys",
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">Platformaning Imkoniyatlari</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            O'qituvchilar uchun maxsus yaratilgan hujjat boshqaruv tizimi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card hover:bg-accent/50 transition-colors">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
