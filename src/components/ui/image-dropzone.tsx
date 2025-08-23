import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  file: File;
  preview: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface ImageDropzoneProps {
  onUpload: (files: File[]) => Promise<{ imageUrl: string; originalName: string }[]>;
  onRemove?: (index: number) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
  folder?: string;
  existingImages?: { imageUrl: string; altText?: string }[];
  className?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  folder = 'products',
  existingImages = [],
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    // Validate file count
    const totalFiles = uploadedFiles.length + existingImages.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed. You have ${uploadedFiles.length + existingImages.length} files already.`,
        variant: "destructive",
      });
      return;
    }

    // Create file objects with preview
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    try {
      // Simulate progress for each file
      newFiles.forEach((_, index) => {
        const fileIndex = uploadedFiles.length + index;
        const interval = setInterval(() => {
          setUploadedFiles(prev => {
            const updated = [...prev];
            if (updated[fileIndex] && updated[fileIndex].progress < 90) {
              updated[fileIndex].progress += 10;
            }
            return updated;
          });
        }, 200);

        setTimeout(() => clearInterval(interval), 1800);
      });

      // Upload files
      const uploadResults = await onUpload(acceptedFiles);

      // Update files with success status
      setUploadedFiles(prev => {
        const updated = [...prev];
        uploadResults.forEach((result, index) => {
          const fileIndex = prev.length - acceptedFiles.length + index;
          if (updated[fileIndex]) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'success',
              progress: 100,
              url: result.imageUrl
            };
          }
        });
        return updated;
      });

      toast({
        title: "Upload successful",
        description: `${uploadResults.length} file(s) uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update files with error status
      setUploadedFiles(prev => {
        const updated = [...prev];
        newFiles.forEach((_, index) => {
          const fileIndex = prev.length - acceptedFiles.length + index;
          if (updated[fileIndex]) {
            updated[fileIndex] = {
              ...updated[fileIndex],
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed'
            };
          }
        });
        return updated;
      });

      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, existingImages, maxFiles, onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.heic', '.heif', '.avif']
    },
    maxSize,
    multiple,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    
    if (onRemove) {
      onRemove(index);
    }
  };

  const retryUpload = async (index: number) => {
    const file = uploadedFiles[index];
    if (!file || file.status !== 'error') return;

    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: 'uploading',
        progress: 0,
        error: undefined
      };
      return updated;
    });

    try {
      const result = await onUpload([file.file]);
      setUploadedFiles(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'success',
          progress: 100,
          url: result[0].imageUrl
        };
        return updated;
      });

      toast({
        title: "Upload successful",
        description: "File uploaded successfully.",
      });
    } catch (error) {
      setUploadedFiles(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: 'error',
          progress: 0,
          error: error instanceof Error ? error.message : 'Upload failed'
        };
        return updated;
      });

      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalFiles = uploadedFiles.length + existingImages.length;
  const successfulUploads = uploadedFiles.filter(f => f.status === 'success').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
              ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload product images'}
                </p>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here or click to browse
                </p>
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>PNG, JPG, GIF, WebP up to {Math.round(maxSize / (1024 * 1024))}MB each</p>
                <p>Maximum {maxFiles} files • {totalFiles}/{maxFiles} files uploaded</p>
              </div>
            </div>
          </div>

          {/* File Rejections */}
          {fileRejections.length > 0 && (
            <div className="mt-4 space-y-2">
              {fileRejections.map(({ file, errors }, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{file.name}:</span>
                  <span>{errors.map(e => e.message).join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Existing Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {existingImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge className="absolute top-2 left-2 bg-green-500">
                  Existing
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Uploaded Files ({successfulUploads}/{uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Status Badge */}
                <Badge 
                  className={`absolute top-2 left-2 ${
                    file.status === 'success' ? 'bg-green-500' :
                    file.status === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                >
                  {file.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {file.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {file.status === 'uploading' && <Upload className="h-3 w-3 mr-1" />}
                  {file.status === 'success' ? 'Uploaded' :
                   file.status === 'error' ? 'Failed' :
                   'Uploading'}
                </Badge>

                {/* Remove Button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <Progress value={file.progress} className="h-1" />
                  </div>
                )}

                {/* Error Message & Retry */}
                {file.status === 'error' && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2">
                    <p className="text-white text-xs text-center mb-2">{file.error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retryUpload(index)}
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2">
                  <p className="text-xs truncate">{file.file.name}</p>
                  <p className="text-xs text-gray-300">
                    {(file.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
