'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle2, 
  Loader2,
  X,
  Plus
} from 'lucide-react';
import { useUser, useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import type { Competition } from '@/lib/types';
import { cn } from '@/lib/utils';
import { submitCompetitionToD1 } from '@/lib/d1-actions';

interface SubmissionFormProps {
  competition: Competition;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubmissionForm({ competition, isOpen, onOpenChange }: SubmissionFormProps) {
  const { user } = useUser();
  const storage = useStorage();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  
  const handleAddLink = () => setLinks([...links, '']);
  const handleRemoveLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleFileFieldChange = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setUploadingFields(prev => ({ ...prev, [fieldId]: true }));
    try {
      const storageRef = ref(storage, `submissions/${competition.id}/${user?.uid}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setCustomFieldValues(prev => ({ ...prev, [fieldId]: url }));
      toast({
        title: "อัปโหลดไฟล์สำเร็จ",
        description: `ไฟล์ "${file.name}" ถูกอัปโหลดแล้ว`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "เกิดข้อผิดพลาดในการอัปโหลด",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setUploadingFields(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนทำการสมัคร",
        variant: "destructive",
      });
      return;
    }

    if (!details.trim()) {
      toast({
        title: "กรุณากรอกรายละเอียด",
        description: "รายละเอียดเบื้องต้นหรือผลงานเป็นสิ่งจำเป็น",
        variant: "destructive",
      });
      return;
    }

    // Validate custom fields
    if (competition.formFields) {
      for (const field of competition.formFields) {
        if (field.required && !customFieldValues[field.id]) {
          toast({
            title: "กรุณากรอกข้อมูลให้ครบถ้วน",
            description: `กรุณาระบุ "${field.label}"`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await submitCompetitionToD1({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || 'Anonymous',
        userPhone: phone,
        competitionId: competition.id,
        competitionTitle: competition.title,
        competitionImageUrl: competition.imageUrl || '',
        submissionDetails: details,
        fileUrls: links.filter(link => link.trim() !== ''),
        status: 'pending',
        customFields: customFieldValues,
        organizerId: competition.userId,
      });

      setIsSuccess(true);
      toast({
        title: "ส่งผลงานสำเร็จ!",
        description: "เราได้รับข้อมูลของคุณแล้ว ผู้จัดจะทำการตรวจสอบเร็วๆ นี้",
      });
    } catch (error) {
      console.error("Error submitting:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDetails('');
    setLinks(['']);
    setIsSuccess(false);
    onOpenChange(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden rounded-3xl">
          <div className="p-12 text-center space-y-6 bg-white">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 animate-in zoom-in duration-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">ส่งผลงานสำเร็จแล้ว!</h2>
              <p className="text-slate-400 font-bold max-w-[280px] mx-auto leading-relaxed">
                เราได้ส่งข้อมูลของคุณไปยังผู้จัดงาน **{competition.organizer || 'ContestOne'}** เรียบร้อยแล้ว
              </p>
            </div>
            <Button 
              onClick={resetForm}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-12 rounded-2xl shadow-xl transition-all"
            >
              รับทราบ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-none p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="px-8 pt-10 pb-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
             </div>
             <div>
                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">ส่งผลงาน / สมัครทีม</DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 mt-0.5">
                  {competition.title}
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 bg-white max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Details Section */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
               รายละเอียดเบื้องต้น / ประวัติย่อย <span className="text-red-500">*</span>
            </Label>
            <Textarea 
              placeholder="แนะนำตัวทีมของคุณ หรือสรุปผลงานสั้นๆ (เช่น แนวคิดหลัก เทคโนโลยีที่ใช้)..."
              className="min-h-[100px] bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 resize-none transition-all"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">เบอร์โทรศัพท์ติดต่อ</Label>
              <Input 
                type="tel"
                placeholder="0xx-xxx-xxxx"
                className="h-11 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-3 opacity-60">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">อีเมลผู้สมัคร</Label>
              <Input 
                type="email"
                disabled
                value={user?.email || ''}
                className="h-11 bg-slate-50 border-none rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Dynamic Custom Fields */}
          {competition.formFields && competition.formFields.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary pl-1">ข้อมูลเพิ่มเติมที่ผู้จัดต้องการ</p>
              <div className="space-y-4">
                {competition.formFields.map((field) => (
                  <div key={field.id} className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 flex items-center gap-2">
                       {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {field.type === 'multiline' ? (
                      <Textarea 
                        placeholder={field.placeholder || 'กรอกข้อมูล...'}
                        className="min-h-[80px] bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 font-medium text-slate-700 resize-none transition-all"
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) => setCustomFieldValues({...customFieldValues, [field.id]: e.target.value})}
                      />
                    ) : field.type === 'file' ? (
                      <div className="relative h-11 bg-slate-50 border-none rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center px-4 overflow-hidden">
                        {uploadingFields[field.id] ? (
                          <div className="flex items-center gap-2 text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs font-bold italic">กำลังอัปโหลด...</span>
                          </div>
                        ) : customFieldValues[field.id] ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 overflow-hidden">
                               <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                               <span className="text-xs font-bold text-emerald-600 truncate max-w-[200px]">อัปโหลดสำเร็จแล้ว</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setCustomFieldValues({...customFieldValues, [field.id]: ''})}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                             <Upload className="h-4 w-4" />
                             <span className="text-xs font-bold">เลือกไฟล์เพื่ออัปโหลด</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => handleFileFieldChange(field.id, e)}
                          disabled={uploadingFields[field.id]}
                        />
                      </div>
                    ) : (
                      <Input 
                        type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                        placeholder={field.placeholder || (field.type === 'url' ? 'https://...' : 'กรอกข้อมูล...')}
                        className="h-11 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium"
                        value={customFieldValues[field.id] || ''}
                        onChange={(e) => setCustomFieldValues({...customFieldValues, [field.id]: e.target.value})}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 ลิงก์ไฟล์ผลงาน / Portfolio (Google Drive, Behance, Github)
              </Label>
              <button 
                onClick={handleAddLink}
                className="text-[10px] font-black text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3 w-3" /> เพิ่มลิงก์
              </button>
            </div>
            
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 group">
                  <div className="relative flex-grow">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="https://..."
                      className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium text-blue-600"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                    />
                  </div>
                  {links.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-8 py-6 bg-slate-50/50 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
          <Button 
            variant="ghost" 
            className="w-full sm:w-auto font-bold text-slate-400 hover:text-slate-600 rounded-2xl h-12"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button 
            className="w-full sm:flex-grow bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> กำลังส่งข้อมูล...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" /> ยืนยันการสมัคร
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
