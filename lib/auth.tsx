"use client"

// مكتبة للتعامل مع المصادقة وإدارة المستخدمين
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

// نوع المستخدم
export type UserType = {
  id: string
  name: string
  email: string
  type: "customer" | "barber" | "admin"
  [key: string]: any
}

// بيانات تجريبية للمستخدمين
const MOCK_USERS = [
  {
    id: "admin1",
    name: "مدير النظام",
    email: "Qssiti",
    password: "Qssiti12345",
    type: "admin",
    phone: "0500000000",
    profileImage: "/placeholder.svg?height=200&width=200&text=م",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "customer_2001",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    password: "password123",
    type: "customer",
    phone: "0501234567",
    address: "الرياض، حي الملز، شارع الستين",
    location: { lat: 24.6917, lng: 46.7169 },
    profileImage: "/placeholder.svg?height=200&width=200&text=أ",
    joinDate: "2023-05-10",
    completedBookings: 8,
  },
  {
    id: "barber_1001",
    name: "محمد أحمد",
    email: "mohamed@example.com",
    password: "password123",
    type: "barber",
    phone: "0512345678",
    experience: 5,
    rating: 4.8,
    reviews: 32,
    location: { lat: 24.7136, lng: 46.6753 },
    distance: 2.5,
    availability: ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    services: [
      { id: "s1", name: "قص شعر", price: 50 },
      { id: "s2", name: "حلاقة لحية", price: 30 },
      { id: "s3", name: "تصفيف شعر", price: 40 },
      { id: "s4", name: "صبغة شعر", price: 120 },
      { id: "s5", name: "علاج الشعر", price: 150 },
    ],
    description: "حلاق محترف متخصص في قصات الشعر العصرية واللحى، خبرة أكثر من 5 سنوات في مجال الحلاقة الرجالية",
    isAvailable: true,
    profileImage: "/placeholder.svg?height=200&width=200&text=م",
    serviceZone: 5,
    serviceMode: "both",
    shopAddress: "الرياض، حي النزهة، شارع الأمير سلطان",
    joinDate: "2023-01-15",
    completedBookings: 128,
  },
]

// تهيئة البيانات في localStorage إذا لم تكن موجودة
const initializeAuthData = () => {
  if (typeof window !== "undefined") {
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(MOCK_USERS))
    }

    // تهيئة بيانات المواعيد إذا لم تكن موجودة
    if (!localStorage.getItem("appointments")) {
      const MOCK_APPOINTMENTS = [
        {
          id: "app1",
          customerId: "customer_2001",
          customerName: "أحمد محمد",
          barberId: "barber_1001",
          barberName: "محمد أحمد",
          date: "2023-05-20",
          time: "10:00",
          services: ["قص شعر", "حلاقة لحية"],
          totalPrice: 80,
          status: "completed",
          createdAt: "2023-05-15T14:30:00Z",
          location: "الرياض، حي النزهة",
          rating: 4.5,
        },
        {
          id: "app2",
          customerId: "customer_2001",
          customerName: "أحمد محمد",
          barberId: "barber_1001",
          barberName: "محمد أحمد",
          date: "2023-06-05",
          time: "14:00",
          services: ["قص شعر"],
          totalPrice: 50,
          status: "scheduled",
          createdAt: "2023-06-01T09:15:00Z",
          location: "الرياض، حي النزهة",
        },
        {
          id: "app3",
          customerId: "customer_2001",
          customerName: "أحمد محمد",
          barberId: "barber_1001",
          barberName: "محمد أحمد",
          date: "2023-06-10",
          time: "16:00",
          services: ["تصفيف شعر", "حلاقة لحية"],
          totalPrice: 70,
          status: "cancelled",
          createdAt: "2023-06-02T11:45:00Z",
          location: "الرياض، حي النزهة",
        },
      ]
      localStorage.setItem("appointments", JSON.stringify(MOCK_APPOINTMENTS))
    }

    // تهيئة رسائل الدعم الفني إذا لم تكن موجودة
    if (!localStorage.getItem("supportMessages")) {
      localStorage.setItem("supportMessages", JSON.stringify([]))
    }
  }
}

// استدعاء دالة التهيئة
if (typeof window !== "undefined") {
  initializeAuthData()
}

// دالة تسجيل الدخول
export async function loginUser(email: string, password: string) {
  try {
    console.log("محاولة تسجيل الدخول:", email)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // الحصول على المستخدمين من localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    console.log("قائمة المستخدمين:", users)

    // البحث عن المستخدم بالبريد الإلكتروني وكلمة المرور
    const user = users.find((u: any) => (u.email === email || u.email === email) && u.password === password)
    console.log("المستخدم الذي تم العثور عليه:", user)

    if (!user) {
      throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
    }

    // التحقق من حالة الحظر
    if (user.isBlocked) {
      // حفظ معلومات الحظر في localStorage
      const blockInfo = {
        type: "blocked",
        reason: user.blockReason || "مخالفة شروط الاستخدام",
      }
      localStorage.setItem("suspensionInfo", JSON.stringify(blockInfo))

      throw new Error("تم حظر حسابك. يرجى التواصل مع الدعم الفني.")
    }

    // التحقق من حالة الإيقاف المؤقت
    if (user.isSuspended) {
      // التحقق مما إذا كانت فترة الإيقاف قد انتهت
      const suspendedUntil = new Date(user.suspendedUntil)
      const now = new Date()

      if (suspendedUntil > now) {
        // حساب المدة المتبقية للإيقاف
        const remainingDays = Math.ceil((suspendedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // تنسيق تاريخ انتهاء الإيقاف
        const formattedDate = suspendedUntil.toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })

        // حفظ معلومات الإيقاف في localStorage
        const suspensionInfo = {
          type: "suspended",
          reason: user.suspensionReason || "مخالفة شروط الاستخدام",
          until: formattedDate,
          remainingDays: remainingDays,
        }
        localStorage.setItem("suspensionInfo", JSON.stringify(suspensionInfo))

        throw new Error(
          `تم إيقاف حسابك مؤقتًا. يمكنك تسجيل الدخول بعد ${remainingDays} يوم. السبب: ${user.suspensionReason || "مخالفة شروط الاستخدام"}`,
        )
      } else {
        // إلغاء الإيقاف المؤقت إذا انتهت المدة
        user.isSuspended = false
        user.suspendedUntil = null
        user.suspensionReason = null

        // تحديث بيانات المستخدم في localStorage
        const updatedUsers = users.map((u: any) => (u.id === user.id ? user : u))
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      }
    }

    // حفظ بيانات المستخدم في localStorage (باستثناء كلمة المرور)
    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
    console.log("تم تسجيل الدخول بنجاح:", userWithoutPassword)

    return { user: userWithoutPassword }
  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error)
    throw error
  }
}

// دالة تسجيل الخروج
export async function logoutUser() {
  try {
    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 500))

    // حذف بيانات المستخدم من localStorage
    localStorage.removeItem("currentUser")

    return { success: true }
  } catch (error) {
    console.error("خطأ في تسجيل الخروج:", error)
    throw error
  }
}

// دالة التسجيل
export async function registerUser(userData: {
  name: string
  email: string
  password: string
  type: "customer" | "barber" | "admin"
  phone: string
  [key: string]: any
}) {
  try {
    console.log("بيانات التسجيل:", userData)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // الحصول على المستخدمين من localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    console.log("المستخدمون الحاليون:", users)

    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    const existingUser = users.find((u: any) => u.email === userData.email)

    if (existingUser) {
      throw new Error("البريد الإلكتروني مستخدم بالفعل")
    }

    // إنشاء معرف فريد للمستخدم الجديد
    const newUserId = userData.type === "customer" ? `customer_${Date.now()}` : `barber_${Date.now()}`

    // إنشاء المستخدم الجديد
    const newUser = {
      id: newUserId,
      ...userData,
      profileImage: `/placeholder.svg?height=200&width=200&text=${userData.name.charAt(0)}`,
      createdAt: new Date().toISOString(),
      joinDate: new Date().toISOString().split("T")[0],
      completedBookings: 0,
      isBlocked: false,
      isSuspended: false,
    }

    // إضافة المستخدم الجديد إلى المصفوفة
    users.push(newUser)

    // حفظ المستخدمين المحدثين في localStorage
    localStorage.setItem("users", JSON.stringify(users))
    console.log("تم تحديث المستخدمين:", users)

    // حفظ بيانات المستخدم في localStorage (باستثناء كلمة المرور)
    const { password: _, ...userWithoutPassword } = newUser
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
    console.log("تم تسجيل المستخدم الجديد:", userWithoutPassword)

    return { user: userWithoutPassword }
  } catch (error) {
    console.error("خطأ في التسجيل:", error)
    throw error
  }
}

// إنشاء سياق المصادقة
interface AuthContextType {
  user: UserType | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ user: UserType }>
  register: (userData: any) => Promise<{ user: UserType }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// مزود سياق المصادقة
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // التحقق من وجود جلسة مستخدم عند تحميل التطبيق
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)

        // التحقق من حالة الإيقاف المؤقت عند تحميل التطبيق
        if (parsedUser.isSuspended && parsedUser.suspendedUntil) {
          const suspendedUntil = new Date(parsedUser.suspendedUntil)
          const now = new Date()

          if (suspendedUntil <= now) {
            // إلغاء الإيقاف المؤقت إذا انتهت المدة
            parsedUser.isSuspended = false
            parsedUser.suspendedUntil = null
            parsedUser.suspensionReason = null

            // تحديث بيانات المستخدم في localStorage
            localStorage.setItem("currentUser", JSON.stringify(parsedUser))

            // تحديث بيانات المستخدم في قائمة المستخدمين
            const users = JSON.parse(localStorage.getItem("users") || "[]")
            const updatedUsers = users.map((u: any) =>
              u.id === parsedUser.id ? { ...u, isSuspended: false, suspendedUntil: null, suspensionReason: null } : u,
            )
            localStorage.setItem("users", JSON.stringify(updatedUsers))
          }
        }

        setUser(parsedUser)
        console.log("تم استعادة المستخدم من التخزين المحلي:", parsedUser)
      } catch (err) {
        console.error("خطأ في تحليل بيانات المستخدم:", err)
        localStorage.removeItem("currentUser")
      }
    }

    // تهيئة بيانات المصادقة
    initializeAuthData()
    setIsLoading(false)
  }, [])

  // تسجيل الدخول
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginUser(email, password)
      setUser(result.user)
      return result
    } catch (err: any) {
      setError(err.message)

      // التحقق مما إذا كان الخطأ متعلقًا بالحظر أو الإيقاف المؤقت
      if (err.message.includes("تم حظر حسابك") || err.message.includes("تم إيقاف حسابك")) {
        // توجيه المستخدم إلى صفحة الإيقاف
        router.push("/account-suspended")
      }

      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // إنشاء حساب جديد
  const register = async (userData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await registerUser(userData)
      setUser(result.user)
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // تسجيل الخروج
  const logout = () => {
    logoutUser()
      .then(() => {
        setUser(null)
        router.push("/login")
      })
      .catch((err) => {
        console.error("خطأ في تسجيل الخروج:", err)
      })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

// هوك لاستخدام سياق المصادقة
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
