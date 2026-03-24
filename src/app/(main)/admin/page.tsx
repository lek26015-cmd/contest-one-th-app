
'use client';
import { useMemo } from 'react';
import { getCompetitionsQuery } from '@/lib/competition-actions';
import { getBlogPostsQuery } from '@/lib/blog-actions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { Competition } from '@/lib/types';
import type { BlogPost } from '@/lib/types';
import { TrendingUp } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

const StatisticsCard = ({ competitions, blogPosts }: { competitions: Competition[], blogPosts: BlogPost[] }) => {
    const totalViews = useMemo(() => {
        return competitions.reduce((acc, comp) => acc + (comp.views || 0), 0);
    }, [competitions]);

    const topCompetitions = useMemo(() => {
        return [...competitions].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
    }, [competitions]);

    const topBlogPosts = useMemo(() => {
        return [...blogPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
    }, [blogPosts]);

    const monthlyTrafficData = useMemo(() => {
        const data = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = date.toLocaleString('default', { month: 'short' });
            data.push({
                month: month,
                views: Math.floor(Math.random() * 5000) + 1000 + (Math.sin(i / 3) * 500),
            });
        }
        return data;
    }, []);

    const chartData = (data: any[], key: string, name: string) => {
        return data.map(item => ({ name: item.title.substring(0, 20) + '...', [name]: item[key] })).reverse();
    };

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp />
                    สถิติเว็บไซต์
                </CardTitle>
                <CardDescription>ภาพรวมและอันดับเนื้อหายอดนิยม</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h3 className="font-bold text-lg">ภาพรวม</h3>
                    <p className="text-4xl font-bold text-primary">{totalViews.toLocaleString()}</p>
                    <p className="text-muted-foreground">ยอดการเข้าชมการแข่งขันทั้งหมด</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4">สถิติการเข้าชมรายเดือน (12 เดือนย้อนหลัง)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrafficData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Line type="monotone" dataKey="views" name="ยอดวิว" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4">10 อันดับการแข่งขันยอดนิยม</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData(topCompetitions, 'views', 'ยอดวิว')} layout="vertical" margin={{ left: 30, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Bar dataKey="ยอดวิว" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4">10 อันดับบทความยอดนิยม</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData(topBlogPosts, 'views', 'ยอดวิว')} layout="vertical" margin={{ left: 30, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Bar dataKey="ยอดวิว" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}

import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { seedInitialCompetitions } from '@/lib/competition-actions';
import { seedInitialBlogPosts } from '@/lib/blog-actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

// ... (existing imports)

import { useUser } from '@/firebase';

export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);

    const competitionsQuery = useMemoFirebase(() => getCompetitionsQuery(firestore), [firestore]);
    const { data: competitions } = useCollection<Competition>(competitionsQuery);

    const blogPostsQuery = useMemoFirebase(() => getBlogPostsQuery(firestore), [firestore]);
    const { data: blogPosts } = useCollection<BlogPost>(blogPostsQuery);

    const handleSeedData = async () => {
        if (!firestore || !user) return;
        setIsSeeding(true);
        try {
            await seedInitialCompetitions(firestore, user.uid);
            await seedInitialBlogPosts(firestore);
            toast({ title: "สำเร็จ", description: "เพิ่มข้อมูลจำลองเรียบร้อยแล้ว" });
        } catch (error) {
            console.error(error);
            toast({ title: "ผิดพลาด", description: "ไม่สามารถเพิ่มข้อมูลได้", variant: "destructive" });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">ภาพรวม</h1>
                    <p className="text-muted-foreground">สรุปข้อมูลสถิติที่สำคัญของเว็บไซต์</p>
                </div>
                <Button onClick={handleSeedData} disabled={isSeeding} variant="outline">
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    Seed Data
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <StatisticsCard competitions={competitions || []} blogPosts={blogPosts || []} />
                {/* You can add other summary cards here */}
            </div>
        </div>
    );
}
