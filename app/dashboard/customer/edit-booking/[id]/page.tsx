"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, Calendar, Clock, MapPin, Scissors, CreditCard, Home, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth"
import { getUserAppointments, getBarberDetails, updateAppointment } from "@/lib/api"
import CustomerNavbar from "@/components/customer-navbar"

export default function EditBookingPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()

  const [appointment, setAppointment] = useState<any>(null)
  const [barber, setBarber] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // بيانات الحجز
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [location, setLocation] = useState("customer_address")
  const [notes, setNotes] = useState("")

  // التاريخ والأوقات المتاحة
  const dates = [
    { date: "2025-05-20", display: "اليوم - 20 مايو 2025" },
    { date: "2025-05-21", display: "غدًا - 21 مايو 2025" },
    { date: "2025-05-22", display: "22 مايو 2025" },
    { date: "2025-05-23", display: "23 مايو 2025" },
    { date: "2025-05-24", display: "24 مايو 2025" },
  ]

  // التحقق من وجود مستخدم مسجل الدخول ونوعه
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (user.type !== "customer") {
        router.push("/dashboard/barber")
      }
    }
  }, [user, authLoading, router])

  // جلب بيانات الموعد والحلاق
  useEffect(() => {
    const fetchAppointmentAndBarber = async () => {
      if (!user || !params.id) return

      try {
        setIsLoading(true)
        setError("")

        // جلب مواعيد المستخدم
        const { appointments } = await getUserAppointments(user.id, "customer")
        const appointmentData = appointments.find((a: any) => a.id === params.id)

        if (!appointmentData) {
          setError("لم يتم العثور على الموعد المطلوب")
          return
        }

        // التحقق من حالة الموعد - لا يمكن تعديل الموعد إلا إذا كان في حالة الانتظار
        if (appointmentData.status !== "pending") {
          setError("لا يمكن تعديل هذا الموعد لأنه تم تأكيده أو إلغاؤه بالفعل")
          setTimeout(() => {
            router.push("/dashboard/customer?tab=appointments")
          }, 3000)
          return
        }

        setAppointment(appointmentData)

        // تعيين البيانات الحالية للموعد
        setSelectedDate(appointmentData.date)
        setSelectedTime(appointmentData.time)
        setSelectedServices(appointmentData.services.map((s: any) => s.id))
        setLocation(appointmentData.location)
        setNotes(appointmentData.notes || "")

        // جلب بيانات الحلاق
        const barberData = await getBarberDetails(appointmentData.barberId)
        setBarber(barberData)
      } catch (err) {
        console.error("خطأ في جلب بيانات الموعد:", err)
        setError("فشل في جلب بيانات الموعد، يرجى المحاولة مرة أخرى")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointmentAndBarber()
  }, [user, params.id, router])

  // حساب المجموع
  const calculateTotal = () => {
    if (!barber || !barber.services) return 0

    return barber.services
      .filter((service: any) => selectedServices.includes(service.id))
      .reduce((sum: number, service: any) => sum + service.price, 0)
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // التحقق من صحة البيانات
    if (!selectedDate) {
      setError("يرجى تحديد التاريخ")
      return
    }

    if (!selectedTime) {
      setError("يرجى تحديد الوقت")
      return
    }

    if (selectedServices.length === 0) {
      setError("يرجى اختيار خدمة واحدة على الأقل")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")
      setSuccess("")

      // تحضير بيانات الموعد المحدثة
      const selectedServiceObjects = barber.services
        .filter((service: any) => selectedServices.includes(service.id))
        .map((service: any) => ({
          id: service.id,
          name: service.name,
          price: service.price,
        }))

      const updatedAppointmentData = {
        ...appointment,
        date: selectedDate,
        time: selectedTime,
        services: selectedServiceObjects,
        totalPrice: calculateTotal(),
        location,
        notes,
      }

      // تحديث الموعد
      await updateAppointment(params.id as string, updatedAppointmentData)

      setSuccess("تم تحديث الموعد بنجاح")

      // التوجيه إلى صفحة المواعيد بعد نجاح التحديث
      setTimeout(() => {
        router.push("/dashboard/customer?tab=appointments")
      }, 2000)
    } catch (err) {
      console.error("خطأ في تحديث الموعد:", err)
      setError("حدث خطأ أثناء تحديث الموعد، يرجى المحاولة مرة أخرى")
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNavbar user={user} activeTab="" setActiveTab={() => {}} logout={() => {}} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-2"
              onClick={() => router.push("/dashboard/customer?tab=appointments")}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى قائمة المواعيد
            </Button>
            <h1 className="text-2xl font-bold">تعديل الموعد</h1>
            <p className="text-muted-foreground">تعديل موعدك مع الحلاق {barber?.name}</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-600 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-600">
              ملاحظة: يمكنك تعديل الموعد فقط إذا كان في حالة "قيد الانتظار". بمجرد أن يتم تأكيد الموعد من قبل الحلاق، لن
              تتمكن من تعديله.
            </AlertDescription>
          </Alert>

          {barber && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>تفاصيل الموعد</CardTitle>
                <CardDescription>تعديل الخدمات والوقت المناسب</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="booking-form" className="space-y-6" onSubmit={handleSubmit}>
                  {/* اختيار التاريخ */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      <Calendar className="inline-block ml-2 h-4 w-4" />
                      اختر التاريخ
                    </Label>
                    <RadioGroup
                      value={selectedDate}
                      onValueChange={setSelectedDate}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {dates.map((item) => (
                        <div key={item.date} className="flex items-center">
                          <RadioGroupItem value={item.date} id={`date-${item.date}`} />
                          <Label htmlFor={`date-${item.date}`} className="pr-2">
                            {item.display}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* اختيار الوقت */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      <Clock className="inline-block ml-2 h-4 w-4" />
                      اختر الوقت
                    </Label>

                    {barber?.availability && barber.availability.length > 0 ? (
                      <RadioGroup
                        value={selectedTime}
                        onValueChange={setSelectedTime}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                      >
                        {barber.availability.map((time: string) => (
                          <div key={time} className="flex items-center">
                            <RadioGroupItem value={time} id={`time-${time}`} />
                            <Label htmlFor={`time-${time}`} className="pr-2">
                              {time}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Alert className="bg-amber-50 text-amber-600 border-amber-200">
                        <AlertDescription>لا توجد أوقات متاحة لهذا الحلاق حالياً.</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* اختيار الخدمات */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      <Scissors className="inline-block ml-2 h-4 w-4" />
                      اختر الخدمات
                    </Label>
                    <div className="space-y-3">
                      {barber?.services && barber.services.length > 0 ? (
                        barber.services.map((service: any) => (
                          <div key={service.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center">
                              <Checkbox
                                id={`service-${service.id}`}
                                checked={selectedServices.includes(service.id)}
                                onCheckedChange={() => handleServiceToggle(service.id)}
                              />
                              <Label htmlFor={`service-${service.id}`} className="pr-2">
                                {service.name}
                              </Label>
                            </div>
                            <span className="font-bold">{service.price} ريال</span>
                          </div>
                        ))
                      ) : (
                        <Alert className="bg-amber-50 text-amber-600 border-amber-200">
                          <AlertDescription>لا توجد خدمات متاحة لهذا الحلاق حالياً.</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* موقع تقديم الخدمة */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      <MapPin className="inline-block ml-2 h-4 w-4" />
                      مكان تقديم الخدمة
                    </Label>
                    <RadioGroup value={location} onValueChange={setLocation} className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <RadioGroupItem value="customer_address" id="location-home" />
                        <Label htmlFor="location-home" className="pr-2">
                          <Home className="inline-block ml-2 h-4 w-4" />
                          في منزلي
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="barber_location" id="location-barber" />
                        <Label htmlFor="location-barber" className="pr-2">
                          <Scissors className="inline-block ml-2 h-4 w-4" />
                          في موقع الحلاق
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* ملاحظات إضافية */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      id="notes"
                      placeholder="أي ملاحظات أو تعليمات خاصة..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <div className="w-full mb-4 p-4 bg-muted/30 rounded-md">
                  <div className="flex justify-between font-medium mb-2">
                    <span>مجموع الخدمات:</span>
                    <span>{calculateTotal()} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>رسوم الخدمة:</span>
                    <span>10 ريال</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>المجموع الكلي:</span>
                    <span>{calculateTotal() + 10} ريال</span>
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push("/dashboard/customer?tab=appointments")}
                    disabled={isSubmitting}
                  >
                    إلغاء التعديل
                  </Button>
                  <Button className="flex-1" type="submit" form="booking-form" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري حفظ التعديلات...
                      </>
                    ) : (
                      <>
                        <CreditCard className="ml-2 h-4 w-4" />
                        حفظ التعديلات
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
