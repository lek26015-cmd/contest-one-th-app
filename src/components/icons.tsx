import { Briefcase, Mic, Code, Sprout, Rocket, Cpu, Lightbulb, Trophy, Palette, Film, Camera, Music, type LucideIcon } from 'lucide-react';
import type { CompetitionCategory, CategoryIcon } from '@/lib/types';

export const categoryIcons: CategoryIcon[] = [
    { name: 'Business Plan', icon: Briefcase },
    { name: 'Pitching', icon: Mic },
    { name: 'Hackathon', icon: Code },
    { name: 'Incubation', icon: Sprout },
    { name: 'Accelerator', icon: Rocket },
    { name: 'Technology', icon: Cpu },
    { name: 'Innovation', icon: Lightbulb },
    { name: 'Design', icon: Palette },
    { name: 'Film', icon: Film },
    { name: 'Photography', icon: Camera },
    { name: 'Art', icon: Palette },
    { name: 'Music', icon: Music },
];

export const getCategoryIcon = (category: CompetitionCategory): LucideIcon => {
    return categoryIcons.find((c) => c.name === category)?.icon || Trophy;
};
