"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, Loader2, MapPin, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import CustomerNavbar from "@/components/customer-navbar"
import { useAuth } from "@/lib/auth"
import { getBarberTrackingLocation, getBarberDetails, getAppointmentDetails } from "@/lib/api"
import MapComponent from "@/components/map-component"

export default function TrackBarberPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string
  const { user, isLoading: authLoading } = useAuth()
  const [barber, setBarber] = useState<any>(null)
  const [trackingData, setTrackingData] = useState<any>(null)
  const [userLocation, setUserLocation] = useState({ lat: 24.7136, lng: 46.6753 }) // الرياض كموقع افتراضي
  const [distance, setDistance] = useState<number | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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

  // الحصول على موقع المستخدم الحالي
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    }
  }, [])

  // جلب بيانات الحلاق
  useEffect(() => {
    const fetchBarberData = async () => {
      if (!appointmentId) return

      try {
        setIsLoading(true)
        // أولاً، نحصل على تفاصيل الموعد
        const appointmentDetails = await getAppointmentDetails(appointmentId as string)

        if (!appointmentDetails) {
          setError("لم يتم العثور على الموعد")
          setIsLoading(false)
          return
        }

        // ثم نحصل على تفاصيل الحلاق باستخدام معرف الحلاق من الموعد
        const barberData = await getBarberDetails(appointmentDetails.barberId)
        setBarber(barberData)
        setIsLoading(false)
      } catch (err) {
        console.error("فشل في جلب البيانات:", err)
        setError("فشل في جلب بيانات الحلاق أو الموعد")
        setIsLoading(false)
      }
    }

    fetchBarberData()
  }, [appointmentId])

  // تتبع موقع الحلاق
  useEffect(() => {
    if (!appointmentId) return

    const trackBarber = async () => {
      try {
        const { tracking } = await getBarberTrackingLocation(appointmentId)

        if (tracking) {
          setTrackingData(tracking)

          // حساب المسافة الفعلية
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            tracking.location.lat,
            tracking.location.lng,
          )
          setDistance(dist)

          // حساب الوقت التقريبي (بافتراض سرعة 40 كم/ساعة)
          const timeInMinutes = Math.round((dist / 40) * 60)
          setEstimatedTime(timeInMinutes)

          // تحديث وقت آخر تحديث
          const updateTime = new Date(tracking.timestamp)
          setLastUpdate(updateTime.toLocaleTimeString("ar-SA"))
        } else {
          // في حالة عدم وجود بيانات تتبع، نقوم بإنشاء بيانات وهمية للعرض
          console.log("لا توجد بيانات تتبع متاحة")
        }

        setIsLoading(false)
      } catch (err) {
        console.error("فشل في تتبع موقع الحلاق:", err)
        setError("فشل في تتبع موقع الحلاق")
        setIsLoading(false)
      }
    }

    // تنفيذ التتبع فوراً
    trackBarber()

    // تحديث موقع الحلاق كل 10 ثوانٍ
    trackingIntervalRef.current = setInterval(trackBarber, 10000)

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current)
      }
    }
  }, [appointmentId, userLocation])

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
        <div className="container mx-auto">
          <div className="mb-6">
            <Button variant="ghost" className="mb-2" onClick={() => router.push("/dashboard/customer")}>
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
            <h1 className="text-2xl font-bold">تتبع موقع الحلاق</h1>
            <p className="text-muted-foreground">يمكنك متابعة موقع الحلاق أثناء توجهه إليك</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {barber && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات الحلاق</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center mb-4">
                      <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage src={barber.profileImage || "/placeholder.svg"} alt={barber.name} />
                        <AvatarFallback>{barber.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold">{barber.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-green-100 text-green-800">في الطريق إليك</Badge>
                      </div>
                      {lastUpdate && <div className="text-xs text-muted-foreground mt-1">آخر تحديث: {lastUpdate}</div>}
                    </div>

                    <div className="space-y-4 mt-6">
                      {distance !== null && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">المسافة المتبقية:</span>
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
                        <Button className="w-full mb-2" variant="default">
                          <Phone className="ml-2 h-4 w-4" />
                          اتصل بالحلاق
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
                        userLocation={userLocation}
                        barbers={
                          trackingData
                            ? [
                                {
                                  id: "barber-tracking",
                                  name: barber.name,
                                  location: trackingData.location,
                                  distance: distance || 0,
                                },
                              ]
                            : []
                        }
                        showDirections={true}
                        userType="customer"
                      />
                    </div>
                    <div className="flex items-center mt-4">
                      <MapPin className="h-5 w-5 ml-2 text-primary" />
                      <span>
                        موقعك الحالي: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                      </span>
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
