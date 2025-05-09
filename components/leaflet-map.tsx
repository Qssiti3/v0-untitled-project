"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), { ssr: false })
const useMapEvents = dynamic(() => import("react-leaflet").then((mod) => mod.useMapEvents), { ssr: false })

// Import Icon only on client side
let Icon
if (typeof window !== "undefined") {
  Icon = require("leaflet").Icon
  require("leaflet/dist/leaflet.css")
}

// تعريف أيقونات مخصصة
const userIcon =
  typeof window !== "undefined" && Icon
    ? new Icon({
        iconUrl: "/user-marker.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })
    : null

const barberIcon =
  typeof window !== "undefined" && Icon
    ? new Icon({
        iconUrl: "/barber-marker.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })
    : null

// مكون لتحديث مركز الخريطة
function ChangeView({ center }) {
  const map = useMap()
  map.setView(center, map.getZoom())
  return null
}

// مكون لتسجيل أحداث النقر على الخريطة
function MapClickHandler({ onClick, isSelectable }) {
  useMapEvents({
    click: (e) => {
      if (isSelectable && onClick) {
        onClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        })
      }
    },
  })
  return null
}

interface LeafletMapProps {
  userLocation: { lat: number; lng: number }
  barbers: any[]
  onClick?: (location: { lat: number; lng: number }) => void
  selectBarber?: (barber: any) => void
  isSelectable?: boolean
  selectedLocation?: { lat: number; lng: number } | null
}

export default function LeafletMap({
  userLocation,
  barbers,
  onClick,
  selectBarber,
  isSelectable = false,
  selectedLocation = null,
}: LeafletMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  // تجنب مشاكل عدم تطابق الخادم والعميل
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الخريطة...</span>
      </div>
    )
  }

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* تحديث مركز الخريطة عند تغيير موقع المستخدم */}
      <ChangeView center={[userLocation.lat, userLocation.lng]} />

      {/* تسجيل أحداث النقر على الخريطة */}
      <MapClickHandler onClick={onClick} isSelectable={isSelectable} />

      {/* مؤشر موقع المستخدم */}
      {userIcon && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">موقعك الحالي</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* مؤشر الموقع المحدد (إذا كان موجودًا) */}
      {selectedLocation && barberIcon && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={barberIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">الموقع المحدد</p>
              <p className="text-xs">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* مؤشرات الحلاقين */}
      {barbers.map(
        (barber) =>
          barberIcon && (
            <Marker key={barber.id} position={[barber.location.lat, barber.location.lng]} icon={barberIcon}>
              <Popup>
                <div className="p-2 max-w-[200px]">
                  <h3 className="font-bold">{barber.name}</h3>
                  <p className="text-sm mb-2">
                    التقييم: {barber.rating} ⭐ ({barber.reviews})
                  </p>
                  <p className="text-sm mb-2">يبعد: {barber.distance} كم</p>
                  {selectBarber && (
                    <Button size="sm" className="w-full mt-2" onClick={() => selectBarber(barber)}>
                      اختر هذا الحلاق
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ),
      )}
    </MapContainer>
  )
}
