'use client';

import React from 'react';

const PrivacySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold font-headline text-primary mb-4">{title}</h2>
    <div className="space-y-4 text-foreground/80 leading-relaxed">
      {children}
    </div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline sm:text-5xl">
          นโยบายความเป็นส่วนตัว
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <PrivacySection title="1. บทนำ">
          <p>
            ContestOne<sup>th</sup> ("เรา", "พวกเรา", หรือ "ของเรา") มุ่งมั่นที่จะปกป้องความเป็นส่วนตัวของคุณ นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีที่เรารวบรวม, ใช้, เปิดเผย, และปกป้องข้อมูลของคุณเมื่อคุณเข้าชมเว็บไซต์ของเรา
          </p>
        </PrivacySection>

        <PrivacySection title="2. ข้อมูลที่เรารวบรวม">
          <p>
            เราอาจรวบรวมข้อมูลเกี่ยวกับคุณในหลายวิธี ข้อมูลที่เรารวบรวมบนเว็บไซต์อาจรวมถึง:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>ข้อมูลส่วนบุคคล:</strong> ข้อมูลที่สามารถระบุตัวตนได้ เช่น ชื่อ, ที่อยู่อีเมล, ซึ่งคุณให้เราโดยสมัครใจเมื่อลงทะเบียนกับเว็บไซต์</li>
            <li><strong>ข้อมูลการใช้งาน:</strong> ข้อมูลที่เบราว์เซอร์ของคุณส่งโดยอัตโนมัติเมื่อคุณเข้าชมเว็บไซต์ เช่น ที่อยู่ IP ของคุณ, ประเภทเบราว์เซอร์, เวลาที่เข้าชม, และหน้าที่คุณดูก่อนหน้า</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="3. วิธีที่เราใช้ข้อมูลของคุณ">
          <p>
            การมีข้อมูลที่ถูกต้องเกี่ยวกับคุณช่วยให้เราสามารถมอบประสบการณ์ที่ราบรื่นและมีประสิทธิภาพให้กับคุณได้ โดยเฉพาะอย่างยิ่ง เราอาจใช้ข้อมูลที่รวบรวมเกี่ยวกับคุณเพื่อ:
          </p>
           <ul className="list-disc pl-6">
            <li>สร้างและจัดการบัญชีของคุณ</li>
            <li>ส่งอีเมลถึงคุณเกี่ยวกับบัญชีหรือการแข่งขันของคุณ</li>
            <li>ปรับปรุงประสิทธิภาพและการทำงานของเว็บไซต์</li>
            <li>ตรวจสอบและวิเคราะห์การใช้งานและแนวโน้มเพื่อปรับปรุงประสบการณ์ของคุณกับเว็บไซต์</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="4. การเปิดเผยข้อมูลของคุณ">
          <p>
            เราจะไม่แบ่งปัน, ขาย, ให้เช่า, หรือแลกเปลี่ยนข้อมูลส่วนบุคคลของคุณกับบุคคลที่สามเพื่อวัตถุประสงค์ทางการตลาดโดยไม่ได้รับความยินยอมจากคุณ
          </p>
           <p>
            อย่างไรก็ตาม เราอาจแบ่งปันข้อมูลของคุณกับผู้ให้บริการบุคคลที่สามที่ให้บริการในนามของเรา ซึ่งรวมถึงการประมวลผลการชำระเงิน, การวิเคราะห์ข้อมูล, และการบริการลูกค้า
          </p>
        </PrivacySection>
        
        <PrivacySection title="5. ความปลอดภัยของข้อมูลของคุณ">
          <p>
            เราใช้มาตรการรักษาความปลอดภัยทั้งทางด้านการบริหาร, เทคนิค, และกายภาพ เพื่อช่วยปกป้องข้อมูลส่วนบุคคลของคุณ แม้ว่าเราจะใช้มาตรการที่สมเหตุสมผลเพื่อรักษาความปลอดภัยข้อมูลส่วนบุคคลที่คุณให้กับเรา โปรดทราบว่าไม่มีมาตรการรักษาความปลอดภัยใดที่สมบูรณ์แบบและไม่สามารถเจาะได้
          </p>
        </PrivacySection>

        <PrivacySection title="6. สิทธิ์ของคุณ">
          <p>
            คุณมีสิทธิ์ในการเข้าถึง, แก้ไข, หรือลบข้อมูลส่วนบุคคลของคุณได้ตลอดเวลาโดยเข้าสู่ระบบบัญชีของคุณและอัปเดตโปรไฟล์ของคุณ
          </p>
        </PrivacySection>

        <PrivacySection title="7. ติดต่อเรา">
          <p>
            หากคุณมีคำถามหรือความคิดเห็นเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราที่ <a href="mailto:support@contestone-th.com" className="text-primary hover:underline">support@contestone-th.com</a>
          </p>
        </PrivacySection>
      </div>
    </div>
  );
}
