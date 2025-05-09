"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Calendar, Clock, MapPin, Check, X, Loader2, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { getBarberRequests, updateAppointmentStatus } from "@/lib/api"
import { createConversation } from "@/lib/chat"
import BarberNavbar from "@/components/barber-navbar"

export default function BarberRequestsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // التحقق من وجود مستخدم مسجل الدخول ونوعه
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.type !== "barber") {
        router.push("/dashboard/customer")
      }
    }
  }, [user, authLoading, router])

  // جلب طلبات الحجز
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError("")

        const data = await getBarberRequests(user.id)
        setRequests(data.appointments)
      } catch (err) {
        setError("فشل في جلب بيانات الطلبات، يرجى المحاولة مرة أخرى")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [user])

  const handleUpdateStatus = async (appointmentId: string, status: "confirmed" | "cancelled", customerId: string) => {
    try {
      setIsUpdating(true)
      setError("")
      setSuccess("")

      await updateAppointmentStatus(appointmentId, status)

      // تحديث القائمة
      setRequests((prev: any[]) => prev.map((req: any) => (req.id === appointmentId ? { ...req, status } : req)))

      setSuccess(`تم ${status === "confirmed" ? "قبول" : "رفض"} الطلب بنجاح`)

      // إذا تم قبول الطلب، قم بإنشاء محادثة مع العميل والانتقال إلى صفحة الدردشة
      if (status === "confirmed" && user) {
        try {
          // إنشاء رسالة ترحيبية تتضمن تفاصيل الحجز
          const welcomeMessage = `مرحباً، تم قبول طلب الحجز الخاص بك بنجاح.
تفاصيل الحجز:
- التاريخ: ${requests.find((req) => req.id === appointmentId)?.date}
- الوقت: ${requests.find((req) => req.id === appointmentId)?.time}
- المكان: ${requests.find((req) => req.id === appointmentId)?.location === "customer_address" ? "في منزلك" : "في المحل"}

يمكنك التواصل معي هنا إذا كان لديك أي استفسار. شكراً لاختيارك خدماتنا!`

          // إنشاء محادثة جديدة مع العميل
          const conversationResult = await createConversation(user.id, customerId, welcomeMessage)

          // الانتقال مباشرة إلى صفحة الدردشة
          router.push(`/dashboard/barber/messages?conversationId=${conversationResult.conversationId}`)
        } catch (chatError) {
          console.error("خطأ في إنشاء المحادثة:", chatError)
          // حتى لو فشلت المحادثة، سنظهر رسالة النجاح لقبول الطلب
          setTimeout(() => {
            setSuccess("")
            router.push("/dashboard/barber/requests")
          }, 1500)
        }
      }
    } catch (err) {
      setError(`فشل في ${status === "confirmed" ? "قبول" : "رفض"} الطلب، يرجى المحاولة مرة أخرى`)
    } finally {
      setIsUpdating(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  // تصفية طلبات الحجز المعلقة فقط
  const pendingRequests = requests.filter((req: any) => req.status === "pending")
  // الحصول على جميع الطلبات (المعلقة والمؤكدة والملغاة)
  const allRequests = requests

  return (
    <div className="flex min-h-screen flex-col">
      <BarberNavbar user={user} activeTab="" setActiveTab={() => {}} logout={() => {}} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.push("/dashboard/barber")}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
            <h1 className="text-2xl font-bold">طلبات الحجز</h1>
            <p className="text-muted-foreground">قائمة طلبات الحجز من العملاء بانتظار موافقتك</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-600 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {allRequests.length > 0 ? (
            <div className="space-y-6">
              {allRequests.map((request: any) => (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.customerImage || ""} alt="صورة العميل" />
                          <AvatarFallback>{request.customerName?.substring(0, 2) || "عم"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>طلب من {request.customerName}</CardTitle>
                          <CardDescription>
                            تم الطلب بتاريخ {new Date(request.createdAt).toLocaleDateString("ar-SA")}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          request.status === "pending"
                            ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                            : request.status === "confirmed"
                              ? "bg-green-50 text-green-600 border-green-200"
                              : "bg-red-50 text-red-600 border-red-200"
                        }
                      >
                        {request.status === "pending"
                          ? "قيد الانتظار"
                          : request.status === "confirmed"
                            ? "مؤكد"
                            : "ملغي"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>التاريخ: {request.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>الوقت: {request.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>المكان: {request.location === "customer_address" ? "في منزل العميل" : "في موقعك"}</span>
                      </div>
                    </div>

                    {request.location === "customer_address" && (
                      <div className="p-3 bg-muted/30 rounded-md">
                        <p className="font-medium mb-1">عنوان العميل:</p>
                        <p className="text-sm">{request.customerAddress}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">الخدمات المطلوبة:</h4>
                      <ul className="space-y-1">
                        {request.services.map((service: any) => (
                          <li key={service.id} className="flex justify-between">
                            <span>{service.name}</span>
                            <span>{service.price} ريال</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>المجموع:</span>
                        <span>{request.totalPrice} ريال</span>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">ملاحظات العميل:</h4>
                        <p className="text-sm">{request.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-4">
                    {request.status === "pending" ? (
                      <>
                        <Button
                          variant="outline"
                          className="sm:flex-1"
                          onClick={() => handleUpdateStatus(request.id, "cancelled", request.customerId)}
                          disabled={isUpdating}
                        >
                          <X className="ml-2 h-4 w-4" />
                          رفض الطلب
                        </Button>
                        <Button
                          className="sm:flex-1"
                          onClick={() => handleUpdateStatus(request.id, "confirmed", request.customerId)}
                          disabled={isUpdating}
                        >
                          <Check className="ml-2 h-4 w-4" />
                          قبول الطلب
                        </Button>
                      </>
                    ) : request.status === "confirmed" ? (
                      <>
                        <Button
                          className="sm:flex-1"
                          onClick={() => router.push(`/dashboard/barber/tracking/${request.id}`)}
                        >
                          <MapPin className="ml-2 h-4 w-4" />
                          تتبع الموقع
                        </Button>
                        <Button className="sm:flex-1" onClick={() => router.push(`/dashboard/barber/messages`)}>
                          <MessageSquare className="ml-2 h-4 w-4" />
                          الدردشة مع العميل
                        </Button>
                      </>
                    ) : null}
                    <Button variant="secondary" className="sm:flex-1">
                      <Phone className="ml-2 h-4 w-4" />
                      اتصال بالعميل
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-muted/30 rounded-lg">
              <p className="text-lg font-medium">لا توجد طلبات حالية</p>
              <p className="text-muted-foreground">ستظهر هنا طلبات الحجز الجديدة من العملاء</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
