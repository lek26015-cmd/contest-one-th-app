'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline sm:text-5xl">
          ติดต่อเรา
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          เราพร้อมรับฟังทุกข้อเสนอแนะและตอบทุกคำถามของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <Send className="h-6 w-6 text-primary"/>
                ส่งข้อความถึงเรา
            </CardTitle>
            <CardDescription>
                กรอกแบบฟอร์มด้านล่างและทีมงานของเราจะติดต่อกลับโดยเร็วที่สุด
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ</Label>
                <Input id="name" placeholder="ชื่อ-นามสกุลของคุณ" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">หัวข้อ</Label>
                <Select>
                    <SelectTrigger id="subject">
                        <SelectValue placeholder="เลือกหัวข้อที่ต้องการติดต่อ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="general">สอบถามข้อมูลทั่วไป</SelectItem>
                        <SelectItem value="support">แจ้งปัญหาการใช้งาน</SelectItem>
                        <SelectItem value="partnership">ติดต่อเรื่องความร่วมมือ</SelectItem>
                        <SelectItem value="feedback">ข้อเสนอแนะ</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">ข้อความ</Label>
                <Textarea id="message" placeholder="เขียนข้อความของคุณที่นี่..." className="min-h-[120px]" />
              </div>
              <Button type="submit" className="w-full" size="lg">
                ส่งข้อความ
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info & Map */}
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>ช่องทางอื่นๆ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-foreground/80">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-foreground">ที่อยู่</h3>
                            <p>123 อาคารเฟิร์สทาวเวอร์, ถนนสุขุมวิท, แขวงคลองเตยเหนือ, เขตวัฒนา, กรุงเทพมหานคร 10110</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-foreground">อีเมล</h3>
                            <a href="mailto:support@contestone-th.com" className="hover:text-primary hover:underline">support@contestone-th.com</a>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-foreground">โทรศัพท์</h3>
                            <p>02-853-6999</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div className="rounded-lg overflow-hidden border shadow-lg">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.819313271816!2d100.5612194153597!3d13.729608901631473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f0f6e1f0e4b%3A0x6c6c3f0b3f0b3f0b!2sGoogle%20Thailand!5e0!3m2!1sen!2sth!4v1678886400000"
                    width="100%"
                    height="350"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Location"
                ></iframe>
            </div>
        </div>
      </div>
    </div>
  );
}
