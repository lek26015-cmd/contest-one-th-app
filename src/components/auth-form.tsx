'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from './ui/separator';

import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'organizer']).default('user'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.999,36.586,44,31.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
)

export function AuthForm() {
  const auth = useAuth();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
    getValues: getLoginValues
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
    setValue: setValueRegister,
    watch: watchRegister,
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    }
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // Redirect is handled by the login page
    } catch (error: any) {
      toast({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Save role to Firestore immediately
      await setDoc(doc(firestore, `users/${user.uid}`), {
        id: user.uid,
        email: user.email,
        username: user.email?.split('@')[0] || `user_${user.uid.substring(0, 5)}`,
        profileName: user.email?.split('@')[0] || 'User',
        role: data.role,
        createdAt: serverTimestamp(),
        plan: data.role === 'organizer' ? 'free' : undefined,
      });

      toast({
        title: 'สมัครสมาชิกสำเร็จ',
        description: data.role === 'organizer' ? 'เริ่มสร้างการแข่งขันของคุณได้เลย' : 'ยินดีต้อนรับสู่ ContestOne',
      });
    } catch (error: any) {
      toast({
        title: 'สมัครสมาชิกไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        toast({
            title: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsGoogleLoading(false);
    }
  }

  const handleAnonymousSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
       toast({
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handlePasswordReset = async () => {
    if (!auth) return;
    const email = getLoginValues("email");
    if (!email) {
      toast({
        title: 'กรุณากรอกอีเมล',
        description: 'กรุณากรอกอีเมลของคุณในช่องด้านบนก่อนกดลืมรหัสผ่าน',
        variant: 'destructive',
      });
      return;
    }
    
    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว',
        description: 'กรุณาตรวจสอบอีเมลของคุณเพื่อดำเนินการต่อ',
      });
    } catch (error: any) {
       toast({
        title: 'เกิดข้อผิดพลาด',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    resetLogin();
    resetRegister();
  }

  const sharedFooter = (
      <>
        <div className="relative">
            <Separator />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-card px-2 text-xs uppercase text-muted-foreground">หรือ</span>
            </div>
        </div>
        <Button variant="outline" className="w-full" disabled={isGoogleLoading || isLoading} onClick={handleGoogleSignIn} type="button">
            {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            เข้าสู่ระบบด้วย Google
        </Button>
      </>
  )

  return (
    <div className="w-full font-body">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-2xl mb-8 h-12">
          <TabsTrigger value="login" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            เข้าสู่ระบบ
          </TabsTrigger>
          <TabsTrigger value="register" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
            สมัครสมาชิก
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-headline">ยินดีต้อนรับกลับมา</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">เข้าสู่ระบบเพื่อจัดการและติดตามการแข่งขันของคุณ</p>
            </div>

            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">อีเมล</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  {...registerLogin('email')} 
                  className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/5 font-bold transition-all"
                />
                {loginErrors.email && <p className="text-xs font-bold text-destructive mt-1">{loginErrors.email?.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">รหัสผ่าน</Label>
                  <button 
                    type="button" 
                    onClick={handlePasswordReset} 
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <Input 
                  id="login-password" 
                  type="password" 
                  {...registerLogin('password')} 
                  className="h-14 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/5 font-bold transition-all"
                />
                {loginErrors.password && <p className="text-xs font-bold text-destructive mt-1">{loginErrors.password?.message}</p>}
              </div>

              <div className="pt-2 space-y-3">
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading || isGoogleLoading}>
                  {isLoading && !isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'เข้าสู่ระบบ'}
                </Button>
                
                <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50" disabled={isLoading || isGoogleLoading} onClick={handleAnonymousSignIn} type="button">
                  เข้าใช้งานแบบไม่ระบุตัวตน
                </Button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">หรือใช้บัญชี</span></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-2 border-slate-50 hover:border-slate-100 hover:bg-slate-50 font-black flex items-center justify-center gap-3 transition-all" 
                disabled={isGoogleLoading || isLoading} 
                onClick={handleGoogleSignIn} 
                type="button"
              >
                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                เข้าสู่ระบบด้วย Google
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-headline">เข้าร่วมกับเรา</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">เริ่มต้นการเดินทางในโลกของการแข่งขันได้ที่นี่</p>
            </div>

            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-5">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">คุณคือใคร?</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setValueRegister('role', 'user')}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-2 transition-all group overflow-hidden relative",
                      watchRegister('role') === 'user' ? "border-primary bg-primary/5 text-primary" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100"
                    )}
                  >
                    <div className="font-black text-sm relative z-10">นักล่ารางวัล</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-1 relative z-10">SEARCH & APPLY</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValueRegister('role', 'organizer')}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border-2 transition-all group overflow-hidden relative",
                      watchRegister('role') === 'organizer' ? "border-primary bg-primary/5 text-primary" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100"
                    )}
                  >
                    <div className="font-black text-sm relative z-10">ผู้จัดงาน</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mt-1 relative z-10">CREATE & MANAGE</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">อีเมล</Label>
                <Input 
                  id="register-email" 
                  type="email" 
                  placeholder="m@example.com" 
                  {...registerRegister('email')} 
                  className="h-14 bg-slate-50 border-none rounded-2xl font-bold" 
                />
                {registerErrors.email && <p className="text-xs font-bold text-destructive">{registerErrors.email?.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">รหัสผ่าน</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    {...registerRegister('password')} 
                    className="h-14 bg-slate-50 border-none rounded-2xl font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ยืนยันรหัสผ่าน</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    {...registerRegister('confirmPassword')} 
                    className="h-14 bg-slate-50 border-none rounded-2xl font-bold" 
                  />
                </div>
              </div>
              {registerErrors.password && <p className="text-xs font-bold text-destructive">{registerErrors.password?.message}</p>}
              {registerErrors.confirmPassword && <p className="text-xs font-bold text-destructive">{registerErrors.confirmPassword?.message}</p>}

              <div className="pt-4 space-y-4">
                <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl transition-all" disabled={isLoading || isGoogleLoading}>
                  {isLoading && !isGoogleLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'สร้างบัญชีผู้ใช้คร้บ'}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">หรือสมัครด้วย</span></div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-2 border-slate-50 text-slate-600 font-black gap-3" 
                  disabled={isGoogleLoading || isLoading} 
                  onClick={handleGoogleSignIn} 
                  type="button"
                >
                  <GoogleIcon />
                  Google Account
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
