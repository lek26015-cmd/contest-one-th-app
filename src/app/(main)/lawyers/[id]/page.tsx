import { SEED_LAWYERS } from "@/lib/seed-content";
import { Lawyer } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Scale, Phone, Mail, GraduationCap, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from "next/navigation";

// Mock function to simulate fetching by ID
const getLawyerById = (id: string): Lawyer | undefined => {
    // In a real app, this would query the DB. 
    // For now, we use the index as mock ID logic: lawyer-1 -> index 0
    const index = parseInt(id.replace('lawyer-', '')) - 1;
    if (index >= 0 && index < SEED_LAWYERS.length) {
        return { ...SEED_LAWYERS[index], id } as Lawyer;
    }
    return undefined;
}

export default async function LawyerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lawyer = getLawyerById(id);

    if (!lawyer) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link href="/lawyers" className="text-muted-foreground hover:text-foreground text-sm flex items-center mb-4">
                    ← Back to Directory
                </Link>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900"></div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-start -mt-12 gap-6">
                            {/* Avatar */}
                            <div className="relative h-32 w-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden flex-shrink-0">
                                <Image
                                    src={lawyer.imageUrl}
                                    alt={`${lawyer.firstName} ${lawyer.lastName}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Header Info */}
                            <div className="flex-grow pt-4 md:pt-14">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-3xl font-bold">{lawyer.firstName} {lawyer.lastName}</h1>
                                            {lawyer.isVerified && (
                                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Verified</Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground flex items-center mt-1">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {lawyer.province} • License No. {lawyer.licenseNumber}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button size="lg" className="shadow-lg">
                                            Book Consultation
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                            {/* Main Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-semibold mb-4">About</h2>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        {lawyer.bio}
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-semibold mb-4">Experience & Education</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                <Clock className="w-5 h-5 text-slate-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Experience</h3>
                                                <p className="text-slate-600">{lawyer.experienceYears} Years of Practice</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-slate-100 rounded-lg">
                                                <GraduationCap className="w-5 h-5 text-slate-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Education</h3>
                                                <ul className="text-slate-600 list-disc list-inside">
                                                    {lawyer.education.map((edu, i) => (
                                                        <li key={i}>{edu}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                    <h3 className="font-semibold mb-4">At a Glance</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Consultation Fee</span>
                                            <span className="text-xl font-bold text-green-700">฿{lawyer.consultationFee.toLocaleString()} <span className="text-sm font-normal text-slate-600">/ hour</span></span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Rating</span>
                                            <div className="flex items-center">
                                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                                                <span className="text-xl font-bold">{lawyer.rating}</span>
                                                <span className="text-sm text-slate-500 ml-2">({lawyer.reviewCount} reviews)</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground block mb-2">Specialties</span>
                                            <div className="flex flex-wrap gap-2">
                                                {lawyer.specialties.map((s) => (
                                                    <Badge key={s} variant="outline" className="bg-white">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
