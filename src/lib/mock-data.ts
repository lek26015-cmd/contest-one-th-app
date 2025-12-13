
// This file is deprecated. Its functionality has been moved to src/lib/competition-actions.ts
// It is kept for reference or if a fallback to mock data is ever needed.
// To re-enable, you would need to change the imports in the components
// that use this data (e.g., admin pages, home page).

'use client';

import type { Competition, CompetitionCategory, ParticipantType } from './types';
import { CATEGORIES, PARTICIPANT_TYPES } from './types';

const MOCK_COMPETITIONS_KEY = 'mock_competitions';

const MOCK_COMPETITIONS_TEMPLATES = [
    {
        title: "ประกวดออกแบบโลโก้ 'GreenTech'",
        description: "ร่วมออกแบบโลโก้สำหรับบริษัทเทคโนโลยีสีเขียวแห่งอนาคต ชิงเงินรางวัลและโอกาสร่วมงานกับเรา",
        prizes: ["เงินรางวัล 50,000 บาท", "โอกาสฝึกงานกับ GreenTech", "ใบประกาศเกียรติคุณ"],
        totalPrize: 50000,
        rules: "ส่งผลงานในรูปแบบไฟล์ AI และ PNG พร้อมอธิบายแนวคิดในการออกแบบ",
        category: "ออกแบบ" as CompetitionCategory,
    },
    {
        title: "Hackathon 'Smart City Challenge'",
        description: "แข่งขันพัฒนาเว็บแอปพลิเคชันเพื่อแก้ปัญหาเมืองอัจฉริยะภายใน 48 ชั่วโมง",
        prizes: ["เงินรางวัลรวม 200,000 บาท", "สนับสนุนโปรเจกต์ต่อยอด", "ตั๋วเข้าร่วมงาน Tech Summit 2024"],
        totalPrize: 200000,
        rules: "ทีมละ 3-5 คน พัฒนาด้วยเทคโนโลยีใดก็ได้ แต่ต้องสามารถใช้งานได้จริง",
        category: "พัฒนา" as CompetitionCategory,
    },
];

const isBrowser = typeof window !== 'undefined';

export function getCompetitions(): Competition[] {
    if (!isBrowser) return [];
    try {
        const competitionsJSON = localStorage.getItem(MOCK_COMPETITIONS_KEY);
        if (competitionsJSON) {
            return JSON.parse(competitionsJSON);
        }
        return [];
    } catch (error) {
        console.error("Error reading from localStorage", error);
        return [];
    }
}
