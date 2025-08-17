import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/accountApi';

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Edit profile dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  // Change password dialog state
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await accountApi.getAccount(token);
        setUser(res.user);
      } catch (err: any) {
        setError(err.message || 'Failed to load account');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg shadow-xl border border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Account</CardTitle>
          <CardDescription className="text-base text-muted-foreground">View and manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-primary animate-pulse">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : user ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {user.name?.[0] || user.email?.[0] || '?'}
                </div>
                <div className="text-lg font-semibold text-primary">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground">Role: {user.role}</div>
                <div className="text-xs text-muted-foreground">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => {
                      setEditName(user.name);
                      setEditEmail(user.email);
                      setEditError('');
                    }}>Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>Edit Profile</DialogHeader>
                    <form onSubmit={async e => {
                      e.preventDefault();
                      setEditLoading(true);
                      setEditError('');
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Not authenticated');
                        const res = await accountApi.updateProfile({ name: editName, email: editEmail }, token);
                        setUser(res.user);
                        setEditOpen(false);
                      } catch (err: any) {
                        setEditError(err.error || err.message || 'Failed to update profile');
                      } finally {
                        setEditLoading(false);
                      }
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required className="mt-1" />
                      </div>
                      {editError && <div className="text-red-500 text-sm text-center">{editError}</div>}
                      <DialogFooter>
                        <Button type="submit" disabled={editLoading} className="w-full">{editLoading ? 'Saving...' : 'Save Changes'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog open={pwOpen} onOpenChange={setPwOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setPwError('');
                      setPwSuccess('');
                    }}>Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>Change Password</DialogHeader>
                    <form onSubmit={async e => {
                      e.preventDefault();
                      setPwLoading(true);
                      setPwError('');
                      setPwSuccess('');
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Not authenticated');
                        await accountApi.changePassword({ currentPassword, newPassword }, token);
                        setPwSuccess('Password changed successfully!');
                        setCurrentPassword('');
                        setNewPassword('');
                      } catch (err: any) {
                        setPwError(err.error || err.message || 'Failed to change password');
                      } finally {
                        setPwLoading(false);
                      }
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1" />
                      </div>
                      {pwError && <div className="text-red-500 text-sm text-center">{pwError}</div>}
                      {pwSuccess && <div className="text-green-600 text-sm text-center">{pwSuccess}</div>}
                      <DialogFooter>
                        <Button type="submit" disabled={pwLoading} className="w-full">{pwLoading ? 'Saving...' : 'Change Password'}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default Account;
