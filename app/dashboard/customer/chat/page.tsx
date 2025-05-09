"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, ArrowRight, Loader2, RefreshCw, Users } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CustomerNavbar from "@/components/customer-navbar"
import { getUserConversations, getConversationMessages, sendMessage, markMessagesAsRead, getUserInfo } from "@/lib/chat"

export default function CustomerChat() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("chat")

  // حالة المحادثات
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // حالة الرسائل
  const [messages, setMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // معلومات المستخدمين
  const [participants, setParticipants] = useState({})

  // مراجع DOM
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // التحقق من المستخدم
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (!authLoading && user?.type !== "customer") {
      router.push("/dashboard/barber/chat")
    }
  }, [user, authLoading, router])

  // تحميل المحادثات عند بدء التشغيل
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  // تحميل المحادثة من URL إذا كانت موجودة
  useEffect(() => {
    const conversationId = searchParams?.get("id")
    if (conversationId && user) {
      setSelectedConversationId(conversationId)
      loadMessages(conversationId)
    }
  }, [searchParams, user])

  // التمرير إلى آخر رسالة عند تحديث الرسائل
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // تحميل المحادثات
  const loadConversations = async () => {
    if (!user) return

    try {
      setIsLoadingConversations(true)
      const { conversations: userConversations } = await getUserConversations(user.id)
      setConversations(userConversations)

      // إذا لم يتم تحديد محادثة وهناك محادثات متاحة، اختر الأولى
      if (!selectedConversationId && userConversations.length > 0) {
        setSelectedConversationId(userConversations[0].id)
        loadMessages(userConversations[0].id)
      }

      // تحميل معلومات المشاركين
      await loadParticipantsInfo(userConversations)
    } catch (error) {
      console.error("خطأ في تحميل المحادثات:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // تحميل معلومات المشاركين
  const loadParticipantsInfo = async (convs) => {
    if (!user || !convs.length) return

    const participantsInfo = { ...participants }
    const newParticipantIds = []

    // تحديد المشاركين الجدد
    for (const conversation of convs) {
      for (const participantId of conversation.participants) {
        if (participantId !== user.id && !participantsInfo[participantId]) {
          newParticipantIds.push(participantId)
        }
      }
    }

    // تحميل معلومات المشاركين الجدد
    if (newParticipantIds.length > 0) {
      for (const id of newParticipantIds) {
        try {
          const info = await getUserInfo(id)
          participantsInfo[id] = info
        } catch (error) {
          console.error(`خطأ في تحميل معلومات المستخدم ${id}:`, error)
        }
      }

      setParticipants(participantsInfo)
    }
  }

  // تحميل رسائل محادثة معينة
  const loadMessages = async (conversationId) => {
    if (!conversationId || !user) return

    try {
      setIsLoadingMessages(true)
      const { messages: conversationMessages } = await getConversationMessages(conversationId)
      setMessages(conversationMessages)

      // تحديث حالة قراءة الرسائل
      await markMessagesAsRead(conversationId, user.id)

      // تحديث عدد الرسائل غير المقروءة في المحادثات
      setConversations((prevConversations) =>
        prevConversations.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)),
      )
    } catch (error) {
      console.error("خطأ في تحميل الرسائل:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // إرسال رسالة جديدة
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversationId || !user) return

    try {
      setIsSendingMessage(true)

      // إرسال الرسالة
      await sendMessage(selectedConversationId, user.id, newMessage)
      setNewMessage("")

      // تحديث الرسائل والمحادثات
      await loadMessages(selectedConversationId)
      await loadConversations()
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  // اختيار محادثة
  const handleSelectConversation = (conversationId) => {
    if (conversationId === selectedConversationId) return

    setSelectedConversationId(conversationId)
    loadMessages(conversationId)

    // تحديث URL
    router.push(`/dashboard/customer/chat?id=${conversationId}`, { scroll: false })
  }

  // تحديث المحادثات والرسائل يدويًا
  const handleRefresh = async () => {
    await loadConversations()

    if (selectedConversationId) {
      await loadMessages(selectedConversationId)
    }
  }

  // الحصول على معلومات المشارك الآخر في المحادثة
  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null

    const otherParticipantId = conversation.participants.find((id) => id !== user.id)
    return participants[otherParticipantId] || { name: "..." }
  }

  // الحصول على المحادثة المحددة
  const getSelectedConversation = () => {
    return conversations.find((conv) => conv.id === selectedConversationId) || null
  }

  // تنسيق الوقت والتاريخ
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })
  }

  // عرض شاشة التحميل
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    )
  }

  const selectedConversation = getSelectedConversation()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CustomerNavbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} logout={() => {}} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="ml-2">
                <ArrowRight className="h-4 w-4 ml-1" />
                <span>العودة</span>
              </Button>
              <h1 className="text-2xl font-bold">المحادثات</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingConversations || isLoadingMessages}
              className="flex items-center gap-1"
            >
              {isLoadingConversations || isLoadingMessages ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>تحديث</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* قائمة المحادثات */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>المحادثات</span>
                    </CardTitle>
                    <Badge variant="outline">{conversations.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100vh-300px)] overflow-y-auto">
                  {isLoadingConversations && conversations.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.map((conversation) => {
                        const otherParticipant = getOtherParticipant(conversation)
                        return (
                          <div
                            key={conversation.id}
                            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                              selectedConversationId === conversation.id
                                ? "bg-primary/10 hover:bg-primary/15"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleSelectConversation(conversation.id)}
                          >
                            <Avatar className="h-10 w-10 ml-3 border">
                              <AvatarImage
                                src={otherParticipant?.profileImage || "/placeholder.svg"}
                                alt={otherParticipant?.name}
                              />
                              <AvatarFallback>{otherParticipant?.name?.substring(0, 2) || "..."}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">{otherParticipant?.name}</h3>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.lastMessage?.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage?.text}</p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Users className="h-12 w-12 mb-2 opacity-20" />
                      <p>لا توجد محادثات</p>
                      <p className="text-sm mt-1">ستظهر المحادثات هنا عندما تتواصل مع الحلاقين</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* نافذة المحادثة */}
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedConversation ? (
                  <>
                    <CardHeader className="border-b pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 ml-3 border">
                            <AvatarImage
                              src={getOtherParticipant(selectedConversation)?.profileImage || "/placeholder.svg"}
                              alt={getOtherParticipant(selectedConversation)?.name}
                            />
                            <AvatarFallback>
                              {getOtherParticipant(selectedConversation)?.name?.substring(0, 2) || "..."}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{getOtherParticipant(selectedConversation)?.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {getOtherParticipant(selectedConversation)?.type === "barber" ? "حلاق" : "عميل"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadMessages(selectedConversationId)}
                          disabled={isLoadingMessages}
                          className="flex items-center gap-1"
                        >
                          {isLoadingMessages ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          <span>تحديث</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-400px)]"
                    >
                      {isLoadingMessages && messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((message, index) => {
                            const isCurrentUser = message.senderId === user?.id
                            const showDate =
                              index === 0 ||
                              new Date(message.timestamp).toDateString() !==
                                new Date(messages[index - 1].timestamp).toDateString()

                            return (
                              <div key={message.id}>
                                {showDate && (
                                  <div className="flex justify-center my-4">
                                    <Badge variant="outline" className="bg-muted">
                                      {formatDate(message.timestamp)}
                                    </Badge>
                                  </div>
                                )}
                                <div className={`flex ${isCurrentUser ? "justify-start" : "justify-end"}`}>
                                  <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    <p>{message.text}</p>
                                    <div
                                      className={`text-xs mt-1 ${
                                        isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
                                      } text-left`}
                                    >
                                      {formatTime(message.timestamp)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                          <p>لا توجد رسائل</p>
                          <p className="text-sm mt-1">ابدأ المحادثة بإرسال رسالة</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                        <Input
                          placeholder="اكتب رسالتك هنا..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSendingMessage}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={isSendingMessage || !newMessage.trim()}>
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          ) : (
                            <Send className="h-4 w-4 ml-2" />
                          )}
                          <span>إرسال</span>
                        </Button>
                      </form>
                    </CardFooter>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] p-8 text-center text-muted-foreground">
                    <Users className="h-16 w-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2">لا توجد محادثة محددة</h3>
                    <p className="mb-2">اختر محادثة من القائمة للبدء</p>
                    {conversations.length === 0 && !isLoadingConversations && (
                      <p className="text-sm">لا توجد محادثات حالية</p>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
