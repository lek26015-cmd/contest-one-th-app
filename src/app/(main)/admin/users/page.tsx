'use client';
import { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Trash2, Search, User as UserIcon, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type AdminUser = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  creationTime: string;
  lastSignInTime: string;
  customClaims?: { [key: string]: any };
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { user: adminUser } = useUser();
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Helper to call functions via proxy to avoid CORS
  const callFunction = async (name: string, data: any = {}) => {
    if (!adminUser) throw new Error("Not authenticated");
    const token = await adminUser.getIdToken();
    const response = await fetch(`/api/functions/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Function call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message || "Unknown function error");
    }
    return json.result; // onCall returns { result: ... }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // const functions = getFunctions();
      // const listUsers = httpsCallable(functions, 'listUsers');
      // const result = await listUsers();
      // const data = result.data as { users: AdminUser[] };

      const result = await callFunction('listUsers');
      const data = result as { users: AdminUser[] };

      setAllUsers(data.users.sort((a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()));
    } catch (error: any) {
      console.error("Fetch users error:", error);
      toast({
        title: 'Error fetching users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      fetchUsers();
    }
  }, [adminUser]);

  const handleDeleteUsers = async () => {
    if (selectedUsers.size === 0) {
      toast({ title: 'No users selected', variant: 'destructive' });
      return;
    }
    try {
      // const functions = getFunctions();
      // const deleteUsersFn = httpsCallable(functions, 'deleteUser');
      // await deleteUsersFn({ uids: Array.from(selectedUsers) });

      await callFunction('deleteUser', { uids: Array.from(selectedUsers) });

      toast({ title: 'Success', description: `${selectedUsers.size} user(s) deleted.` });
      setSelectedUsers(new Set());
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error deleting users',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleAdmin = async (uid: string, isAdmin: boolean) => {
    try {
      // const functions = getFunctions();
      // const toggleAdminRoleFn = httpsCallable(functions, 'toggleAdminRole');
      // await toggleAdminRoleFn({ uid, isAdmin });

      await callFunction('toggleAdminRole', { uid, isAdmin });

      toast({ title: 'Success', description: `User role updated.` });

      // Update local state to reflect the change immediately
      setAllUsers(currentUsers =>
        currentUsers.map(u =>
          u.uid === uid ? { ...u, customClaims: { ...u.customClaims, admin: isAdmin } } : u
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };


  const toggleUserSelection = (uid: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uid)) {
        newSet.delete(uid);
      } else {
        newSet.add(uid);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      const allVisibleIds = new Set(filteredUsers.map(u => u.uid).filter(uid => uid !== adminUser?.uid));
      setSelectedUsers(allVisibleIds);
    }
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const getInitials = (name: string | undefined, email: string | undefined) => {
    return name?.charAt(0) || email?.charAt(0) || 'U';
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">จัดการผู้ใช้</h1>
          <p className="text-muted-foreground">ดู, ค้นหา, และจัดการสิทธิ์ผู้ใช้ในระบบ</p>
        </div>
        {selectedUsers.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ ({selectedUsers.size}) ผู้ใช้
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {selectedUsers.size} user(s). This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUsers}>Confirm Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-4">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center p-3 border-b">
                  <Checkbox
                    id="select-all"
                    checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.filter(u => u.uid !== adminUser?.uid).length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all" className="ml-4 font-medium">
                    เลือกทั้งหมด
                  </label>
                </div>
                {filteredUsers.map(user => (
                  <div key={user.uid} className="flex items-center justify-between p-3 border rounded-lg bg-card-foreground/5">
                    <div className="flex items-center gap-4 flex-grow">
                      <Checkbox
                        checked={selectedUsers.has(user.uid)}
                        onCheckedChange={() => toggleUserSelection(user.uid)}
                        disabled={user.uid === adminUser?.uid}
                      />
                      <Avatar>
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>{getInitials(user.displayName, user.email)}</AvatarFallback>
                      </Avatar>
                      <div className='flex-grow'>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.displayName || 'No Name'}</p>
                          {user.customClaims?.admin && (
                            <Badge variant="secondary" className="h-5">
                              <Shield className="mr-1 h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                          {user.uid === adminUser?.uid && (
                            <Badge variant="outline">(You)</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email || 'No Email'}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.creationTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm pr-4">
                      <Checkbox
                        id={`admin-${user.uid}`}
                        checked={!!user.customClaims?.admin}
                        onCheckedChange={(checked) => handleToggleAdmin(user.uid, !!checked)}
                        disabled={user.uid === adminUser?.uid}
                      />
                      <label htmlFor={`admin-${user.uid}`} className="font-medium">Admin</label>
                    </div>
                  </div>
                ))}
              </>
            )}
            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search term.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
