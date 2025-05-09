"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Scissors, Star, Loader2, Search, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import { getNearbyBarbers, getUserAppointments, rateBarber } from "@/lib/api"
import CustomerNavbar from "@/components/customer-navbar"
import MapComponent from "@/components/map-component"
import { RateBarberDialog } from "@/components/rate-barber-dialog"
import { toast } from "@/components/ui/use-toast"

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("map")
  const [barbers, setBarbers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(false)
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState({ lat: 24.7136, lng: 46.6753 }) // الرياض كموقع افتراضي
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

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

  // تعديل دالة جلب الحلاقين القريبين لإضافة المزيد من التسجيل
  useEffect(() => {
    const fetchBarbers = async () => {
      if (!user) return

      try {
        setIsLoadingBarbers(true)
        setError("")
        console.log("جلب الحلاقين القريبين من الموقع:", userLocation)
        const { barbers: nearbyBarbers } = await getNearbyBarbers(userLocation.lat, userLocation.lng)
        console.log("تم جلب الحلاقين القريبين:", nearbyBarbers)
        setBarbers(nearbyBarbers)
      } catch (err) {
        console.error("خطأ في جلب بيانات الحلاقين:", err)
        setError("فشل في جلب بيانات الحلاقين")
      } finally {
        setIsLoadingBarbers(false)
      }
    }

    fetchBarbers()
  }, [user, userLocation])

  // جلب بيانات المواعيد
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      try {
        setIsLoadingAppointments(true)
        setError("")
        const { appointments: userAppointments } = await getUserAppointments(user.id, user.type)
        setAppointments(userAppointments)
      } catch (err) {
        setError("فشل في جلب بيانات المواعيد")
      } finally {
        setIsLoadingAppointments(false)
      }
    }

    fetchAppointments()
  }, [user])

  // تصفية الحلاقين حسب البحث
  const filteredBarbers = barbers.filter(
    (barber) =>
      barber.name.includes(searchQuery) ||
      barber.description.includes(searchQuery) ||
      barber.services.some((service) => service.name.includes(searchQuery)),
  )

  const handleSelectBarber = (barber) => {
    router.push(`/dashboard/customer/booking/${barber.id}`)
  }

  // التحقق مما إذا كان الحلاق قريبًا (أقل من 5 كم)
  const isNearby = (barber) => {
    return barber.distance <= 5
  }

  // فتح نافذة تقييم الحلاق
  const handleRateBarber = (appointment) => {
    setSelectedAppointment(appointment)
    setIsRateDialogOpen(true)
  }

  // إرسال تقييم الحلاق
  const handleRateSubmit = async (rating, feedback) => {
    try {
      await rateBarber(selectedAppointment.id, rating, feedback)

      // تحديث قائمة المواعيد
      const { appointments: updatedAppointments } = await getUserAppointments(user.id, user.type)
      setAppointments(updatedAppointments)

      toast({
        title: "تم التقييم بنجاح",
        description: "شكراً لك على تقييم الخدمة",
      })
    } catch (error) {
      console.error("خطأ في تقييم الحلاق:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال التقييم",
        variant: "destructive",
      })
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNavbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="map">الخريطة</TabsTrigger>
              <TabsTrigger value="barbers">الحلاقون</TabsTrigger>
              <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            </TabsList>

            {/* Map Tab */}
            <TabsContent value="map" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">ابحث عن حلاق قريب منك</h2>
                <Button variant="outline" size="sm" onClick={() => setUserLocation({ lat: 24.7136, lng: 46.6753 })}>
                  <MapPin className="h-4 w-4 ml-2" />
                  تحديث موقعي
                </Button>
              </div>

              {/* Simple Map */}
              <div className="w-full h-[500px] rounded-lg overflow-hidden border">
                <MapComponent
                  userLocation={userLocation}
                  barbers={barbers}
                  selectBarber={handleSelectBarber}
                  userType="customer"
                  currentUserId={user?.id}
                />
              </div>
            </TabsContent>

            {/* Barbers Tab */}
            <TabsContent value="barbers" className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">الحلاقون المتاحون</h2>
                <div className="relative w-full md:w-64">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن حلاق أو خدمة..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLoadingBarbers ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mr-2">جاري تحميل بيانات الحلاقين...</span>
                </div>
              ) : filteredBarbers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBarbers.map((barber) => (
                    <Card key={barber.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={
                                  barber.profileImage ||
                                  `/placeholder.svg?height=48&width=48&text=${barber.name.substring(0, 1) || "/placeholder.svg"}`
                                }
                                alt="صورة الحلاق"
                              />
                              <AvatarFallback>{barber.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{barber.name}</CardTitle>
                                <Badge variant="outline" className="text-xs">
                                  {barber.uid}
                                </Badge>
                              </div>
                              <div className="flex items-center text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(barber.rating) ? "fill-current" : ""}`}
                                  />
                                ))}
                                <span className="text-sm text-muted-foreground mr-1">({barber.reviews})</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={barber.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {barber.isAvailable ? "متاح الآن" : "غير متاح"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className={isNearby(barber) ? "text-green-600" : "text-orange-600"}>
                              {isNearby(barber) ? "قريب منك" : "بعيد عنك"} ({barber.distance} كم)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>متاح خلال 30 دقيقة</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Scissors className="h-4 w-4" />
                            <span>خبرة {barber.experience} سنوات</span>
                          </div>
                          <div className="mt-4">
                            <CardDescription>{barber.description}</CardDescription>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">الخدمات:</h4>
                          <ul className="space-y-1">
                            {barber.services.map((service) => (
                              <li key={service.id} className="flex justify-between text-sm">
                                <span>{service.name}</span>
                                <span>{service.price} ريال</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/20 pt-4 flex gap-2">
                        <Button className="flex-1" onClick={() => handleSelectBarber(barber)}>
                          احجز موعد
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push(`/barber-profile/${barber.id}`)}
                        >
                          <Info className="h-4 w-4 ml-2" />
                          عرض الملف
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <p>لا يوجد حلاقين متاحين في منطقتك حاليًا</p>
                </div>
              )}
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">مواعيدك</h2>

                {/* Notification about editing */}
                <Alert className="max-w-md bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-600 text-sm">
                    يمكنك تعديل الحجز فقط إذا كان في حالة "قيد الانتظار"
                  </AlertDescription>
                </Alert>
              </div>

              {isLoadingAppointments ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mr-2">جاري تحميل بيانات المواعيد...</span>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment: any) => (
                    <Card key={appointment.id} className="mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>موعد مع {appointment.barberName}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">رمز الحجز:</span>
                              <Badge variant="outline">{appointment.bookingCode || "غير متوفر"}</Badge>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`
                              ${appointment.status === "pending" ? "bg-yellow-50 text-yellow-600 border-yellow-200" : ""}
                              ${appointment.status === "confirmed" ? "bg-green-50 text-green-600 border-green-200" : ""}
                              ${appointment.status === "completed" ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                              ${appointment.status === "cancelled" ? "bg-red-50 text-red-600 border-red-200" : ""}
                            `}
                          >
                            {appointment.status === "pending" && "قيد الانتظار"}
                            {appointment.status === "confirmed" && "مؤكد"}
                            {appointment.status === "completed" && "مكتمل"}
                            {appointment.status === "cancelled" && "ملغي"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.location === "customer_address" ? "في منزلك" : "في موقع الحلاق"}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">الخدمات:</h4>
                          <ul className="space-y-1">
                            {appointment.services.map((service) => (
                              <li key={service.id} className="flex justify-between">
                                <span>{service.name}</span>
                                <span>{service.price} ريال</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                            <span>المجموع:</span>
                            <span>{appointment.totalPrice} ريال</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-2">
                        {appointment.status === "confirmed" && appointment.location === "customer_address" && (
                          <Button
                            className="sm:flex-1"
                            onClick={() => router.push(`/dashboard/customer/track/${appointment.id}`)}
                          >
                            <MapPin className="ml-2 h-4 w-4" />
                            تتبع الحلاق
                          </Button>
                        )}
                        {appointment.status === "pending" ? (
                          <>
                            <Button variant="outline" className="flex-1">
                              إلغاء
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => router.push(`/dashboard/customer/edit-booking/${appointment.id}`)}
                            >
                              تعديل
                            </Button>
                          </>
                        ) : appointment.status === "confirmed" ? (
                          <>
                            <Button variant="outline" className="flex-1">
                              إلغاء
                            </Button>
                            <Button className="flex-1">اتصل بالحلاق</Button>
                          </>
                        ) : (
                          appointment.status === "completed" && (
                            <Button
                              className="w-full"
                              onClick={() => handleRateBarber(appointment)}
                              disabled={appointment.rating > 0}
                            >
                              {appointment.rating > 0 ? (
                                <div className="flex items-center">
                                  <span>تم التقييم: </span>
                                  <div className="flex items-center mr-2">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < Math.floor(appointment.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <Star className="ml-2 h-4 w-4" />
                                  قيّم الخدمة
                                </>
                              )}
                            </Button>
                          )
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <p>ليس لديك مواعيد حالية</p>
                  <Button className="mt-4" onClick={() => setActiveTab("barbers")}>
                    احجز موعدًا الآن
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* نافذة تقييم الحلاق */}
      <RateBarberDialog
        open={isRateDialogOpen}
        onOpenChange={setIsRateDialogOpen}
        appointment={selectedAppointment}
        onRateSubmit={handleRateSubmit}
      />
    </div>
  )
}
