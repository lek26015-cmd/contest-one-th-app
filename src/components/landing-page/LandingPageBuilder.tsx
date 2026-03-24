'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Plus, Trash2, ChevronUp, ChevronDown, Save, Eye, Palette, Layout, Settings, 
  Type, Image as ImageIcon, Link as LinkIcon, Trophy 
} from 'lucide-react';
import { HeroSection, AboutSection, PrizesSection, Renderer } from './LandingPageSections';
import { LandingPage, LandingPageSection, LandingPageTheme } from '@/lib/types';
import { saveLandingPage } from '@/lib/landing-page-actions';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const THEME_PRESETS: Record<string, LandingPageTheme> = {
  default: {
    primaryColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    showHeader: true,
    showFooter: true,
  },
  midnight: {
    primaryColor: '#8b5cf6',
    fontFamily: 'Inter',
    borderRadius: '1rem',
    showHeader: true,
    showFooter: true,
  },
  sunset: {
    primaryColor: '#f43f5e',
    fontFamily: 'serif',
    borderRadius: '2rem',
    showHeader: true,
    showFooter: true,
  },
  forest: {
    primaryColor: '#10b981',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    showHeader: true,
    showFooter: true,
  },
  cyberpunk: {
    primaryColor: '#ec4899',
    fontFamily: 'monospace',
    borderRadius: '0px',
    showHeader: true,
    showFooter: true,
  }
};

interface Props {
  initialData: LandingPage;
}

export default function LandingPageBuilder({ initialData }: Props) {
  const [page, setPage] = useState<LandingPage>(initialData);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const selectedSection = page.sections.find(s => s.id === selectedSectionId);

  const addSection = (type: LandingPageSection['type']) => {
    const newSection: LandingPageSection = {
      id: crypto.randomUUID(),
      type,
      content: getInitialContent(type),
      settings: { padding: 'medium', backgroundColor: type === 'hero' ? 'bg-slate-900' : 'bg-white' }
    };
    setPage(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setSelectedSectionId(newSection.id);
  };

  const updateSection = (id: string, updates: Partial<LandingPageSection>) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeSection = (id: string) => {
    setPage(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    if (selectedSectionId === id) setSelectedSectionId(null);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const idx = page.sections.findIndex(s => s.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === page.sections.length - 1) return;

    const newSections = [...page.sections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newSections[idx], newSections[targetIdx]] = [newSections[targetIdx], newSections[idx]];
    setPage(prev => ({ ...prev, sections: newSections }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveLandingPage(page);
      if (result) {
        toast({ title: "บันทึกสำเร็จ", description: "หน้า Landing Page ของคุณถูกบันทึกเรียบร้อยแล้ว" });
      }
    } catch (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถบันทึกข้อมูลได้", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* Sidebar: Editor */}
      <aside className="w-[400px] border-r bg-white flex flex-col shadow-xl z-20">
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="font-black text-xl flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            Page Builder
          </h2>
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="font-bold">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <Tabs defaultValue="sections" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 mx-4 mt-4 bg-slate-100 rounded-xl p-1">
            <TabsTrigger value="sections" className="rounded-lg font-bold">Sections</TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg font-bold" disabled={!selectedSectionId}>Edit</TabsTrigger>
            <TabsTrigger value="theme" className="rounded-lg font-bold">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Add New Section</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => addSection('hero')} className="h-20 flex-col gap-2 rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all">
                  <Layout className="h-5 w-5" /> Hero
                </Button>
                <Button variant="outline" size="sm" onClick={() => addSection('about')} className="h-20 flex-col gap-2 rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all">
                  <Type className="h-5 w-5" /> About
                </Button>
                <Button variant="outline" size="sm" onClick={() => addSection('prizes')} className="h-20 flex-col gap-2 rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all">
                  <Trophy className="h-5 w-5" /> Prizes
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Current Sections</Label>
              <div className="space-y-2">
                {page.sections.map((s, i) => (
                  <div 
                    key={s.id} 
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedSectionId === s.id ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setSelectedSectionId(s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-black text-slate-300 w-4">{i + 1}</div>
                      <span className="font-bold text-sm capitalize">{s.type}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'up'); }}><ChevronUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); moveSection(s.id, 'down'); }}><ChevronDown className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); removeSection(s.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="flex-1 overflow-y-auto p-4 space-y-6">
            {selectedSection && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-primary">Content Options</h3>
                  {selectedSection.type === 'hero' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Title</Label>
                        <Input 
                          value={selectedSection.content.title} 
                          onChange={e => updateSection(selectedSection.id, { content: { ...selectedSection.content, title: e.target.value } })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Subtitle</Label>
                        <Textarea 
                          value={selectedSection.content.subtitle} 
                          onChange={e => updateSection(selectedSection.id, { content: { ...selectedSection.content, subtitle: e.target.value } })}
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                  {selectedSection.type === 'about' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Section Title</Label>
                        <Input 
                          value={selectedSection.content.title} 
                          onChange={e => updateSection(selectedSection.id, { content: { ...selectedSection.content, title: e.target.value } })}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Description</Label>
                        <Textarea 
                          value={selectedSection.content.description} 
                          onChange={e => updateSection(selectedSection.id, { content: { ...selectedSection.content, description: e.target.value } })}
                          className="rounded-xl min-h-[100px]"
                        />
                      </div>
                    </div>
                  )}

                  {selectedSection.type === 'prizes' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">Total Prize (Numeric)</Label>
                          <Input 
                            type="number"
                            value={selectedSection.content.totalPrize} 
                            onChange={e => updateSection(selectedSection.id, { content: { ...selectedSection.content, totalPrize: parseInt(e.target.value) || 0 } })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Total Prize Message (Override)</Label>
                          <Input 
                            value={selectedSection.content.totalPrizeText || ''} 
                            onChange={e => updateSection(selectedSection.id, { content: { ...selectedSection.content, totalPrizeText: e.target.value } })}
                            className="rounded-xl"
                            placeholder="เช่น รางวัลรวมถ้วยเกียรติยศ"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">* หากใส่ข้อความในช่องข้อความรวม จะแสดงข้อความนั้นแทนยอดเงินรวมอัตโนมัติ</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Prizes List</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newPrizes = [...(selectedSection.content.prizes || []), { rank: 'New Prize', amount: '฿0', description: '' }];
                              updateSection(selectedSection.id, { content: { ...selectedSection.content, prizes: newPrizes } });
                            }}
                            className="h-7 text-[10px] font-black hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            + ADD PRIZE
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {selectedSection.content.prizes?.map((prize: any, pIdx: number) => (
                            <div key={pIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group/prize">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 h-6 w-6 text-slate-300 hover:text-red-500 opacity-0 group-hover/prize:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newPrizes = selectedSection.content.prizes.filter((_: any, i: number) => i !== pIdx);
                                  updateSection(selectedSection.id, { content: { ...selectedSection.content, prizes: newPrizes } });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Prize Title (e.g. 1st Place)</Label>
                                <Input 
                                  value={prize.rank} 
                                  onChange={e => {
                                    const newPrizes = [...selectedSection.content.prizes];
                                    newPrizes[pIdx] = { ...newPrizes[pIdx], rank: e.target.value };
                                    updateSection(selectedSection.id, { content: { ...selectedSection.content, prizes: newPrizes } });
                                  }}
                                  className="h-9 rounded-lg"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-black uppercase text-slate-400">Value (e.g. ฿50,000)</Label>
                                  <Input 
                                    value={prize.amount} 
                                    onChange={e => {
                                      const newPrizes = [...selectedSection.content.prizes];
                                      newPrizes[pIdx] = { ...newPrizes[pIdx], amount: e.target.value };
                                      updateSection(selectedSection.id, { content: { ...selectedSection.content, prizes: newPrizes } });
                                    }}
                                    className="h-9 rounded-lg"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-[10px] font-black uppercase text-slate-400">Description</Label>
                                  <Input 
                                    value={prize.description} 
                                    onChange={e => {
                                      const newPrizes = [...selectedSection.content.prizes];
                                      newPrizes[pIdx] = { ...newPrizes[pIdx], description: e.target.value };
                                      updateSection(selectedSection.id, { content: { ...selectedSection.content, prizes: newPrizes } });
                                    }}
                                    className="h-9 rounded-lg"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-primary">Style Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-bold">Background</Label>
                        <Input 
                          type="color" 
                          value={selectedSection.settings?.backgroundColor || "#ffffff"} 
                          onChange={e => updateSection(selectedSection.id, { settings: { ...selectedSection.settings, backgroundColor: e.target.value } })}
                          className="h-10 p-0 overflow-hidden rounded-lg cursor-pointer"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Padding</Label>
                        <select 
                          value={selectedSection.settings?.padding || 'medium'}
                          onChange={e => updateSection(selectedSection.id, { settings: { ...selectedSection.settings, padding: e.target.value as 'small' | 'medium' | 'large' } })}
                          className="w-full h-10 rounded-xl border bg-white px-3 font-medium"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="theme" className="flex-1 overflow-y-auto p-4 space-y-8">
            <div className="space-y-4">
               <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Theme Presets</Label>
               <div className="grid grid-cols-2 gap-3">
                 {Object.entries(THEME_PRESETS).map(([id, theme]) => (
                   <Button 
                    key={id} 
                    variant="outline" 
                    className={cn(
                      "h-16 flex-col items-start p-3 gap-1 rounded-xl group transition-all",
                      page.theme.primaryColor === theme.primaryColor && "border-primary ring-2 ring-primary/10"
                    )}
                    onClick={() => setPage(prev => ({ ...prev, theme }))}
                   >
                     <div className="flex items-center gap-2 w-full">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                       <span className="text-xs font-bold capitalize">{id}</span>
                     </div>
                     <div className="flex gap-1">
                        <div className="w-6 h-1 rounded-full bg-slate-200" />
                        <div className="w-10 h-1 rounded-full bg-slate-100" />
                     </div>
                   </Button>
                 ))}
               </div>
            </div>

            <Separator />

            <div className="space-y-4">
               <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Custom Styling</Label>
               <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="font-black text-sm">Primary Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="color" 
                        value={page.theme.primaryColor} 
                        onChange={e => setPage(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                        className="w-10 h-10 p-0 rounded-full border-none cursor-pointer overflow-hidden"
                      />
                      <Input 
                        value={page.theme.primaryColor} 
                        onChange={e => setPage(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                        className="flex-1 rounded-xl h-10 font-mono text-sm"
                      />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label className="font-black text-sm">Border Radius</Label>
                    <div className="grid grid-cols-3 gap-2">
                       {['0px', '0.75rem', '2rem'].map((val) => (
                         <Button 
                          key={val}
                          variant={page.theme.borderRadius === val ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(prev => ({ ...prev, theme: { ...prev.theme, borderRadius: val } }))}
                          className="text-[10px] font-bold h-8 rounded-lg"
                         >
                           {val === '0px' ? 'Sharp' : val === '0.75rem' ? 'Soft' : 'Round'}
                         </Button>
                       ))}
                    </div>
                </div>
               </div>
            </div>
          </TabsContent>
        </Tabs>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-200 p-8 flex flex-col">
        <div className="mb-4 flex items-center justify-between px-4">
           <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase text-slate-500">Live Preview</span>
           </div>
           <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="rounded-full bg-white shadow-sm hover:translate-y-[-2px] transition-transform"><Plus className="h-4 w-4 mr-2" /> Add Page</Button>
              <Button variant="ghost" size="sm" className="rounded-full bg-white shadow-sm hover:translate-y-[-2px] transition-transform"><Eye className="h-4 w-4 mr-2" /> View Site</Button>
           </div>
        </div>
        <Card className="flex-1 overflow-hidden rounded-[2rem] shadow-2xl border-none ring-8 ring-white/50">
          <CardContent className="h-full p-0 overflow-y-auto scrollbar-hide">
            <Renderer 
              sections={page.sections} 
              theme={page.theme} 
              selectedId={selectedSectionId}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function getInitialContent(type: LandingPageSection['type']) {
  switch (type) {
    case 'hero': return { title: 'Welcome to our Competition', subtitle: 'Join the most exciting event of the year!', ctaText: 'Register Now', ctaLink: '#apply' };
    case 'about': return { title: 'About the Event', description: 'This event is designed to foster innovation...', features: [{ title: 'Networking', description: 'Meet with industry leaders' }] };
    case 'prizes': return { prizes: [{ rank: '1st Place', amount: '฿50,000', description: 'Grand Prize' }], totalPrize: 50000 };
    default: return {};
  }
}
