import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressApi } from '@/lib/addressApi';

const Settings = () => {
  // Address state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number|null>(null);
  const [form, setForm] = useState({ type: 'shipping', street: '', city: '', state: '', zipCode: '', country: 'USA' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await addressApi.getAddresses(token);
      setAddresses(res.addresses);
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line
  }, []);

  const handleEdit = (address: any) => {
    setEditId(address.id);
    setForm({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.deleteAddress(id, token);
      fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl shadow-xl border border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Settings</CardTitle>
          <CardDescription className="text-base text-muted-foreground">Manage your addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 py-4">
            {loading ? (
              <div className="text-center text-primary animate-pulse">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Your Addresses</div>
                  <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) { setEditId(null); setForm({ type: 'shipping', street: '', city: '', state: '', zipCode: '', country: 'USA' }); setFormError(''); } }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => { setEditId(null); setForm({ type: 'shipping', street: '', city: '', state: '', zipCode: '', country: 'USA' }); setFormError(''); }}>Add Address</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>{editId ? 'Edit Address' : 'Add Address'}</DialogHeader>
                      <form onSubmit={async e => {
                        e.preventDefault();
                        setFormLoading(true);
                        setFormError('');
                        try {
                          if (!token) throw new Error('Not authenticated');
                          if (editId) {
                            await addressApi.updateAddress(editId, form, token);
                          } else {
                            await addressApi.addAddress(form, token);
                          }
                          setDialogOpen(false);
                          fetchAddresses();
                        } catch (err: any) {
                          setFormError(err.error || err.message || 'Failed to save address');
                        } finally {
                          setFormLoading(false);
                        }
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <select id="type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded px-2 py-2 mt-1">
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="street">Street</Label>
                          <Input id="street" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} required className="mt-1" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required className="mt-1" />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} required className="mt-1" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="zipCode">Zip Code</Label>
                            <Input id="zipCode" value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} required className="mt-1" />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} required className="mt-1" />
                          </div>
                        </div>
                        {formError && <div className="text-red-500 text-sm text-center">{formError}</div>}
                        <DialogFooter>
                          <Button type="submit" disabled={formLoading} className="w-full">{formLoading ? 'Saving...' : (editId ? 'Save Changes' : 'Add Address')}</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="divide-y">
                  {addresses.length === 0 ? (
                    <div className="text-muted-foreground text-center py-8">No addresses found.</div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{addr.type.charAt(0).toUpperCase() + addr.type.slice(1)} Address</div>
                          <div className="text-sm">{addr.street}, {addr.city}, {addr.state}, {addr.zipCode}, {addr.country}</div>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(addr)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(addr.id)}>Delete</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
