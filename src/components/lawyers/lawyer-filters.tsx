'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LAWYER_SPECIALTIES, THAI_PROVINCES } from "@/lib/types";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export function LawyerFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse initial state from URL
    const getInitialFilters = (key: string) => {
        const param = searchParams.get(key);
        return param ? param.split(',') : [];
    };

    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(getInitialFilters('specialty'));
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>(getInitialFilters('province'));

    // Update local state when URL changes
    useEffect(() => {
        setSelectedSpecialties(getInitialFilters('specialty'));
        setSelectedProvinces(getInitialFilters('province'));
    }, [searchParams]);

    const createQueryString = useCallback((name: string, value: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.length > 0) {
            params.set(name, value.join(','));
        } else {
            params.delete(name);
        }
        return params.toString();
    }, [searchParams]);

    const updateFilters = (key: string, values: string[]) => {
        if (key === 'specialty') setSelectedSpecialties(values);
        if (key === 'province') setSelectedProvinces(values);

        const queryString = createQueryString(key, values);
        router.push(`?${queryString}`, { scroll: false });
    };

    const toggleFilter = (section: 'specialty' | 'province', item: string) => {
        const currentList = section === 'specialty' ? selectedSpecialties : selectedProvinces;
        const newList = currentList.includes(item)
            ? currentList.filter(i => i !== item)
            : [...currentList, item];

        updateFilters(section, newList);
    };

    const clearFilters = () => {
        setSelectedSpecialties([]);
        setSelectedProvinces([]);
        router.push('?', { scroll: false });
    };

    const hasFilters = selectedSpecialties.length > 0 || selectedProvinces.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-muted-foreground">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            <div>
                <h4 className="font-medium mb-3">Specialty</h4>
                <div className="space-y-2">
                    {LAWYER_SPECIALTIES.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                            <Checkbox
                                id={`specialty-${specialty}`}
                                checked={selectedSpecialties.includes(specialty)}
                                onCheckedChange={() => toggleFilter('specialty', specialty)}
                            />
                            <Label htmlFor={`specialty-${specialty}`} className="text-sm font-normal cursor-pointer">
                                {specialty}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <h4 className="font-medium mb-3">Province</h4>
                <div className="space-y-2">
                    {THAI_PROVINCES.map((province) => (
                        <div key={province} className="flex items-center space-x-2">
                            <Checkbox
                                id={`province-${province}`}
                                checked={selectedProvinces.includes(province)}
                                onCheckedChange={() => toggleFilter('province', province)}
                            />
                            <Label htmlFor={`province-${province}`} className="text-sm font-normal cursor-pointer">
                                {province}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
