"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, User, Calendar, Clock, Search } from "lucide-react"
import { getAllSupportMessages, markMessagesAsRead, sendAdminReply } from "@/lib/support"

export default function AdminSupportPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [replyMessage, setReplyMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && user.type === "admin") {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    try {
      const data = await getAllSupportMessages()
      setConversations(data)
    } catch (error) {
      console.error("خطأ في تحميل المحادثات:", error)
    }
  }

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversation(conversation)

    // تحديث حالة قراءة الرسائل
    if (conversation.unreadCount > 0) {
      try {
        await markMessagesAsRead(conversation.userId)

        // تحديث قائمة المحادثات
        setConversations((prev) =>
          prev.map((conv) => (conv.userId === conversation.userId ? { ...conv, unreadCount: 0 } : conv)),
        )
      } catch (error) {
        console.error("خطأ في تحديث حالة القراءة:", error)
      }
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation) return

    setIsReplying(true)
    try {
      await sendAdminReply({
        userId: selectedConversation.userId,
        message: replyMessage.trim(),
      })

      // إعادة تحميل المحادثات
      await loadConversations()

      // تحديث المحادثة المحددة
      const updatedConversations = await getAllSupportMessages()
      const updatedConversation = updatedConversations.find((conv) => conv.userId === selectedConversation.userId)

      if (updatedConversation) {
        setSelectedConversation(updatedConversation)
      }

      setReplyMessage("")
    } catch (error) {
      console.error("خطأ في إرسال الرد:", error)
    } finally {
      setIsReplying(false)
    }
  }

  // تنسيق التاريخ والوقت
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })
  }

  // تصفية المحادثات حسب البحث
  const filteredConversations = conversations.filter(
    (conv) => conv.userName.includes(searchQuery) || conv.lastMessage.includes(searchQuery),
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user || user.type !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>إدارة الدعم الفني</CardTitle>
          <CardDescription>إدارة محادثات الدعم الفني مع المستخدمين</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* قائمة المحادثات */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">المحادثات</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {filteredConversations.length === 0 ? (
                      <div className="flex h-32 items-center justify-center text-muted-foreground">لا توجد محادثات</div>
                    ) : (
                      <div className="space-y-0.5">
                        {filteredConversations.map((conversation) => (
                          <div
                            key={conversation.userId}
                            className={`cursor-pointer p-3 transition-colors hover:bg-muted/50 ${
                              selectedConversation?.userId === conversation.userId ? "bg-muted" : ""
                            }`}
                            onClick={() => handleSelectConversation(conversation)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {conversation.userName}
                                <Badge
                                  variant={conversation.userType === "customer" ? "secondary" : "outline"}
                                  className="mr-2 text-xs"
                                >
                                  {conversation.userType === "customer" ? "زبون" : "حلاق"}
                                </Badge>
                              </div>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {conversation.lastMessage}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {formatDate(conversation.lastMessageTime)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* تفاصيل المحادثة */}
            <div className="md:col-span-2">
              <Card className="h-full">
                {!selectedConversation ? (
                  <div className="flex h-[calc(100vh-250px)] items-center justify-center text-muted-foreground">
                    اختر محادثة لعرض التفاصيل
                  </div>
                ) : (
                  <>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedConversation.userName}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant={selectedConversation.userType === "customer" ? "secondary" : "outline"}>
                              {selectedConversation.userType === "customer" ? "زبون" : "حلاق"}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {selectedConversation.userId}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Separator />
                      <ScrollArea className="h-[calc(100vh-380px)] p-4">
                        <div className="space-y-4">
                          {selectedConversation.messages.map((msg: any) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderId === "system" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  msg.senderId === "system" ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <div className="mb-1 flex items-center gap-2 text-xs opacity-70">
                                  <span>{msg.senderId === "system" ? "فريق الدعم" : msg.senderName}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {formatDate(msg.timestamp)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {formatTime(msg.timestamp)}
                                  </span>
                                </div>
                                <div className="text-sm">{msg.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Separator />
                      <div className="p-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="اكتب ردك هنا..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                            className="flex-1 ml-2"
                            disabled={isReplying}
                          />
                          <Button onClick={handleSendReply} disabled={!replyMessage.trim() || isReplying}>
                            {isReplying ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Send className="h-4 w-4 ml-2" />
                            )}
                            <span>إرسال</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
