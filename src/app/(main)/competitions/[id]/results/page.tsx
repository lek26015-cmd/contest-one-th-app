import { getServerCompetition } from '@/lib/judging-actions';
import { getSubmissionsFromD1 } from '@/lib/d1-actions';
import { notFound } from 'next/navigation';
import { 
  Trophy, 
  Award, 
  Users, 
  Share2, 
  ArrowLeft, 
  PartyPopper,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const competition = await getServerCompetition(params.id);
  
  if (!competition) {
    notFound();
  }

  // Fetch all submissions for this competition
  const allSubmissions = await getSubmissionsFromD1({ competitionId: params.id });
  
  // Filter and sort winners
  const winners = allSubmissions
    .filter(sub => sub.winnerAwardName || (sub.winnerRank && sub.winnerRank > 0))
    .sort((a, b) => (a.winnerRank || 99) - (b.winnerRank || 99));

  const firstPlace = winners.find(w => w.winnerRank === 1);
  const secondPlace = winners.find(w => w.winnerRank === 2);
  const thirdPlace = winners.find(w => w.winnerRank === 3);
  const otherWinners = winners.filter(w => !w.winnerRank || w.winnerRank > 3);

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 space-y-6">
          <Link href={`/competitions/${params.id}`} className="hover:text-primary text-slate-400 font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> กลับสู่หน้าการแข่งขัน
          </Link>
          
          <div className="flex justify-center">
            <Badge className="bg-emerald-100 text-emerald-600 border-none font-black px-6 py-2 rounded-full text-xs uppercase tracking-[0.2em] mb-4">
               OFFICIAL RESULTS
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight font-headline">
             ประกาศผลผู้ได้รับรางวัล
          </h1>
          <p className="text-2xl font-bold text-slate-400 max-w-2xl mx-auto leading-relaxed">
             {competition.title}
          </p>

          <div className="flex items-center justify-center gap-4 pt-6">
             <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                <PartyPopper className="h-5 w-5 text-primary animate-bounce" />
             </div>
             <p className="font-black text-slate-600 uppercase tracking-widest text-xs">ขอแสดงความยินดีกับผู้ได้รับรางวัลทุกท่าน</p>
          </div>
        </div>

        {/* Podium View */}
        {(firstPlace || secondPlace || thirdPlace) && (
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-20 md:mb-32">
            {/* Second Place */}
            {secondPlace && (
              <div className="w-full md:w-80 order-2 md:order-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="flex flex-col items-center">
                   <div className="h-24 w-24 bg-white rounded-full border-4 border-[#C0C0C0] mb-6 shadow-xl flex items-center justify-center relative group overflow-hidden">
                      <div className="absolute inset-0 bg-[#C0C0C0] opacity-10 group-hover:opacity-20 transition-all duration-500" />
                      <Medal className="h-12 w-12 text-[#C0C0C0] relative z-10" />
                      <div className="absolute -bottom-1 -right-1 bg-[#C0C0C0] text-white text-xs font-black h-8 w-8 rounded-full flex items-center justify-center border-4 border-white">2</div>
                   </div>
                   <Card className="w-full border-none shadow-2xl rounded-[2.5rem] bg-white text-center h-48 md:h-64 flex flex-col justify-center p-8">
                      <CardContent className="p-0">
                         <h3 className="text-xl font-black text-slate-900 line-clamp-2">{secondPlace.userName}</h3>
                         <p className="text-[#C0C0C0] font-black text-xs uppercase tracking-widest mt-2">{secondPlace.winnerAwardName || 'อันดับที่ 2'}</p>
                      </CardContent>
                   </Card>
                </div>
              </div>
            )}

            {/* First Place */}
            {firstPlace && (
              <div className="w-full md:w-96 order-1 md:order-2 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="flex flex-col items-center">
                   <div className="h-32 w-32 bg-white rounded-full border-4 border-[#FFD700] mb-8 shadow-2xl flex items-center justify-center relative group overflow-hidden">
                      <div className="absolute inset-0 bg-[#FFD700] opacity-10 group-hover:opacity-20 transition-all duration-500" />
                      <Crown className="h-16 w-16 text-[#FFD700] relative z-10 animate-bounce" />
                      <div className="absolute -bottom-1 -right-1 bg-[#FFD700] text-white text-sm font-black h-10 w-10 rounded-full flex items-center justify-center border-4 border-white">1</div>
                   </div>
                   <Card className="w-full border-none shadow-[0_50px_100px_-20px_rgba(16,185,129,0.3)] rounded-[3rem] bg-slate-900 text-center h-64 md:h-80 flex flex-col justify-center p-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-primary/20 transition-all duration-700">
                         <Trophy className="h-32 w-32 rotate-12" />
                      </div>
                      <CardContent className="p-0 relative z-10">
                         <h3 className="text-3xl font-black text-white line-clamp-2 mb-4">{firstPlace.userName}</h3>
                         <Badge className="bg-primary text-white border-none font-black px-8 py-2 rounded-full text-xs uppercase tracking-widest">
                            {firstPlace.winnerAwardName || 'ผู้ชนะเลิศ'}
                         </Badge>
                      </CardContent>
                   </Card>
                </div>
              </div>
            )}

            {/* Third Place */}
            {thirdPlace && (
              <div className="w-full md:w-80 order-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <div className="flex flex-col items-center">
                   <div className="h-20 w-20 bg-white rounded-full border-4 border-[#CD7F32] mb-6 shadow-xl flex items-center justify-center relative group overflow-hidden">
                      <div className="absolute inset-0 bg-[#CD7F32] opacity-10 group-hover:opacity-20 transition-all duration-500" />
                      <Star className="h-10 w-10 text-[#CD7F32] relative z-10" />
                      <div className="absolute -bottom-1 -right-1 bg-[#CD7F32] text-white text-xs font-black h-8 w-8 rounded-full flex items-center justify-center border-4 border-white">3</div>
                   </div>
                   <Card className="w-full border-none shadow-xl rounded-[2.5rem] bg-white text-center h-40 md:h-56 flex flex-col justify-center p-8">
                      <CardContent className="p-0">
                         <h3 className="text-xl font-black text-slate-900 line-clamp-2">{thirdPlace.userName}</h3>
                         <p className="text-[#CD7F32] font-black text-xs uppercase tracking-widest mt-2">{thirdPlace.winnerAwardName || 'อันดับที่ 3'}</p>
                      </CardContent>
                   </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other Awards & Honorable Mentions */}
        {otherWinners.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <Award className="h-6 w-6 text-primary" /> รางวัลอื่นๆ และรางวัลชมเชย
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {otherWinners.map((win, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 hover:shadow-xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                           <Medal className="h-6 w-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900">{win.userName}</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{win.winnerAwardName}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-32 text-center">
           <p className="text-slate-400 font-bold mb-8 italic">ผลการตัดสินของคณะกรรมการถือเป็นที่สิ้นสุด</p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black px-12 h-14 rounded-2xl shadow-xl shadow-primary/20">
                 <Link href={`/competitions`}>ดูงานแข่งอื่นๆ</Link>
              </Button>
              <Button variant="outline" className="border-2 border-slate-100 h-14 px-10 rounded-2xl font-black text-slate-600 hover:bg-slate-50">
                 <Share2 className="mr-2 h-4 w-4" /> แชร์ประกาศนี้
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
