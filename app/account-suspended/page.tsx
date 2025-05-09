"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Ban, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AccountSuspendedPage() {
  const router = useRouter()
  const [suspensionInfo, setSuspensionInfo] = useState<{
    type: "blocked" | "suspended"
    reason: string
    until?: string
    remainingDays?: number
  } | null>(null)

  useEffect(() => {
    // استرجاع معلومات الإيقاف من localStorage
    const suspensionData = localStorage.getItem("suspensionInfo")

    if (!suspensionData) {
      // إذا لم تكن هناك معلومات إيقاف، توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push("/login")
      return
    }

    try {
      const parsedData = JSON.parse(suspensionData)
      setSuspensionInfo(parsedData)
    } catch (error) {
      console.error("خطأ في تحليل بيانات الإيقاف:", error)
      router.push("/login")
    }
  }, [router])

  if (!suspensionInfo) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-destructive/10 p-3">
              {suspensionInfo.type === "blocked" ? (
                <Ban className="h-6 w-6 text-destructive" />
              ) : (
                <Clock className="h-6 w-6 text-amber-500" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {suspensionInfo.type === "blocked" ? "تم حظر الحساب" : "تم إيقاف الحساب مؤقتًا"}
          </CardTitle>
          <CardDescription>
            {suspensionInfo.type === "blocked"
              ? "تم حظر حسابك من قبل إدارة التطبيق"
              : "تم إيقاف حسابك مؤقتًا من قبل إدارة التطبيق"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-4 text-right">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">
                  سبب {suspensionInfo.type === "blocked" ? "الحظر" : "الإيقاف"}:
                </h3>
                <p className="text-sm text-destructive/90 mt-1">{suspensionInfo.reason}</p>
              </div>
            </div>
          </div>

          {suspensionInfo.type === "suspended" && suspensionInfo.remainingDays && (
            <div className="rounded-md bg-amber-500/10 p-4 text-right">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-600">مدة الإيقاف المتبقية:</h3>
                  <p className="text-sm text-amber-600/90 mt-1">
                    {suspensionInfo.remainingDays} {suspensionInfo.remainingDays === 1 ? "يوم" : "أيام"}
                  </p>
                  <p className="text-sm text-amber-600/90 mt-1">
                    سيتم إلغاء الإيقاف تلقائيًا في: {suspensionInfo.until}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md bg-muted p-4 text-right">
            <h3 className="font-semibold">ماذا يمكنني أن أفعل؟</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {suspensionInfo.type === "blocked"
                ? "يمكنك التواصل مع الدعم الفني لمناقشة حالة حسابك ومعرفة إمكانية إلغاء الحظر."
                : "يمكنك الانتظار حتى انتهاء مدة الإيقاف، أو التواصل مع الدعم الفني إذا كنت تعتقد أن هناك خطأ."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/support">التواصل مع الدعم الفني</Link>
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              العودة إلى صفحة تسجيل الدخول
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
