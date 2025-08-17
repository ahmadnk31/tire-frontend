import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  accept?: string[];
  disabled?: boolean;
  className?: string;
  label?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileAccepted,
  accept = ['.csv', '.json'],
  disabled = false,
  className = '',
  label = 'Upload CSV or JSON file',
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, ext) => {
      if (ext === '.csv') acc['text/csv'] = ['.csv'];
      if (ext === '.json') acc['application/json'] = ['.json'];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: false,
    disabled,
  });

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop file here' : label}
              </p>
              <p className="text-muted-foreground mb-4">
                Drag and drop or click to select a CSV or JSON file
              </p>
              <Button variant="outline" disabled={disabled}>
                {disabled ? 'Uploading...' : 'Choose File'}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>CSV or JSON up to 5MB</p>
            </div>
          </div>
        </div>
        {/* Accepted file preview */}
        {acceptedFiles.length > 0 && (
          <div className="mt-4 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm">{acceptedFiles[0].name}</span>
            <Button size="icon" variant="ghost" onClick={() => window.location.reload()}><X className="h-4 w-4" /></Button>
          </div>
        )}
        {/* File rejection */}
        {fileRejections.length > 0 && (
          <div className="mt-4 text-red-600 text-sm">
            {fileRejections[0].file.name}: {fileRejections[0].errors.map(e => e.message).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
