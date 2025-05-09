"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, MessageSquare, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// بيانات تجريبية للرسائل
const MOCK_MESSAGES = [
  {
    id: "msg1",
    senderId: "user1",
    senderName: "أحمد محمد",
    senderType: "customer",
    receiverId: "admin1",
    receiverName: "مدير النظام",
    content: "مرحباً، أواجه مشكلة في حجز موعد مع الحلاق. هل يمكنك المساعدة؟",
    timestamp: "2023-06-10T14:30:00Z",
    read: true,
  },
  {
    id: "msg2",
    senderId: "barber1",
    senderName: "محمد أحمد",
    senderType: "barber",
    receiverId: "admin1",
    receiverName: "مدير النظام",
    content: "أحتاج إلى تحديث قائمة الخدمات التي أقدمها. كيف يمكنني فعل ذلك؟",
    timestamp: "2023-06-11T09:15:00Z",
    read: false,
  },
  {
    id: "msg3",
    senderId: "admin1",
    senderName: "مدير النظام",
    senderType: "admin",
    receiverId: "user1",
    receiverName: "أحمد محمد",
    content:
      "مرحباً أحمد، يمكنك حجز موعد من خلال الضغط على زر 'حجز موعد' في صفحة الحلاق. إذا استمرت المشكلة، يرجى إخباري.",
    timestamp: "2023-06-10T15:45:00Z",
    read: true,
  },
  {
    id: "msg4",
    senderId: "admin1",
    senderName: "مدير النظام",
    senderType: "admin",
    receiverId: "barber1",
    receiverName: "محمد أحمد",
    content: "مرحباً محمد، يمكنك تحديث قائمة الخدمات من خلال الذهاب إلى صفحة الملف الشخصي ثم الضغط على 'تعديل الخدمات'.",
    timestamp: "2023-06-11T10:30:00Z",
    read: false,
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [filteredMessages, setFilteredMessages] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    // تهيئة الرسائل في localStorage إذا لم تكن موجودة
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("messages")) {
        localStorage.setItem("messages", JSON.stringify(MOCK_MESSAGES))
      }

      // جلب الرسائل من localStorage
      const storedMessages = JSON.parse(localStorage.getItem("messages") || "[]")
      setMessages(storedMessages)
      setFilteredMessages(storedMessages)
    }
  }, [])

  useEffect(() => {
    // تطبيق البحث على الرسائل
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const result = messages.filter(
        (message) =>
          message.senderName.toLowerCase().includes(query) ||
          message.receiverName.toLowerCase().includes(query) ||
          message.content.toLowerCase().includes(query),
      )
      setFilteredMessages(result)
    } else {
      setFilteredMessages(messages)
    }
  }, [messages, searchQuery])

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const handleOpenChat = (userId: string, userName: string, userType: string) => {
    setSelectedUser({
      id: userId,
      name: userName,
      type: userType,
    })

    // جلب محادثة المستخدم
    const userChat = messages
      .filter(
        (message) =>
          (message.senderId === userId && message.receiverId === "admin1") ||
          (message.senderId === "admin1" && message.receiverId === userId),
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    setChatMessages(userChat)
    setIsChatOpen(true)

    // تحديث حالة القراءة للرسائل الواردة
    const updatedMessages = messages.map((message) => {
      if (message.senderId === userId && message.receiverId === "admin1" && !message.read) {
        return { ...message, read: true }
      }
      return message
    })

    setMessages(updatedMessages)
    localStorage.setItem("messages", JSON.stringify(updatedMessages))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: "admin1",
      senderName: "مدير النظام",
      senderType: "admin",
      receiverId: selectedUser.id,
      receiverName: selectedUser.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // إضافة الرسالة الجديدة
    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    setChatMessages([...chatMessages, newMsg])
    localStorage.setItem("messages", JSON.stringify(updatedMessages))

    // مسح حقل الرسالة الجديدة
    setNewMessage("")
  }

  // تجميع المستخدمين الفريدين من الرسائل
  const getUniqueUsers = () => {
    const users = new Map()

    messages.forEach((message) => {
      // إضافة المرسل إذا لم يكن الأدمين
      if (message.senderId !== "admin1") {
        users.set(message.senderId, {
          id: message.senderId,
          name: message.senderName,
          type: message.senderType,
          lastMessage: message.content,
          timestamp: message.timestamp,
          unread: message.receiverId === "admin1" && !message.read ? 1 : 0,
        })
      }

      // إضافة المستقبل إذا لم يكن الأدمين
      if (message.receiverId !== "admin1") {
        const existingUser = users.get(message.receiverId)
        if (existingUser) {
          // تحديث آخر رسالة إذا كانت أحدث
          if (new Date(message.timestamp) > new Date(existingUser.timestamp)) {
            existingUser.lastMessage = message.content
            existingUser.timestamp = message.timestamp
          }
        } else {
          users.set(message.receiverId, {
            id: message.receiverId,
            name: message.receiverName,
            type: message.senderType === "admin" ? message.receiverType : message.senderType,
            lastMessage: message.content,
            timestamp: message.timestamp,
            unread: 0,
          })
        }
      }
    })

    // حساب عدد الرسائل غير المقروءة لكل مستخدم
    messages.forEach((message) => {
      if (message.senderId !== "admin1" && !message.read) {
        const user = users.get(message.senderId)
        if (user) {
          user.unread += 1
        }
      }
    })

    return Array.from(users.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const uniqueUsers = getUniqueUsers()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الرسائل</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>المحادثات</CardTitle>
            <CardDescription>قائمة المحادثات مع المستخدمين</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="البحث عن محادثة..."
                className="w-full pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">لا توجد محادثات</div>
              ) : (
                uniqueUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent ${
                      selectedUser?.id === user.id ? "bg-accent" : ""
                    }`}
                    onClick={() => handleOpenChat(user.id, user.name, user.type)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{user.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.lastMessage}</p>
                    </div>
                    {user.unread > 0 && <Badge className="ml-auto">{user.unread}</Badge>}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <span>{selectedUser.name}</span>
                  <Badge variant={selectedUser.type === "barber" ? "default" : "secondary"} className="mr-2">
                    {selectedUser.type === "barber" ? "حلاق" : "زبون"}
                  </Badge>
                </div>
              ) : (
                "المحادثة"
              )}
            </CardTitle>
            <CardDescription>{selectedUser ? "المحادثة مع " + selectedUser.name : "اختر محادثة للبدء"}</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>اختر محادثة من القائمة للبدء</p>
              </div>
            ) : (
              <div className="flex flex-col h-[400px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "admin1" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderId === "admin1" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.senderId === "admin1" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="اكتب رسالتك هنا..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="h-auto">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
