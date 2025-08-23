import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const UploadDiagnostics: React.FC = () => {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsTesting(true);
    setResults(null);

    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
          apiUrl: import.meta.env.VITE_API_URL || '/api',
          nodeEnv: import.meta.env.NODE_ENV,
          isProduction: import.meta.env.PROD,
        },
        tests: {} as any
      };

      // Test 1: S3 Connection
      try {
        console.log('🔧 Testing S3 connection...');
        const s3Test = await uploadApi.testConnection();
        diagnostics.tests.s3Connection = {
          success: true,
          data: s3Test
        };
      } catch (error) {
        diagnostics.tests.s3Connection = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 2: Presigned URL
      try {
        console.log('🔧 Testing presigned URL generation...');
        const presignedTest = await uploadApi.getPresignedUrl('test-file.jpg', 'test');
        diagnostics.tests.presignedUrl = {
          success: true,
          data: presignedTest
        };
      } catch (error) {
        diagnostics.tests.presignedUrl = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Test 3: File Upload (if file selected)
      if (testFile) {
        try {
          console.log('🔧 Testing file upload...');
          const uploadTest = await uploadApi.single(testFile, 'test');
          diagnostics.tests.fileUpload = {
            success: true,
            data: uploadTest
          };
        } catch (error) {
          diagnostics.tests.fileUpload = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      setResults(diagnostics);
      
      toast({
        title: 'Diagnostics Complete',
        description: 'Check the results below for any issues.',
      });

    } catch (error) {
      console.error('Diagnostics failed:', error);
      toast({
        title: 'Diagnostics Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setTestFile(file || null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-file">Test File (Optional)</Label>
          <Input
            id="test-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isTesting}
          />
        </div>

        <Button 
          onClick={runDiagnostics} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>

        {results && (
          <div className="space-y-4">
            <h3 className="font-semibold">Diagnostic Results</h3>
            
            <div className="space-y-2">
              <h4 className="font-medium">Environment</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(results.environment, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Tests</h4>
              {Object.entries(results.tests).map(([testName, testResult]: [string, any]) => (
                <div key={testName} className="border rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${testResult.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  {testResult.success ? (
                    <pre className="text-xs mt-1 text-green-700">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  ) : (
                    <pre className="text-xs mt-1 text-red-700">
                      {testResult.error}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Raw Results</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
