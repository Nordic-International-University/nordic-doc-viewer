import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">O'qituvchi Hujjatlari</h1>
          <p className="text-muted-foreground">Hujjatlaringizni ko'rish va boshqarish uchun tizimga kiring</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
