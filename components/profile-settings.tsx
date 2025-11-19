"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Calendar, MessageSquare, Shield, Edit2, Save, X, Loader2 } from "lucide-react"
import { apiClient, UserProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function ProfileSettings() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getUserProfile()
      if (response.success && response.data) {
        setUser(response.data)
        setEditedUser(response.data)
      } else {
        toast({
          title: "Xatolik",
          description: response.error || "Profil ma'lumotlarini yuklashda xatolik",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Xatolik",
        description: "Profil ma'lumotlarini yuklashda xatolik",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const response = await apiClient.updateUser(user.id, {
        fullname: editedUser.fullname,
        username: editedUser.username,
      })

      if (response.success && response.data) {
        setUser(response.data)
        setIsEditing(false)
        toast({
          title: "Muvaffaqiyatli",
          description: "Profil ma'lumotlari yangilandi",
        })
      } else {
        toast({
          title: "Xatolik",
          description: response.error || "Profilni yangilashda xatolik",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Xatolik",
        description: "Profilni yangilashda xatolik",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedUser(user || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Yuklanmoqda...</h3>
        </CardContent>
      </Card>
    )
  }

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Shaxsiy Ma'lumotlar
              </CardTitle>
              <CardDescription>Telegram orqali olgan ma'lumotlaringiz</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Tahrirlash
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Bekor qilish
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Saqlash
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || "/placeholder-user.jpg"} alt={user.fullname} />
              <AvatarFallback className="text-lg">{user.fullname?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              {!isEditing ? (
                <>
                  <h3 className="text-xl font-semibold">{user.fullname}</h3>
                  <p className="text-muted-foreground">@{user.username}</p>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="fullname">To'liq ism</Label>
                    <Input
                      id="fullname"
                      value={editedUser.fullname || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, fullname: e.target.value })}
                      placeholder="To'liq ismingiz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editedUser.username || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                      placeholder="Username"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant={user.isActive ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                  <Shield className="h-3 w-3" />
                  {user.isActive ? "Faol" : "Faol emas"}
                </Badge>
                {user.isAdmin && (
                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Telegram ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.telegramId}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Foydalanuvchi ID</label>
              <p className="text-sm font-mono bg-muted p-2 rounded">{user.id}</p>
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
