"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, MapPin, Star, Clock, Scissors, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import { getBarberDetails } from "@/lib/api"
import MapComponent from "@/components/map-component"

export default function BarberProfilePage() {
  const router = useRouter()
  const params = useParams()
  const barberId = params.id as string
  const { user, isLoading: authLoading } = useAuth()
  const [barber, setBarber] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState({ lat: 24.7136, lng: 46.6753 }) // الرياض كموقع افتراضي
  const [activeTab, setActiveTab] = useState("info")
  const [showServiceZone, setShowServiceZone] = useState(false)

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
      if (!barberId) return

      try {
        setIsLoading(true)
        setError("")
        // تمرير نوع المستخدم الحالي للتحقق من الصلاحيات
        const barberData = await getBarberDetails(barberId, user?.type)
        setBarber(barberData)
      } catch (err) {
        setError("فشل في جلب بيانات الحلاق")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBarberData()
  }, [barberId, user?.type])

  // التحقق مما إذا كان الحلاق قريبًا (ضمن منطقة الخدمة)
  const isWithinServiceZone = (barber: any) => {
    if (!barber || !barber.location || !barber.serviceZone) return false

    const distance = calculateDistance(userLocation.lat, userLocation.lng, barber.location.lat, barber.location.lng)

    return distance <= barber.serviceZone
  }

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل بيانات الحلاق...</span>
      </div>
    )
  }

  if (error || !barber) {
    return (
      <div className="flex min-h-screen flex-col p-4">
        <Button variant="ghost" className="mb-2 w-fit" onClick={() => router.back()}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </Button>
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-2xl font-bold mb-4">حدث خطأ</h1>
          <p className="text-muted-foreground">{error || "لم يتم العثور على الحلاق"}</p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/customer")}>
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    )
  }

  // حساب المسافة بين المستخدم والحلاق
  const distance = calculateDistance(userLocation.lat, userLocation.lng, barber.location.lat, barber.location.lng)

  return (
    <div className="flex min-h-screen flex-col p-4 md:p-6">
      <Button variant="ghost" className="mb-2 w-fit" onClick={() => router.back()}>
        <ArrowRight className="ml-2 h-4 w-4" />
        العودة
      </Button>

      <div className="container mx-auto">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={barber.profileImage || "/placeholder.svg"} alt={barber.name} />
                  <AvatarFallback>{barber.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{barber.name}</CardTitle>
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(barber.rating) ? "fill-current" : ""}`} />
                    ))}
                    <span className="text-sm text-muted-foreground mr-1">({barber.reviews})</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <Badge className={barber.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {barber.isAvailable ? "متاح الآن" : "غير متاح"}
                </Badge>
                <Badge
                  className={
                    isWithinServiceZone(barber) ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                  }
                >
                  {isWithinServiceZone(barber) ? "ضمن منطقة الخدمة" : "خارج منطقة الخدمة"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="info">المعلومات</TabsTrigger>
                <TabsTrigger value="services">الخدمات</TabsTrigger>
                <TabsTrigger value="location">الموقع</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>يبعد {distance} كم عنك</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>متاح خلال 30 دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    <span>خبرة {barber.experience} سنوات</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">نبذة عن الحلاق:</h3>
                  <p className="text-muted-foreground">{barber.description}</p>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">نوع الخدمة:</h3>
                  <p className="text-muted-foreground">
                    {barber.serviceMode === "both"
                      ? "زيارات منزلية وفي المحل"
                      : barber.serviceMode === "home_visits"
                        ? "زيارات منزلية فقط"
                        : "في المحل فقط"}
                  </p>
                  {barber.serviceMode !== "home_visits" && barber.shopAddress && (
                    <p className="text-muted-foreground mt-2">
                      <strong>عنوان المحل:</strong> {barber.shopAddress}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-medium">الخدمات المتاحة:</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {barber.services.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{service.name}</h4>
                            <span className="font-bold">{service.price} ريال</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">أوقات العمل:</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {barber.availability.map((time) => (
                      <Badge key={time} variant="outline" className="justify-center">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">موقع الحلاق:</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowServiceZone(!showServiceZone)}>
                    {showServiceZone ? "إخفاء" : "عرض"} منطقة الخدمة
                  </Button>
                </div>
                <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                  <MapComponent
                    userLocation={userLocation}
                    barbers={[
                      {
                        id: barber.id,
                        name: barber.name,
                        location: barber.location,
                        distance: distance,
                        serviceZone: barber.serviceZone,
                      },
                    ]}
                    showServiceZone={showServiceZone}
                    serviceZoneRadius={barber.serviceZone}
                  />
                </div>
                <div className="flex items-center mt-2">
                  <MapPin className="h-5 w-5 ml-2 text-primary" />
                  <span>منطقة الخدمة: {barber.serviceZone} كم</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => router.push(`/dashboard/customer/booking/${barber.id}`)}
              disabled={!isWithinServiceZone(barber)}
            >
              <Calendar className="ml-2 h-4 w-4" />
              احجز موعد
            </Button>
            {!isWithinServiceZone(barber) && (
              <p className="text-sm text-red-500">أنت خارج منطقة خدمة هذا الحلاق ({barber.serviceZone} كم)</p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
