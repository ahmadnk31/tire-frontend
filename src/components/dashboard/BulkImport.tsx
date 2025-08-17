
import React, { useState } from "react";
import { FileDropzone } from "../ui/file-dropzone";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/select";
import { toast } from "../ui/sonner";

export default function BulkImport() {
  const [importType, setImportType] = useState<'product' | 'user' | 'category'>('product');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileAccepted = async (file: File) => {
    setError(null);
    setResult(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', importType);
    try {
      const res = await fetch(`/api/bulk/upload-file?type=${importType}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setResult(data);
        toast.error(data.error || 'Upload failed');
      } else {
        setResult(data);
        toast.success('Bulk import successful');
      }
    } catch (err: any) {
      setError('Network or server error');
      toast.error('Network or server error');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/api/bulk/template', '_blank');
  };

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Bulk Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Import Type</label>
          <Select value={importType} onValueChange={v => setImportType(v as any)} disabled={uploading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={downloadTemplate} variant="outline" className="mb-2">Download CSV Template</Button>
        <FileDropzone
          onFileAccepted={handleFileAccepted}
          accept={[".csv", ".json"]}
          disabled={uploading}
          label="Upload CSV or JSON file"
        />
        {uploading && <div className="text-blue-600">Uploading...</div>}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <div className="mt-4">
            {result.message && <div className="text-green-700 font-semibold">{result.message}</div>}
            {result.errors && result.errors.length > 0 && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc ml-6">
                    {result.errors.map((err: string, i: number) => <li key={i}>{err}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            {result.inserted && result.inserted.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold">Inserted:</div>
                <ul className="list-disc ml-6">
                  {result.inserted.map((p: any) => (
                    <li key={p.id || p.email || p.slug}>{p.name || p.email || p.slug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
              
    