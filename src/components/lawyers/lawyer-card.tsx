'use client';

import { Lawyer } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Scale } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LawyerCardProps {
    lawyer: Lawyer;
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="relative h-48 w-full bg-slate-100">
                <Image
                    src={lawyer.imageUrl}
                    alt={`${lawyer.firstName} ${lawyer.lastName}`}
                    fill
                    className="object-cover"
                />
                {lawyer.isVerified && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
                        Verified
                    </div>
                )}
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold line-clamp-1">{lawyer.firstName} {lawyer.lastName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {lawyer.province}
                        </p>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700">
                        <Star className="w-3 h-3 fill-yellow-500 mr-1" />
                        <span className="text-sm font-semibold">{lawyer.rating}</span>
                        <span className="text-xs text-yellow-600 ml-1">({lawyer.reviewCount})</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-1 mb-3">
                    {lawyer.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs font-normal">
                            {specialty}
                        </Badge>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {lawyer.bio}
                </p>
                <div className="flex items-center text-sm text-slate-600">
                    <Scale className="w-4 h-4 mr-2" />
                    <span>{lawyer.experienceYears} Years Experience</span>
                </div>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2">
                <Link href={`/lawyers/${lawyer.id}`} className="w-full">
                    <Button className="w-full">View Profile</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
