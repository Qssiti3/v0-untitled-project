"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface RateBarberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
  onRateSubmit: (rating: number, feedback: string) => Promise<void>
}

export function RateBarberDialog({ open, onOpenChange, appointment, onRateSubmit }: RateBarberDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تقييم من 1 إلى 5 نجوم",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onRateSubmit(rating, feedback)
      toast({
        title: "تم التقييم بنجاح",
        description: "شكراً لك على تقييم الخدمة",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال التقييم",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تقييم الخدمة</DialogTitle>
          <DialogDescription>
            يرجى تقييم خدمة الحلاق {appointment?.barberName} للموعد بتاريخ {appointment?.date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-center mb-2">كيف كانت تجربتك مع الحلاق؟</div>
            <div className="flex items-center justify-center gap-1 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {rating === 1 && "سيء"}
              {rating === 2 && "مقبول"}
              {rating === 3 && "جيد"}
              {rating === 4 && "جيد جداً"}
              {rating === 5 && "ممتاز"}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              ملاحظات إضافية (اختياري)
            </label>
            <Textarea
              id="feedback"
              placeholder="أخبرنا المزيد عن تجربتك..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري الإرسال..." : "إرسال التقييم"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
