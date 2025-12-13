'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

const generalFaqs = [
    {
        question: "ContestOne-th คืออะไร?",
        answer: "ContestOne<sup>th</sup> คือแพลตฟอร์มกลางสำหรับรวบรวมและประกาศข่าวสารการแข่งขันทุกประเภทในประเทศไทย ไม่ว่าจะเป็นการแข่งขันด้านออกแบบ, พัฒนา, งานเขียน, ศิลปะ, หรือวิทยาศาสตร์ เรามุ่งมั่นที่จะเป็นพื้นที่สำหรับทุกคนในการค้นหาโอกาสและแสดงศักยภาพของตนเอง"
    },
    {
        question: "มีค่าใช้จ่ายในการใช้งานหรือไม่?",
        answer: "สำหรับผู้เข้าแข่งขัน การใช้งานแพลตฟอร์มทั้งหมด เช่น การค้นหา, การบันทึก, และการติดตามการแข่งขัน ไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น สำหรับผู้จัดการแข่งขัน การลงประกาศการแข่งขันพื้นฐานก็ไม่มีค่าใช้จ่ายเช่นกัน แต่อาจมีบริการเสริมในอนาคต"
    },
];

const contestantFaqs = [
    {
        question: "ฉันจะเข้าร่วมการแข่งขันได้อย่างไร?",
        answer: "คุณสามารถค้นหาการแข่งขันที่สนใจบนหน้าแรกของเรา เมื่อพบการแข่งขันที่ต้องการแล้ว ให้คลิกที่ 'ดูรายละเอียด' เพื่ออ่านข้อมูลเพิ่มเติม, กติกา, และของรางวัล จากนั้นคุณสามารถไปสมัครได้ตามช่องทางที่ผู้จัดการแข่งขันระบุไว้ในรายละเอียด และอย่าลืมกดปุ่ม 'บันทึกการสมัคร' ในหน้าของ ContestOne<sup>th</sup> เพื่อเก็บประวัติการเข้าร่วมของคุณ"
    },
    {
        question: "ฉันจะติดตามการแข่งขันที่ฉันสนใจได้อย่างไร?",
        answer: "หลังจากเข้าสู่ระบบแล้ว คุณสามารถกดปุ่ม 'บันทึก' (รูปดาว) ที่การแข่งขันที่คุณสนใจ การแข่งขันนั้นจะถูกเพิ่มเข้าไปในรายการ 'การแข่งขันที่บันทึกไว้' ในหน้าโปรไฟล์ของคุณ"
    }
];

const organizerFaqs = [
    {
        question: "ฉันจะลงประกาศการแข่งขันของฉันได้อย่างไร?",
        answer: "คุณสามารถลงประกาศการแข่งขันได้โดยไปที่เมนู 'สร้างการแข่งขัน' หลังจากเข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin) กรอกรายละเอียดต่างๆ ให้ครบถ้วน แล้วการแข่งขันของคุณก็จะปรากฏบนแพลตฟอร์ม"
    },
    {
        question: "ฉันสามารถแก้ไขข้อมูลการแข่งขันหลังจากประกาศไปแล้วได้หรือไม่?",
        answer: "ได้ คุณสามารถแก้ไขรายละเอียดการแข่งขันของคุณได้ตลอดเวลาผ่านทางหน้า 'จัดการแข่งขัน' ในส่วนของ Admin"
    },
];

const renderContent = (content: string) => {
    if (content.includes('<sup>')) {
        return <div className="pb-4 pt-0" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return <div className="pb-4 pt-0">{content}</div>;
}

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline sm:text-5xl">
          คำถามที่พบบ่อย (FAQ)
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          เราได้รวบรวมคำตอบสำหรับคำถามที่คุณอาจสงสัยเกี่ยวกับการใช้งาน ContestOne<sup>th</sup>
        </p>
      </div>

      <div className="space-y-10">
        <div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-6">คำถามทั่วไป</h2>
            <Accordion type="single" collapsible className="w-full">
                {generalFaqs.map((faq, index) => (
                    <AccordionItem value={`general-${index}`} key={index}>
                        <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-foreground/80">
                           {renderContent(faq.answer)}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

         <div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-6">สำหรับผู้เข้าแข่งขัน</h2>
            <Accordion type="single" collapsible className="w-full">
                {contestantFaqs.map((faq, index) => (
                    <AccordionItem value={`contestant-${index}`} key={index}>
                        <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-foreground/80">
                           {renderContent(faq.answer)}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
        
         <div>
            <h2 className="text-2xl font-bold font-headline text-primary mb-6">สำหรับผู้จัดงาน</h2>
            <Accordion type="single" collapsible className="w-full">
                {organizerFaqs.map((faq, index) => (
                    <AccordionItem value={`organizer-${index}`} key={index}>
                        <AccordionTrigger className="text-left font-semibold">{faq.question}</AccordionTrigger>
                         <AccordionContent className="text-base text-foreground/80">
                           {renderContent(faq.answer)}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

        <div className="text-center border-t pt-10 mt-12">
            <h3 className="text-xl font-semibold mb-4">ยังหาคำตอบไม่เจอใช่ไหม?</h3>
            <p className="text-muted-foreground mb-6">ติดต่อทีมงานของเราเพื่อขอความช่วยเหลือเพิ่มเติม</p>
            <div className="flex justify-center items-center gap-6">
                 <Link href="mailto:support@contestone-th.com" className="inline-flex items-center gap-2 text-primary hover:underline">
                    <Mail className="h-5 w-5" />
                    support@contestone-th.com
                </Link>
                 <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                    02-853-6999
                </span>
            </div>
        </div>

      </div>
    </div>
  );
}
