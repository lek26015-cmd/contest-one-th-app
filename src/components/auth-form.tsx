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

const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
});

const registerSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  confirmPassword: z.string(),
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
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
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
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Redirect is handled by the login page
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
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">เข้าสู่ระบบ</TabsTrigger>
        <TabsTrigger value="register">สมัครสมาชิก</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              เข้าสู่ระบบเพื่อจัดการและติดตามการแข่งขันของคุณ
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLoginSubmit(onLogin)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">อีเมล</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" {...registerLogin('email')} />
                {loginErrors.email && <p className="text-sm text-destructive">{loginErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">รหัสผ่าน</Label>
                <Input id="login-password" type="password" {...registerLogin('password')} />
                {loginErrors.password && <p className="text-sm text-destructive">{loginErrors.password.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {(isLoading && !isGoogleLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เข้าสู่ระบบ
              </Button>
               <Button variant="secondary" className="w-full" disabled={isLoading || isGoogleLoading} onClick={handleAnonymousSignIn} type="button">
                {(isLoading && !isGoogleLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                เข้าสู่ระบบแบบไม่ระบุตัวตน
              </Button>
              {sharedFooter}
              <Button variant="link" size="sm" onClick={handlePasswordReset} disabled={isResettingPassword} type="button">
                 {isResettingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ลืมรหัสผ่าน?
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>สมัครสมาชิก</CardTitle>
            <CardDescription>
              สร้างบัญชีใหม่เพื่อเริ่มต้นการแข่งขัน
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegisterSubmit(onRegister)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">อีเมล</Label>
                <Input id="register-email" type="email" placeholder="m@example.com" {...registerRegister('email')} />
                {registerErrors.email && <p className="text-sm text-destructive">{registerErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">รหัสผ่าน</Label>
                <Input id="register-password" type="password" {...registerRegister('password')} />
                {registerErrors.password && <p className="text-sm text-destructive">{registerErrors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">ยืนยันรหัสผ่าน</Label>
                <Input id="confirm-password" type="password" {...registerRegister('confirmPassword')} />
                {registerErrors.confirmPassword && <p className="text-sm text-destructive">{registerErrors.confirmPassword.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                {(isLoading && !isGoogleLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                สมัครสมาชิก
              </Button>
               {sharedFooter}
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
