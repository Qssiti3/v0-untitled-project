"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { sendSupportMessage } from "@/lib/support"

export default function SupportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [suspensionInfo, setSuspensionInfo] = useState<any>(null)

  useEffect(() => {
    // استرجاع معلومات الإيقاف من localStorage
    const suspensionData = localStorage.getItem("suspensionInfo")

    if (suspensionData) {
      try {
        const parsedData = JSON.parse(suspensionData)
        setSuspensionInfo(parsedData)
      } catch (error) {
        console.error("خطأ في تحليل بيانات الإيقاف:", error)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    try {
      setIsSending(true)

      // إنشاء رسالة دعم فني
      const supportMessage = {
        id: `support_${Date.now()}`,
        userId: user?.id || "guest",
        userName: user?.name || "زائر",
        userType: user?.type || "guest",
        message: message,
        subject: suspensionInfo
          ? `استفسار حول ${suspensionInfo.type === "blocked" ? "حظر الحساب" : "إيقاف الحساب المؤقت"}`
          : "استفسار عام",
        createdAt: new Date().toISOString(),
        status: "pending",
        isRead: false,
      }

      await sendSupportMessage(supportMessage)
      setIsSent(true)
      setMessage("")

      // بعد 3 ثوانٍ، إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("خطأ في إرسال رسالة الدعم:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">التواصل مع الدعم الفني</CardTitle>
          <CardDescription className="text-center">
            {suspensionInfo
              ? `يرجى وصف مشكلتك المتعلقة ${suspensionInfo.type === "blocked" ? "بحظر حسابك" : "بإيقاف حسابك المؤقت"}`
              : "يرجى وصف مشكلتك أو استفسارك"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {suspensionInfo && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium">معلومات الحساب:</p>
                <p className="mt-1">{suspensionInfo.type === "blocked" ? "الحساب محظور" : "الحساب موقوف مؤقتًا"}</p>
                <p className="mt-1">السبب: {suspensionInfo.reason}</p>
                {suspensionInfo.type === "suspended" && suspensionInfo.until && (
                  <p className="mt-1">تاريخ انتهاء الإيقاف: {suspensionInfo.until}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                disabled={isSending || isSent}
                className="resize-none text-right"
              />
            </div>

            {isSent && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                تم إرسال رسالتك بنجاح. سيتم التواصل معك قريبًا.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={!message.trim() || isSending || isSent}>
              {isSending ? "جاري الإرسال..." : "إرسال الرسالة"}
              {!isSending && <Send className="mr-2 h-4 w-4" />}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                العودة إلى صفحة تسجيل الدخول
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
