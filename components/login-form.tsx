"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import Cookie from "js-cookie";
import { API_BASE_URL } from "@/lib/api";

export function LoginForm() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);

    try {
      // API call to authenticate with Telegram code
      const response = await fetch(`${API_BASE_URL}api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        Cookie.set("auth_token", data?.token);
        router.push("/documents");
      } else {
        alert("Noto'g'ri kod. Iltimos, qaytadan urinib ko'ring.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Telegram orqali kirish
        </CardTitle>
        <CardDescription>
          Telegram botdan olgan kodingizni kiriting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Telegram kodi</Label>
            <Input
              id="code"
              type="text"
              placeholder="Telegram botdan olgan kodingizni kiriting"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
              className="text-center text-lg tracking-wider"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !code.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tekshirilmoqda...
              </>
            ) : (
              "Kirish"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
