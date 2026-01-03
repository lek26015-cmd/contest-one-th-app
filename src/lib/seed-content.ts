import { Competition, BlogPost, CATEGORIES, PARTICIPANT_TYPES, BLOG_CATEGORIES } from './types';
import { Timestamp } from 'firebase/firestore';

export const SEED_COMPETITIONS: Omit<Competition, 'id'>[] = [
    {
        title: "ประกวดออกแบบโลโก้ 'GreenTech' #8",
        description: "ขอเชิญนักออกแบบรุ่นใหม่ ร่วมสร้างสรรค์อัตลักษณ์ให้กับ 'GreenTech' บริษัทสตาร์ทอัพด้านพลังงานสะอาดแห่งอนาคต เรามองหาโลโก้ที่สื่อถึงความยั่งยืน นวัตกรรม และความเป็นมิตรต่อสิ่งแวดล้อม\n\nโจทย์การออกแบบ:\n1. สื่อถึงพลังงานสะอาดและเทคโนโลยี\n2. ใช้สีเขียวเป็นหลัก ผสมผสานกับสีที่ทันสมัย\n3. ใช้งานได้ดีทั้งบนสื่อดิจิทัลและสิ่งพิมพ์",
        prizes: [
            "รางวัลชนะเลิศ: เงินสด 50,000 บาท พร้อมโล่เกียรติยศ",
            "รองชนะเลิศอันดับ 1: เงินสด 20,000 บาท",
            "รองชนะเลิศอันดับ 2: เงินสด 10,000 บาท",
            "รางวัล Popular Vote: Gift Voucher มูลค่า 5,000 บาท"
        ],
        totalPrize: 85000,
        rules: "1. ผู้เข้าประกวดต้องเป็นบุคคลทั่วไป ไม่จำกัดอายุ\n2. ผลงานต้องเป็นของตนเอง ห้ามลอกเลียนแบบ\n3. ส่งไฟล์งานในรูปแบบ AI และ PNG ความละเอียดสูง\n4. แนบคำอธิบายแนวคิดการออกแบบความยาวไม่เกิน 1 หน้า A4",
        deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), // 15 days from now
        category: "Design",
        participantType: ["บุคคลทั่วไป", "นักเรียน/นักศึกษา"],
        rulesUrls: ["https://example.com/rules-greentech.pdf"],
        socialUrls: ["https://facebook.com/greentech-contest"],
        imageUrl: "https://picsum.photos/seed/greentech/800/600",
        views: 1250,
        featured: true,
        featuredUntil: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    },
    {
        title: "Hackathon 'Smart City Challenge' #9",
        description: "ระดมสมองประลองไอเดีย พัฒนานวัตกรรมเพื่อเมืองอัจฉริยะ! มาร่วมแก้ปัญหาจราจร มลพิษ และการจัดการขยะ ด้วยเทคโนโลยี IoT, AI และ Big Data ในงาน Hackathon ต่อเนื่อง 48 ชั่วโมง\n\nสิ่งที่ผู้เข้าแข่งขันจะได้รับ:\n- พื้นที่ทำงาน Co-working space ฟรีตลอดงาน\n- อาหารและเครื่องดื่มไม่อั้น\n- คำแนะนำจาก Mentor ผู้เชี่ยวชาญในวงการ",
        prizes: [
            "รางวัลชนะเลิศ: 200,000 บาท และโอกาสร่วมลงทุน",
            "รองชนะเลิศ: 100,000 บาท",
            "รางวัลนวัตกรรมยอดเยี่ยม: 50,000 บาท"
        ],
        totalPrize: 350000,
        rules: "1. ทีมละ 3-5 คน\n2. ต้องมีการเขียนโค้ดและทำ Prototype จริงภายในงาน\n3. ลิขสิทธิ์ผลงานเป็นของผู้เข้าแข่งขัน",
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        category: "Hackathon",
        participantType: ["Early Stage Startup", "SME", "นักเรียน/นักศึกษา"],
        rulesUrls: ["https://example.com/rules-smartcity.pdf"],
        socialUrls: ["https://facebook.com/smartcity-hackathon"],
        imageUrl: "https://picsum.photos/seed/smartcity/800/600",
        views: 3400,
        featured: true,
        featuredUntil: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
    },
    {
        title: "ประกวดภาพถ่าย 'Street Life Bangkok' #17",
        description: "ถ่ายทอดมุมมองชีวิตคนเมืองกรุงเทพฯ ผ่านเลนส์กล้องของคุณ ไม่ว่าจะเป็นรอยยิ้ม ความวุ่นวาย หรือสถาปัตยกรรมที่ซ่อนอยู่\n\nประเภทภาพถ่าย:\n- Street Photography\n- Cityscape\n- Portrait",
        prizes: [
            "รางวัลชนะเลิศ: กล้อง Sony A7IV พร้อมเลนส์",
            "รองชนะเลิศ: เงินสด 20,000 บาท",
            "รางวัลชมเชย: อุปกรณ์ถ่ายภาพมูลค่า 5,000 บาท"
        ],
        totalPrize: 100000, // Estimated value
        rules: "1. ภาพถ่ายต้องถ่ายในกรุงเทพมหานครเท่านั้น\n2. ปรับแต่งแสงสีได้ แต่ห้ามตัดต่อ\n3. ความละเอียดภาพไม่ต่ำกว่า 12 ล้านพิกเซล",
        deadline: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
        category: "Photography",
        participantType: ["บุคคลทั่วไป"],
        rulesUrls: [],
        socialUrls: ["https://instagram.com/streetlifebkk"],
        imageUrl: "https://picsum.photos/seed/streetlife/800/600",
        views: 890,
        featured: false,
    },
    {
        title: "Short Film Contest 'Voices of Tomorrow'",
        description: "พื้นที่ปล่อยของสำหรับคนทำหนังรุ่นใหม่! ส่งหนังสั้นความยาว 5-10 นาที ภายใต้หัวข้อ 'เสียงของอนาคต' เพื่อสะท้อนความคิด ความฝัน และความหวังของคนรุ่นใหม่ที่มีต่อโลกใบนี้",
        prizes: [
            "รางวัลภาพยนตร์ยอดเยี่ยม: 100,000 บาท",
            "ผู้กำกับยอดเยี่ยม: 30,000 บาท",
            "บทภาพยนตร์ยอดเยี่ยม: 20,000 บาท"
        ],
        totalPrize: 150000,
        rules: "1. ความยาว 5-10 นาที รวมเครดิต\n2. ต้องมีซับไตเติ้ลภาษาอังกฤษ\n3. ไม่จำกัดอุปกรณ์ในการถ่ายทำ",
        deadline: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
        category: "Film",
        participantType: ["นักเรียน/นักศึกษา", "บุคคลทั่วไป"],
        rulesUrls: ["https://example.com/rules-shortfilm.pdf"],
        socialUrls: [],
        imageUrl: "https://picsum.photos/seed/shortfilm/800/600",
        views: 2100,
        featured: false,
    },
    {
        title: "Business Plan Competition 'Startup Next Gen'",
        description: "เวทีสำหรับผู้ประกอบการรุ่นใหม่ที่มีไอเดียธุรกิจสุดเจ๋ง! นำเสนอแผนธุรกิจของคุณต่อหน้านักลงทุนตัวจริง พร้อมโอกาสได้รับเงินทุนสนับสนุนเพื่อเริ่มธุรกิจจริง",
        prizes: [
            "Seed Funding: 500,000 บาท",
            "Incubation Program 3 เดือน",
            "Cloud Credits มูลค่า 100,000 บาท"
        ],
        totalPrize: 600000,
        rules: "1. แผนธุรกิจต้องมีความเป็นไปได้ในทางปฏิบัติ\n2. มี MVP หรือ Prototype จะได้รับการพิจารณาเป็นพิเศษ",
        deadline: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
        category: "Business Plan",
        participantType: ["Pre-Seed/Seed", "นักเรียน/นักศึกษา"],
        rulesUrls: [],
        socialUrls: ["https://linkedin.com/company/startup-nextgen"],
        imageUrl: "https://picsum.photos/seed/startup/800/600",
        views: 1500,
        featured: true,
        featuredUntil: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    }
];

export const SEED_BLOG_POSTS: Omit<BlogPost, 'id'>[] = [
    {
        slug: "5-tips-winning-hackathon",
        title: "5 เคล็ดลับพิชิตรางวัลในงาน Hackathon",
        excerpt: "เตรียมตัวอย่างไรให้พร้อม? บริหารเวลาอย่างไรให้ทัน? บทความนี้มีคำตอบสำหรับสาย Dev ที่อยากคว้าแชมป์ Hackathon",
        content: "งาน Hackathon คือสนามประลองฝีมือที่ท้าทายและกดดัน แต่ถ้าคุณมีการเตรียมตัวที่ดี โอกาสชนะก็อยู่ไม่ไกล...\n\n1. **ทีมเวิร์คคือหัวใจสำคัญ**: เลือกเพื่อนร่วมทีมที่มีทักษะหลากหลายและเติมเต็มกันได้\n2. **โฟกัสที่ MVP**: อย่าพยายามทำทุกฟีเจอร์ ให้ทำฟีเจอร์หลักให้เสร็จและใช้งานได้จริงก่อน\n3. **Pitching ต้องปัง**: ต่อให้โค้ดดีแค่ไหน ถ้าขายของไม่เป็นก็จบ ฝึกซ้อมการนำเสนอให้กระชับและน่าสนใจ\n4. **พักผ่อนบ้าง**: การอดนอนไม่ได้ทำให้งานเสร็จเร็วขึ้นเสมอไป การพักสั้นๆ ช่วยให้สมองแล่นขึ้น\n5. **เตรียมเครื่องมือให้พร้อม**: ติดตั้งโปรแกรม เตรียม Boilerplate code ไว้ล่วงหน้า จะช่วยประหยัดเวลาได้มาก",
        imageUrl: "https://picsum.photos/seed/hackathon-tips/800/400",
        date: new Date().toISOString(),
        authorName: "Admin Team",
        authorImageUrl: "https://github.com/shadcn.png",
        authorId: "admin",
        category: "พัฒนา",
        tags: ["Hackathon", "Tips", "Development"],
        views: 540,
    },
    {
        slug: "design-trends-2025",
        title: "เจาะลึกเทรนด์การออกแบบปี 2025",
        excerpt: "อัปเดตเทรนด์กราฟิกดีไซน์ที่กำลังมาแรงในปีหน้า เตรียมตัวให้พร้อมก่อนใคร เพื่อสร้างสรรค์ผลงานที่ทันสมัยและโดดเด่น",
        content: "โลกของการออกแบบหมุนเร็วเสมอ ปี 2025 นี้เราจะได้เห็นการกลับมาของสไตล์ Retro ที่ผสมผสานกับความล้ำสมัยของ AI...\n\n- **AI-Generated Art**: การใช้ AI เป็นเครื่องมือช่วยสร้างไอเดียและองค์ประกอบภาพ\n- **3D Typography**: ตัวอักษรที่มีมิติ แสงเงา และความสมจริง\n- **Sustainable Design**: การออกแบบที่คำนึงถึงสิ่งแวดล้อม ทั้งในแง่ของคอนเซปต์และกระบวนการผลิต",
        imageUrl: "https://picsum.photos/seed/design-trends/800/400",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        authorName: "Design Guru",
        authorImageUrl: "https://picsum.photos/seed/avatar1/100/100",
        authorId: "admin",
        category: "ออกแบบ",
        tags: ["Design", "Trends", "2025"],
        views: 320,
    },
    {
        slug: "how-to-pitch-investors",
        title: "เทคนิคการ Pitching ให้ได้ใจนักลงทุน",
        excerpt: "ทำอย่างไรให้นักลงทุนเชื่อมั่นในไอเดียของคุณ? เรียนรู้ศิลปะการเล่าเรื่องและการนำเสนอแผนธุรกิจอย่างมืออาชีพ",
        content: "การ Pitching ไม่ใช่แค่การพูดข้อมูล แต่คือการเล่าเรื่อง (Storytelling) ที่ทำให้ผู้ฟังคล้อยตามและเห็นภาพความสำเร็จ...\n\n1. **เริ่มด้วยปัญหา (Pain Point)**: ทำให้เห็นว่าปัญหานั้นใหญ่และสำคัญแค่ไหน\n2. **เสนอทางแก้ (Solution)**: สินค้าหรือบริการของคุณแก้ปัญหานั้นได้อย่างไร\n3. **ขนาดตลาด (Market Size)**: โอกาสทางธุรกิจมีมากแค่ไหน\n4. **ทีมงาน (Team)**: ทำไมต้องเป็นทีมคุณที่ทำเรื่องนี้สำเร็จ",
        imageUrl: "https://picsum.photos/seed/pitching/800/400",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        authorName: "Startup Coach",
        authorImageUrl: "https://picsum.photos/seed/avatar2/100/100",
        authorId: "admin",
        category: "เคล็ดลับ",
        tags: ["Startup", "Pitching", "Investment"],
        views: 890,
    }
];
