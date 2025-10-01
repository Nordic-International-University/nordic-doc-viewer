import { ProfileSettings } from "@/components/profile-settings"
import { AppHeader } from "@/components/app-header"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profil Sozlamalari</h1>
          <p className="text-muted-foreground">Shaxsiy ma'lumotlaringizni ko'ring va tahrirlang</p>
        </div>
        <ProfileSettings />
      </div>
    </main>
  )
}
