'use client';

import { LawyerCard } from "@/components/lawyers/lawyer-card";
import { LawyerFilters } from "@/components/lawyers/lawyer-filters";
import { SEED_LAWYERS } from "@/lib/seed-content";
import { Lawyer } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function LawyersPageContent() {
    const searchParams = useSearchParams();

    const filteredLawyers = useMemo(() => {
        const specialties = searchParams.get('specialty')?.split(',') || [];
        const provinces = searchParams.get('province')?.split(',') || [];

        return SEED_LAWYERS.map((l, i) => ({ ...l, id: `lawyer-${i + 1}` } as Lawyer)).filter((lawyer) => {
            const matchesSpecialty = specialties.length === 0 || specialties.some(s => lawyer.specialties.includes(s as any));
            const matchesProvince = provinces.length === 0 || provinces.includes(lawyer.province);
            return matchesSpecialty && matchesProvince;
        });
    }, [searchParams]);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Find Your Lawyer</h1>
                <p className="text-muted-foreground mt-2">Connect with top legal professionals across Thailand.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-64 flex-shrink-0">
                    <Suspense fallback={<div>Loading filters...</div>}>
                        <LawyerFilters />
                    </Suspense>
                </aside>

                <main className="flex-grow">
                    {filteredLawyers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredLawyers.map((lawyer) => (
                                <LawyerCard key={lawyer.id} lawyer={lawyer} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <h3 className="text-lg font-medium text-slate-900">No lawyers found</h3>
                            <p className="text-slate-500 mt-1">Try adjusting your filters to see more results.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function LawyersPage() {
    return (
        <Suspense fallback={<div>Loading directory...</div>}>
            <LawyersPageContent />
        </Suspense>
    );
}
