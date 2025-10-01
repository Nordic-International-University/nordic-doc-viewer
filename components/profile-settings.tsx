"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, MessageSquare, Shield } from "lucide-react"

export function ProfileSettings() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userInfo = localStorage.getItem("user_info")
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
  }, [])

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Foydalanuvchi ma'lumotlari topilmadi</h3>
          <p className="text-muted-foreground">Iltimos, qaytadan tizimga kiring</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Shaxsiy Ma'lumotlar
          </CardTitle>
          <CardDescription>Telegram orqali olgan ma'lumotlaringiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photo_url || "/placeholder.svg"} alt={user.first_name} />
              <AvatarFallback className="text-lg">{user.first_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-muted-foreground">@{user.username}</p>
              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                <Shield className="h-3 w-3" />
                Tasdiqlangan
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Telegram ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Til</label>
              <p className="text-sm bg-muted p-2 rounded">{user.language_code?.toUpperCase() || "Noma'lum"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Telegram Bot
          </CardTitle>
          <CardDescription>Hujjat yuklash va boshqarish uchun bot ma'lumotlari</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Bot nomi:</h4>
            <p className="text-sm text-muted-foreground mb-3">@TeacherDocBot</p>

            <h4 className="font-medium mb-2">Qo'llab-quvvatlanadigan formatlar:</h4>
            <div className="flex flex-wrap gap-2">
              {["PDF", "DOCX", "DOC", "XLSX", "XLS", "PPTX", "PPT", "JPG", "PNG", "MP4"].map((format) => (
                <Badge key={format} variant="outline" className="text-xs">
                  {format}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Hujjatlarni botga yuboring</p>
            <p>• Avtomatik ravishda saytda ko'rinadi</p>
            <p>• Xavfsiz va tez yuklash</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Hisobot Statistikasi
          </CardTitle>
          <CardDescription>Faoliyatingiz haqida ma'lumot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Jami hujjatlar</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Bu oy yuklangan</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">0 MB</div>
              <div className="text-sm text-muted-foreground">Jami hajm</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
