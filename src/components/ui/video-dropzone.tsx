import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { X, Upload, Video, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoFile {
  imageUrl: string;
  originalName: string;
  file?: File;
}

interface VideoDropzoneProps {
  onUpload: (files: File[]) => Promise<VideoFile[]>;
  maxFiles?: number;
  multiple?: boolean;
  folder?: string;
  existingVideos?: VideoFile[];
  onRemove?: (index: number) => void;
  className?: string;
  acceptedFormats?: string[];
  maxSize?: number; // in MB
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  onUpload,
  maxFiles = 1,
  multiple = false,
  folder = 'videos',
  existingVideos = [],
  onRemove,
  className,
  acceptedFormats = ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
  maxSize = 100, // 100MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>(existingVideos);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      const results = await onUpload(acceptedFiles);
      setUploadedVideos(prev => [...prev, ...results]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'video/*': acceptedFormats
    },
    maxFiles,
    multiple,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
  });

  const handleRemove = (index: number) => {
    setUploadedVideos(prev => prev.filter((_, i) => i !== index));
    if (onRemove) {
      onRemove(index);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-red-500 bg-red-50',
          !isDragActive && 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-600">Uploading video...</p>
            </>
          ) : (
            <>
              <Video className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isDragActive ? 'Drop videos here' : 'Drag & drop videos here'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or click to select files
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: {acceptedFormats.join(', ')} (max {maxSize}MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Videos */}
      {uploadedVideos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Videos</h4>
          <div className="grid gap-3">
            {uploadedVideos.map((video, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Play className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {video.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {video.file && formatFileSize(video.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {isDragReject && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          Some files were rejected. Please check the file format and size.
        </div>
      )}
    </div>
  );
};
