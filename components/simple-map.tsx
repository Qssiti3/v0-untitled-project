"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star, Scissors, Phone, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// تعريف أيقونات مخصصة
const createCustomIcon = (iconUrl: string, iconSize: [number, number] = [25, 41]) => {
  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

// أيقونة الموقع الحالي
const currentLocationIcon = createCustomIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
)

// أيقونة الحلاق
const barberIcon = createCustomIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
)

// أيقونة المحل
const shopIcon = createCustomIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
)

// أيقونة الموقع المحدد
const selectedLocationIcon = createCustomIcon(
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
)

// مكون بطاقة معلومات الحلاق المحسنة
function BarberInfoCard({ barber, userType, onBookClick }) {
  const router = useRouter()

  // تحديد ما إذا كان الحلاق قريباً (أقل من 5 كم)
  const isNearby = barber.distance <= 5

  return (
    <Card className="w-[280px] p-0 overflow-hidden">
      <CardContent className="p-3">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg">{barber.name || "حلاق"}</h3>
            <Badge className={barber.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {barber.isAvailable ? "متاح الآن" : "غير متاح"}
            </Badge>
          </div>

          <div className="flex items-center text-yellow-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(barber.rating || 0) ? "fill-current" : ""}`} />
            ))}
            <span className="text-sm text-muted-foreground mr-1">({barber.reviews || 0})</span>
          </div>

          <div className="text-sm text-muted-foreground mb-1">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="h-3.5 w-3.5" />
              <span className={isNearby ? "text-green-600" : "text-orange-600"}>
                {isNearby ? "قريب منك" : "بعيد عنك"} ({barber.distance} كم)
              </span>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>متاح خلال {barber.availability?.length > 0 ? barber.availability[0] : "غير محدد"}</span>
            </div>

            <div className="flex items-center gap-1 mb-1">
              <Scissors className="h-3.5 w-3.5" />
              <span>خبرة {barber.experience || 0} سنوات</span>
            </div>

            {/* عرض معلومات الاتصال فقط للزبائن */}
            {userType === "customer" && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>{barber.phone || "غير متوفر"}</span>
              </div>
            )}
          </div>

          <div className="mt-2 text-sm">
            <p className="line-clamp-2">{barber.description || "لا يوجد وصف متاح"}</p>
          </div>

          {barber.services && barber.services.length > 0 ? (
            <div className="mt-2 pt-2 border-t">
              <h4 className="font-medium text-sm mb-1">الخدمات:</h4>
              <ul className="text-xs space-y-0.5">
                {barber.services.slice(0, 3).map((service) => (
                  <li key={service.id} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>{service.price} ريال</span>
                  </li>
                ))}
                {barber.services.length > 3 && (
                  <li className="text-muted-foreground">+{barber.services.length - 3} خدمات أخرى</li>
                )}
              </ul>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">لم يتم إضافة خدمات بعد</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 p-3 pt-2 flex gap-2">
        {userType === "customer" && (
          <Button className="w-full text-sm" onClick={() => onBookClick(barber)}>
            احجز موعد
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => router.push(`/barber-profile/${barber.id}`)}
        >
          عرض الملف الكامل
        </Button>
      </CardFooter>
    </Card>
  )
}

// تعديل مكون LocationMarker للتحقق من الصلاحيات
function LocationMarker({
  position,
  onClick,
  onShopLocationClick,
  isSelectable,
  selectingShopLocation,
  currentUserId,
  barberOwnerId,
}: {
  position: { lat: number; lng: number }
  onClick?: (location: { lat: number; lng: number }) => void
  onShopLocationClick?: (location: { lat: number; lng: number }) => void
  isSelectable?: boolean
  selectingShopLocation?: boolean
  currentUserId?: string
  barberOwnerId?: string
}) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(position, map.getZoom())
  }, [map, position])

  const mapEvents = useMapEvents({
    click(e) {
      // تعزيز التحقق من الصلاحيات - يجب أن يكون المستخدم هو نفسه صاحب الموقع
      const canModifyLocation = isSelectable && currentUserId && barberOwnerId && currentUserId === barberOwnerId

      if (canModifyLocation) {
        const { lat, lng } = e.latlng
        if (onClick) {
          onClick({ lat, lng })
        }
      }
    },
  })

  return null
}

// مكون لعرض الاتجاهات
function DirectionsRenderer({
  origin,
  destination,
}: {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
}) {
  const map = useMap()

  useEffect(() => {
    if (!origin || !destination) return

    // إنشاء خط مستقيم بين النقطتين (تبسيط)
    const polyline = L.polyline(
      [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ],
      { color: "#3b82f6", weight: 4, opacity: 0.7, dashArray: "10, 10" },
    ).addTo(map)

    return () => {
      map.removeLayer(polyline)
    }
  }, [map, origin, destination])

  return null
}

export default function SimpleMap({
  userLocation,
  barbers,
  onClick,
  onShopLocationClick,
  isSelectable = false,
  selectingShopLocation = false,
  selectedLocation = null,
  shopLocation = null,
  showServiceZone = false,
  serviceZoneRadius = 5,
  currentUserId,
  barberOwnerId,
  userType,
  customerLocation = null,
  showDirections = false,
  onBookClick,
}) {
  const mapRef = useRef(null)
  const router = useRouter()

  // تحديث مركز الخريطة عند تغيير موقع المستخدم
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], mapRef.current.getZoom())
    }
  }, [userLocation])

  // تعديل التحقق من صلاحية تعديل الموقع
  const canModifyLocation = isSelectable && currentUserId && barberOwnerId && currentUserId === barberOwnerId

  // معالجة النقر على زر الحجز
  const handleBookClick = (barber) => {
    if (onBookClick) {
      onBookClick(barber)
    } else {
      router.push(`/dashboard/customer/booking/${barber.id}`)
    }
  }

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
      whenCreated={(map) => {
        mapRef.current = map
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* موقع المستخدم الحالي */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={currentLocationIcon}>
        <Popup>
          <div className="text-center">
            <h3 className="font-bold">{userType === "barber" ? "موقعك الحالي" : "موقعك الحالي"}</h3>
            <p className="text-xs text-muted-foreground">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </p>
          </div>
        </Popup>
      </Marker>

      {/* موقع العميل (إذا كان المستخدم حلاق) */}
      {userType === "barber" && customerLocation && (
        <Marker position={[customerLocation.lat, customerLocation.lng]} icon={selectedLocationIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">موقع العميل</h3>
              <p className="text-xs text-muted-foreground">
                {customerLocation.lat.toFixed(6)}, {customerLocation.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* الحلاقين على الخريطة */}
      {barbers &&
        barbers.length > 0 &&
        barbers.map((barber) => {
          // التحقق من وجود موقع صالح للحلاق
          if (!barber.location || typeof barber.location.lat !== "number" || typeof barber.location.lng !== "number") {
            console.warn("تم تخطي حلاق بدون موقع صالح:", barber.name)
            return null
          }

          return (
            <Marker key={barber.id} position={[barber.location.lat, barber.location.lng]} icon={barberIcon}>
              <Popup minWidth={300} maxWidth={300}>
                <BarberInfoCard barber={barber} userType={userType} onBookClick={handleBookClick} />
              </Popup>
            </Marker>
          )
        })}

      {/* الموقع المحدد للمحل */}
      {selectedLocation && (
        <>
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedLocationIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">موقع المحل المحدد</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* منطقة الخدمة */}
          {showServiceZone && (
            <Circle
              center={[selectedLocation.lat, selectedLocation.lng]}
              radius={serviceZoneRadius * 1000} // تحويل من كم إلى متر
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.1,
                weight: 2,
                dashArray: "5, 5",
              }}
            />
          )}
        </>
      )}

      {/* موقع المحل */}
      {shopLocation && (
        <Marker position={[shopLocation.lat, shopLocation.lng]} icon={shopIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">موقع المحل</h3>
              <p className="text-xs text-muted-foreground">
                {shopLocation.lat.toFixed(6)}, {shopLocation.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* عرض الاتجاهات بين المستخدم والعميل/الحلاق */}
      {showDirections && (
        <>
          {userType === "barber" && customerLocation && (
            <DirectionsRenderer origin={userLocation} destination={customerLocation} />
          )}

          {userType === "customer" && barbers.length > 0 && barbers[0].location && (
            <DirectionsRenderer origin={userLocation} destination={barbers[0].location} />
          )}
        </>
      )}

      {/* مكون تحديد الموقع */}
      <LocationMarker
        position={userLocation}
        onClick={canModifyLocation ? onClick : undefined}
        onShopLocationClick={canModifyLocation ? onShopLocationClick : undefined}
        isSelectable={isSelectable}
        selectingShopLocation={selectingShopLocation}
        currentUserId={currentUserId}
        barberOwnerId={barberOwnerId}
      />
    </MapContainer>
  )
}
