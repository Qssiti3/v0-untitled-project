"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function BarberStatusAlert() {
  const { user } = useAuth()
  const [showAlert, setShowAlert] = useState(false)
  const [alertInfo, setAlertInfo] = useState<{
    title: string
    description: string
    variant: "default" | "destructive" | "warning"
  }>({
    title: "",
    description: "",
    variant: "default",
  })

  useEffect(() => {
    if (!user || user.type !== "barber") {
      setShowAlert(false)
      return
    }

    if (user.isBlocked) {
      setAlertInfo({
        title: "تم حظر حسابك",
        description: "تم حظر حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني للمزيد من المعلومات.",
        variant: "destructive",
      })
      setShowAlert(true)
      return
    }

    if (user.isSuspended && user.suspendedUntil) {
      const suspendedUntil = new Date(user.suspendedUntil)
      const now = new Date()

      if (suspendedUntil > now) {
        // حساب المدة المتبقية للإيقاف
        const remainingDays = Math.ceil((suspendedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const suspensionReason = user.suspensionReason || "مخالفة شروط الاستخدام"

        setAlertInfo({
          title: "تم إيقاف حسابك مؤقتًا",
          description: `تم إيقاف حسابك مؤقتًا لمدة ${remainingDays} يوم. سبب الإيقاف: ${suspensionReason}`,
          variant: "warning",
        })
        setShowAlert(true)
        return
      }
    }

    setShowAlert(false)
  }, [user])

  if (!showAlert) {
    return null
  }

  return (
    <Alert variant={alertInfo.variant} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{alertInfo.title}</AlertTitle>
      <AlertDescription>{alertInfo.description}</AlertDescription>
    </Alert>
  )
}
