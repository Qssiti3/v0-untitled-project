import { NextResponse } from "next/server"
import { generateUniqueId, generateShortId } from "@/lib/api"

export async function POST(request: Request) {
  try {
    const userData = await request.json()
    const { name, email, password, type, phone } = userData

    // التحقق من صحة المدخلات
    if (!name || !email || !password || !type || !phone) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    // التحقق من صحة البريد الإلكتروني
    if (!email.includes("@")) {
      return NextResponse.json({ error: "يرجى إدخال بريد إلكتروني صحيح" }, { status: 400 })
    }

    // إنشاء معرفات فريدة للمستخدم
    const id = generateUniqueId(type)
    const uid = generateShortId(type)

    // محاكاة إنشاء مستخدم جديد
    const newUser = {
      id,
      uid,
      name,
      email,
      type,
      phone,
      joinDate: new Date().toISOString().split("T")[0],
      completedBookings: 0,
      createdAt: new Date().toISOString(),
    }

    // في تطبيق حقيقي، ستقوم بتخزين المستخدم في قاعدة البيانات هنا
    // هنا نقوم بتخزينه في localStorage للمحاكاة
    if (typeof window !== "undefined") {
      if (type === "barber") {
        const barbers = JSON.parse(localStorage.getItem("barbers") || "[]")
        barbers.push({
          ...newUser,
          rating: 0,
          reviews: 0,
          experience: 0,
          services: [],
          isAvailable: true,
          profileImage: `/placeholder.svg?height=200&width=200&text=${name.substring(0, 1)}`,
        })
        localStorage.setItem("barbers", JSON.stringify(barbers))
      } else if (type === "customer") {
        const customers = JSON.parse(localStorage.getItem("customers") || "[]")
        customers.push({
          ...newUser,
          address: "",
          location: null,
          profileImage: `/placeholder.svg?height=200&width=200&text=${name.substring(0, 1)}`,
        })
        localStorage.setItem("customers", JSON.stringify(customers))
      }
    }

    return NextResponse.json({
      message: "تم إنشاء الحساب بنجاح",
      user: newUser,
      token: "mock_jwt_token_" + newUser.id,
    })
  } catch (error) {
    console.error("خطأ في إنشاء الحساب:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الحساب" }, { status: 500 })
  }
}
