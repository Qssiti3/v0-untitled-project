"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, Loader2, MapPin, Phone, MessageSquare, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import BarberNavbar from "@/components/barber-navbar"
import { useAuth } from "@/lib/auth"
import { getCustomerDetails, trackBarberLocation } from "@/lib/api"
import MapComponent from "@/components/map-component"

export default function BarberTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string
  const { user, isLoading: authLoading } = useAuth()

  const [customer, setCustomer] = useState<any>(null)
  const [customerLocation, setCustomerLocation] = useState<any>(null)
  const [barberLocation, setBarberLocation] = useState<any>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // مرجع للتايمر
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // جلب بيانات العميل
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!appointmentId || !user) return

      try {
        // هنا يجب استبدال هذا بجلب بيانات الموعد أولاً ثم بيانات العميل
        // لتبسيط المثال، سنفترض أن الموعد مع العميل الأول
        const customerData = await getCustomerDetails("customer_2001", user.type)
        setCustomer(customerData)

        if (customerData.location) {
          setCustomerLocation(customerData.location)
        }

        setIsLoading(false)
      } catch (err) {
        setError("فشل في جلب بيانات العميل")
        setIsLoading(false)
      }
    }

    fetchCustomerData()
  }, [appointmentId, user])

  // الحصول على موقع الحلاق الحالي
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setBarberLocation(newLocation)

          // حساب المسافة إذا كان موقع العميل متاحاً
          if (customerLocation) {
            const dist = calculateDistance(newLocation.lat, newLocation.lng, customerLocation.lat, customerLocation.lng)
            setDistance(dist)

            // حساب الوقت التقريبي (بافتراض سرعة 40 كم/ساعة)
            const timeInMinutes = Math.round((dist / 40) * 60)
            setEstimatedTime(timeInMinutes)
          }

          return newLocation
        },
        (error) => {
          console.error("خطأ في الحصول على الموقع:", error)
          setError("فشل في الحصول على موقعك الحالي. يرجى التأكد من تفعيل خدمة الموقع.")
          return null
        },
      )
    } else {
      setError("متصفحك لا يدعم خدمة تحديد الموقع")
      return null
    }
  }

  // تفعيل/إيقاف التتبع
  const toggleTracking = async () => {
    if (isTracking) {
      // إيقاف التتبع
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
        trackingIntervalRef.current = null
      }
      setIsTracking(false)
    } else {
      // بدء التتبع
      const location = getCurrentLocation()
      if (location) {
        try {
          // إرسال الموقع الأولي
          await trackBarberLocation(appointmentId, barberLocation)

          // بدء التتبع الدوري
          trackingIntervalRef.current = setInterval(async () => {
            const newLocation = getCurrentLocation()
            if (newLocation) {
              try {
                await trackBarberLocation(appointmentId, newLocation)
              } catch (err) {
                console.error("خطأ في تحديث الموقع:", err)
              }
            }
          }, 10000) // تحديث كل 10 ثوانٍ

          setIsTracking(true)
        } catch (err) {
          setError("فشل في بدء التتبع")
        }
      }
    }
  }

  // إيقاف التتبع عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
    }
  }, [])

  // دالة مساعدة لحساب المسافة بين نقطتين
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // نصف قطر الأرض بالكيلومتر
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // المسافة بالكيلومتر
    return Number(distance.toFixed(1))
  }

  // الحصول على الموقع الحالي عند تحميل الصفحة
  useEffect(() => {
    getCurrentLocation()
  }, [])

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
      <BarberNavbar user={user} activeTab="" setActiveTab={() => {}} logout={() => {}} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.push("/dashboard/barber")}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
            <h1 className="text-2xl font-bold">تتبع الموقع أثناء التوجه للعميل</h1>
            <p className="text-muted-foreground">يمكنك تفعيل التتبع ليتمكن العميل من متابعة موقعك أثناء توجهك إليه</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {customer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center mb-4">
                      <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage src={customer.profileImage || "/placeholder.svg"} alt={customer.name} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold">{customer.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-blue-100 text-blue-800">في انتظارك</Badge>
                      </div>
                    </div>

                    <div className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">العنوان:</span>
                        <span className="text-sm">{customer.address || "غير متوفر"}</span>
                      </div>

                      {distance !== null && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">المسافة:</span>
                          <span className="text-lg">{distance} كم</span>
                        </div>
                      )}

                      {estimatedTime !== null && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">الوقت المتوقع للوصول:</span>
                          <span className="text-lg">{estimatedTime} دقيقة</span>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between space-y-2">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Label htmlFor="tracking-mode">تفعيل التتبع</Label>
                            <Switch id="tracking-mode" checked={isTracking} onCheckedChange={toggleTracking} />
                          </div>
                          <Badge className={isTracking ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {isTracking ? "التتبع نشط" : "التتبع متوقف"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          عند تفعيل التتبع، سيتمكن العميل من رؤية موقعك على الخريطة أثناء توجهك إليه
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <Button className="w-full mb-2" variant="default">
                          <Phone className="ml-2 h-4 w-4" />
                          اتصل بالعميل
                        </Button>
                        <Button className="w-full" variant="outline">
                          <MessageSquare className="ml-2 h-4 w-4" />
                          مراسلة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>خريطة التتبع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                      <MapComponent
                        userLocation={barberLocation || { lat: 24.7136, lng: 46.6753 }}
                        barbers={[]}
                        customerLocation={customerLocation}
                        showDirections={true}
                        userType="barber"
                      />
                    </div>
                    <div className="flex items-center mt-4">
                      <MapPin className="h-5 w-5 ml-2 text-primary" />
                      <span>
                        موقعك الحالي:{" "}
                        {barberLocation
                          ? `${barberLocation.lat.toFixed(6)}, ${barberLocation.lng.toFixed(6)}`
                          : "غير متاح"}
                      </span>
                    </div>

                    <div className="mt-4">
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => {
                          // فتح خرائط جوجل للملاحة
                          if (customerLocation) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`,
                              "_blank",
                            )
                          }
                        }}
                      >
                        <Navigation className="ml-2 h-4 w-4" />
                        فتح في خرائط جوجل للملاحة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
