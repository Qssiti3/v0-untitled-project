"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth"
import { sendSupportMessage, getSupportMessages } from "@/lib/support"

export default function SupportChat() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showNewUserMessage, setShowNewUserMessage] = useState(false)

  // التحقق مما إذا كان المستخدم جديدًا (تم إنشاء حسابه في آخر 10 دقائق)
  useEffect(() => {
    if (user) {
      const userCreatedAt = new Date(user.createdAt).getTime()
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000
      if (userCreatedAt > tenMinutesAgo) {
        setShowNewUserMessage(true)
        // فتح نافذة الدردشة تلقائيًا للمستخدمين الجدد بعد 3 ثوانٍ
        setTimeout(() => {
          setIsOpen(true)
          // إضافة رسالة ترحيبية
          const welcomeMessage = {
            id: `welcome_${Date.now()}`,
            senderId: "system",
            senderName: "فريق الدعم",
            message: `مرحبًا ${user.name}! كيف يمكننا مساعدتك اليوم؟`,
            timestamp: new Date().toISOString(),
            isRead: false,
          }
          setMessages((prev) => [...prev, welcomeMessage])
        }, 3000)
      }
    }
  }, [user])

  // جلب رسائل الدعم الفني
  useEffect(() => {
    if (user && isOpen) {
      loadMessages()
    }
  }, [user, isOpen])

  // التمرير إلى آخر الرسائل
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  const loadMessages = async () => {
    if (!user) return

    try {
      const userMessages = await getSupportMessages(user.id)
      setMessages(userMessages)
    } catch (error) {
      console.error("خطأ في جلب رسائل الدعم:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return

    setIsLoading(true)
    try {
      const newMessage = await sendSupportMessage({
        userId: user.id,
        userName: user.name,
        userType: user.type,
        message: message.trim(),
      })

      setMessages((prev) => [...prev, newMessage])
      setMessage("")
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // تنسيق التاريخ والوقت
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <>
      {/* زر الدردشة العائم */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg"
          variant={showNewUserMessage ? "destructive" : "default"}
        >
          <MessageCircle className="h-6 w-6" />
          {showNewUserMessage && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              1
            </span>
          )}
        </Button>
      </div>

      {/* نافذة الدردشة */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 md:w-96">
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">الدعم الفني</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-80 pr-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center py-8 text-center text-muted-foreground">
                      ابدأ محادثة مع فريق الدعم الفني
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <div className="mb-1 text-xs opacity-70">
                            {msg.senderId === user?.id ? "أنت" : msg.senderName} • {formatTime(msg.timestamp)}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-3">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="اكتب رسالتك هنا..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 ml-2"
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} size="icon" disabled={!message.trim() || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
