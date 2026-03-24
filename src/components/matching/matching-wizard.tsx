'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LAWYER_SPECIALTIES, THAI_PROVINCES, Lawyer } from '@/lib/types';
import { SEED_LAWYERS } from '@/lib/seed-content';
import { LawyerCard } from '@/components/lawyers/lawyer-card';
import { CheckCircle2, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function MatchingWizard() {
    const [step, setStep] = useState(1);
    const [specialty, setSpecialty] = useState<string>('');
    const [province, setProvince] = useState<string>('');
    const [matchedLawyers, setMatchedLawyers] = useState<Lawyer[]>([]);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleMatch = () => {
        const matches = SEED_LAWYERS.filter(l =>
            l.specialties.includes(specialty as any) &&
            l.province === province
        ).map((l, i) => ({ ...l, id: `lawyer-${i + 1}` } as Lawyer));

        setMatchedLawyers(matches);
        nextStep();
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex items-center ${step > s ? 'text-green-600' : step === s ? 'text-blue-600' : 'text-slate-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold ${step > s ? 'bg-green-100 border-green-600' :
                                    step === s ? 'bg-blue-100 border-blue-600' :
                                        'border-slate-300'
                                }`}>
                                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-0.5 mx-2 ${step > s ? 'bg-green-600' : 'bg-slate-200'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <Card className="shadow-xl border-t-4 border-t-blue-600">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">
                        {step === 1 && "What kind of legal help do you need?"}
                        {step === 2 && "Where are you located?"}
                        {step === 3 && "We found these lawyers for you"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RadioGroup value={specialty} onValueChange={setSpecialty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {LAWYER_SPECIALTIES.map((s) => (
                                    <div key={s}>
                                        <RadioGroupItem value={s} id={s} className="peer sr-only" />
                                        <Label
                                            htmlFor={s}
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full"
                                        >
                                            <span className="text-lg font-semibold">{s}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-md mx-auto space-y-4">
                            <Label htmlFor="province-select" className="text-lg">Select your province</Label>
                            <Select value={province} onValueChange={setProvince}>
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue placeholder="Select Province" />
                                </SelectTrigger>
                                <SelectContent>
                                    {THAI_PROVINCES.map((p) => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            {matchedLawyers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {matchedLawyers.map((lawyer) => (
                                        <LawyerCard key={lawyer.id} lawyer={lawyer} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-slate-900">No specific matches found</h3>
                                    <p className="text-slate-500 mt-2 mb-6">We couldn't find a lawyer exactly matching your criteria in our demo database.</p>
                                    <Button asChild variant="outline">
                                        <Link href="/lawyers">Browse all lawyers</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50 p-6 rounded-b-xl">
                    {step > 1 && step < 3 && (
                        <Button variant="outline" onClick={prevStep}>Back</Button>
                    )}
                    {step === 1 && (
                        <Button className="ml-auto w-32" onClick={nextStep} disabled={!specialty}>
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                    {step === 2 && (
                        <Button className="ml-auto w-32" onClick={handleMatch} disabled={!province}>
                            Find Match
                        </Button>
                    )}
                    {step === 3 && (
                        <div className="w-full flex justify-center">
                            <Button asChild size="lg">
                                <Link href="/lawyers">View Full Directory</Link>
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
