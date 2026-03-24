'use client';

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer2, 
  Share2,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const data = [
  { name: 'จ.', views: 400, clicks: 240 },
  { name: 'อ.', views: 300, clicks: 139 },
  { name: 'พ.', views: 200, clicks: 980 },
  { name: 'พฤ.', views: 278, clicks: 390 },
  { name: 'ศ.', views: 189, clicks: 480 },
  { name: 'ส.', views: 239, clicks: 380 },
  { name: 'อา.', views: 349, clicks: 430 },
];

const categoryData = [
  { name: 'Technology', value: 400, color: '#226ab3' },
  { name: 'Design', value: 300, color: '#4f46e5' },
  { name: 'Business', value: 300, color: '#10b981' },
  { name: 'Other', value: 200, color: '#94a3b8' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">สถิติและรายงาน</h1>
          <p className="text-slate-400 font-bold mt-1">วิเคราะห์ประสิทธิภาพงานแข่งขันและการเข้าถึงกลุ่มเป้าหมายของคุณ</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-12 border-none shadow-sm bg-white rounded-xl px-6 font-bold text-slate-600 hover:bg-slate-50">
              <Calendar className="mr-2 h-4 w-4" /> 7 วันล่าสุด <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-slate-50">
            <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm cursor-pointer">วันนี้</DropdownMenuItem>
            <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm cursor-pointer">7 วันล่าสุด</DropdownMenuItem>
            <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm cursor-pointer">30 วันล่าสุด</DropdownMenuItem>
            <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm cursor-pointer">90 วันล่าสุด</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'ผู้เข้าชมทั้งหมด', value: '45,231', icon: Eye, trend: '+12.5%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'อัตราการคลิก (CTR)', value: '18.4%', icon: MousePointer2, trend: '+2.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'จำนวนแชร์', value: '1,204', icon: Share2, trend: '+5.4%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'ผู้สมัครเฉลี่ย', value: '84 คน/งาน', icon: Users, trend: '-1.2%', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase px-2 py-1 rounded-full",
                  stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                )}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-slate-50">
            <CardTitle className="text-lg font-black tracking-tight">กราฟยอดการเข้าชมและคลิก</CardTitle>
            <CardDescription className="text-xs font-bold mt-0.5">ข้อมูลย้อนหลัง 7 วันที่ผ่านมา</CardDescription>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#226ab3" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#226ab3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 800
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#226ab3" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown Card */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-slate-50">
            <CardTitle className="text-lg font-black tracking-tight">สัดส่วนตามหมวดหมู่</CardTitle>
            <CardDescription className="text-xs font-bold mt-0.5">แยกตามประเภทของงานแข่งขัน</CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex flex-col items-center">
            <div className="h-[200px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-4">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{Math.round((item.value / 1200) * 100)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

