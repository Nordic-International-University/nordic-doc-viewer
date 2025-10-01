"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Key, CheckCircle } from "lucide-react"

export function AuthSection() {
  const [authCode, setAuthCode] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState("")

  const handleAuth = async () => {
    // Simulate authentication with the API
    if (authCode.length >= 6) {
      // Mock API call to authenticate
      const mockToken = "5f971c74743b2b5c15e84b3e8f2c1f3b3ca1dd828d7b5916f582961b0eb5f4b3"
      setToken(mockToken)
      setIsAuthenticated(true)
      localStorage.setItem("auth_token", mockToken)
    }
  }

  return (
    <section id="auth" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-balance">Telegram Bot Orqali Kirish</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Xavfsiz kirish uchun Telegram botdan olingan kodni kiriting
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <span>1-qadam: Telegram Bot</span>
              </CardTitle>
              <CardDescription>Telegram botga murojaat qiling va autentifikatsiya kodini oling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-sm">@teacher_doc_bot</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Botga "/start" buyrug'ini yuboring va 6 xonali kodni oling
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-6 w-6 text-primary" />
                <span>2-qadam: Kod Kiriting</span>
              </CardTitle>
              <CardDescription>Telegram botdan olingan kodni quyidagi maydoncha kiriting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="auth-code">Autentifikatsiya Kodi</Label>
                    <Input
                      id="auth-code"
                      placeholder="123456"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={handleAuth} className="w-full" disabled={authCode.length < 6}>
                    Kirish
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-green-500">
                    <CheckCircle className="h-5 w-5" />
                    <span>Muvaffaqiyatli kirdingiz!</span>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Token:</p>
                    <code className="text-xs break-all">{token}</code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
