'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import { FileText, Zap, Shield, Clock } from 'lucide-react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !hasAcceptedTerms) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Redirect to the invoice detail page
      router.push(`/invoices/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Invoice Analyzer
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/auth" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Extract Invoice Data with AI
          </h2>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Upload Invoice Image
          </h3>
          
          <FileUpload
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveFile}
            selectedFile={selectedFile}
            isUploading={isUploading}
            error={error}
          />

          {/* Upload Button */}
          {selectedFile && (
            <div className="mt-4 space-y-4">
              {/* Terms Acceptance */}
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-red-800 dark:text-red-200 cursor-pointer">
                    <span className="font-medium">I understand and accept that:</span>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• This is a demo project not intended for real business use</li>
                      <li>• My data will be automatically deleted after 24 hours</li>
                      <li>• I should not upload confidential or sensitive documents</li>
                      <li>• This tool is for testing purposes only</li>
                    </ul>
                  </label>
                </div>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={isUploading || !hasAcceptedTerms}
                className={
                  `w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    isUploading || !hasAcceptedTerms
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
                  } text-white`
                }
              >
                {isUploading ? 'Processing Invoice...' : hasAcceptedTerms ? 'Analyze Invoice' : 'Accept Terms to Continue'}
              </button>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="space-y-6">
          {/* How it works */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              How it works
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              This tool uses Google's Gemini AI to automatically extract structured data from invoice images including:
            </p>
            <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1 ml-4">
              <li>• Company and customer information</li>
              <li>• Invoice numbers, dates, and payment terms</li>
              <li>• Line items with quantities and prices</li>
              <li>• Tax calculations and totals</li>
              <li>• Additional notes and signatures</li>
            </ul>
          </div>

          {/* Data handling */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Data handling & automatic cleanup
            </h3>
            <div className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
              <p><strong>What we store:</strong> Extracted invoice data, original images (securely), and your account information.</p>
              <p><strong>Security:</strong> All data is stored in Supabase with row-level security. Images are stored privately with temporary access URLs.</p>
              <p><strong>Access:</strong> Only you can access your own invoice data. No data is shared with third parties.</p>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3 mt-3">
                <p className="text-blue-800 dark:text-blue-200 font-medium">🕒 Automatic Data Cleanup:</p>
                <ul className="text-blue-700 dark:text-blue-300 text-xs mt-1 space-y-1">
                  <li>• <strong>All users:</strong> All data automatically deleted after 24 hours</li>
                  <li>• This ensures your privacy and keeps the demo clean</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo warning */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="font-medium text-red-900 dark:text-red-100 mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              ⚠️ Demo Project Information
            </h3>
            <div className="text-red-800 dark:text-red-200 text-sm space-y-2">
              <p>This application is built for demonstration and educational purposes. It showcases AI-powered document processing capabilities using Google's Gemini API.</p>
              <p><strong>Technical stack:</strong> Next.js, Supabase, TypeScript, Tailwind CSS, and Google Gemini AI.</p>
              <p><strong>Source code:</strong> Available for learning and reference purposes.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
