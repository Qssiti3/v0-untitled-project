"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, ArrowRight, Loader2, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CustomerNavbar from "@/components/customer-navbar"
import { getUserConversations, getConversationMessages, sendMessage, markMessagesAsRead, getUserInfo } from "@/lib/chat"

export default function CustomerMessages() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("messages")

  // Conversations state
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // Messages state
  const [messages, setMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // User info cache
  const [userInfoCache, setUserInfoCache] = useState({})

  // DOM refs
  const messagesEndRef = useRef(null)

  // Flag to prevent infinite loops
  const initialLoadRef = useRef(false)

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Initial load of conversations - only once when user is available
  useEffect(() => {
    if (user && !initialLoadRef.current) {
      initialLoadRef.current = true
      loadConversations()
    }
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Load conversations
  const loadConversations = async () => {
    if (!user) return

    try {
      setIsLoadingConversations(true)
      const { conversations: userConversations } = await getUserConversations(user.id)
      setConversations(userConversations)

      // If no conversation is selected and there are conversations, select the first one
      if (!selectedConversationId && userConversations.length > 0) {
        setSelectedConversationId(userConversations[0].id)
        loadMessages(userConversations[0].id)
      }

      // Load participant info for all conversations
      await loadParticipantsInfo(userConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // Load participant info
  const loadParticipantsInfo = async (convs) => {
    if (!user || !convs.length) return

    const newCache = { ...userInfoCache }
    const newParticipantIds = []

    // Find new participants that aren't in the cache
    for (const conversation of convs) {
      for (const participantId of conversation.participants) {
        if (participantId !== user.id && !newCache[participantId]) {
          newParticipantIds.push(participantId)
        }
      }
    }

    // Load info for new participants
    if (newParticipantIds.length > 0) {
      for (const id of newParticipantIds) {
        try {
          const info = await getUserInfo(id)
          newCache[id] = info
        } catch (error) {
          console.error(`Error loading user info for ${id}:`, error)
        }
      }

      setUserInfoCache(newCache)
    }
  }

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    if (!conversationId || !user) return

    try {
      setIsLoadingMessages(true)
      const { messages: conversationMessages } = await getConversationMessages(conversationId)
      setMessages(conversationMessages)

      // Mark messages as read
      await markMessagesAsRead(conversationId, user.id)

      // Update unread count in conversations
      setConversations((prevConversations) =>
        prevConversations.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)),
      )
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversationId || !user) return

    try {
      setIsSendingMessage(true)

      // Send the message
      await sendMessage(selectedConversationId, user.id, newMessage)
      setNewMessage("")

      // Reload messages
      await loadMessages(selectedConversationId)

      // Update conversations list to show the latest message
      await loadConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Select a conversation
  const handleSelectConversation = (conversationId) => {
    if (conversationId === selectedConversationId) return

    setSelectedConversationId(conversationId)
    loadMessages(conversationId)
  }

  // Manual refresh
  const handleRefresh = () => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
    loadConversations()
  }

  // Get other participant in a conversation
  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null

    const otherParticipantId = conversation.participants.find((id) => id !== user.id)
    return userInfoCache[otherParticipantId] || { name: "Loading..." }
  }

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" })
  }

  // Show loading screen
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CustomerNavbar user={user} activeTab="messages" setActiveTab={() => {}} logout={logout} />

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
                <ArrowRight className="h-4 w-4 mr-1" />
                <span>Back</span>
              </Button>
              <h1 className="text-2xl font-bold">Messages</h1>
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
              <span>Refresh</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversations list */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle>Conversations</CardTitle>
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
                            <Avatar className="h-10 w-10 mr-3 border">
                              <AvatarImage
                                src={otherParticipant?.profileImage || "/placeholder.svg?height=40&width=40"}
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
                              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <p>No conversations yet</p>
                      <p className="text-sm mt-1">Your conversations will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat window */}
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedConversationId ? (
                  <>
                    <CardHeader className="border-b pb-3">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3 border">
                          {userInfoCache[
                            conversations
                              .find((c) => c.id === selectedConversationId)
                              ?.participants.find((id) => id !== user?.id)
                          ]?.profileImage ? (
                            <AvatarImage
                              src={
                                userInfoCache[
                                  conversations
                                    .find((c) => c.id === selectedConversationId)
                                    ?.participants.find((id) => id !== user?.id)
                                ]?.profileImage || "/placeholder.svg"
                              }
                              alt={
                                userInfoCache[
                                  conversations
                                    .find((c) => c.id === selectedConversationId)
                                    ?.participants.find((id) => id !== user?.id)
                                ]?.name
                              }
                            />
                          ) : (
                            <AvatarFallback>
                              {userInfoCache[
                                conversations
                                  .find((c) => c.id === selectedConversationId)
                                  ?.participants.find((id) => id !== user?.id)
                              ]?.name?.substring(0, 2) || "..."}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle>
                            {userInfoCache[
                              conversations
                                .find((c) => c.id === selectedConversationId)
                                ?.participants.find((id) => id !== user?.id)
                            ]?.name || "Loading..."}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {userInfoCache[
                              conversations
                                .find((c) => c.id === selectedConversationId)
                                ?.participants.find((id) => id !== user?.id)
                            ]?.type === "barber"
                              ? "Barber"
                              : "Customer"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-400px)]">
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
                                <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                                  <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    <p>{message.text}</p>
                                    <div
                                      className={`text-xs mt-1 ${
                                        isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
                                      } text-right`}
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
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Start the conversation by sending a message</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          disabled={isSendingMessage}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={isSendingMessage || !newMessage.trim()}>
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          <span>Send</span>
                        </Button>
                      </form>
                    </CardFooter>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] p-8 text-center text-muted-foreground">
                    <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                    <p>Select a conversation from the list to start chatting</p>
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
