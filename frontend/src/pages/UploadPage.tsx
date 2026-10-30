import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  FileCheck
} from 'lucide-react';
import { api } from '../services/apiClient';
import { DatasetItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const UploadPage: React.FC = () => {
  const { datasets, refreshDatasets } = useOutletContext<{
    datasets: DatasetItem[];
    refreshDatasets: () => void;
  }>();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<DatasetItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setUploadSuccess(null);

    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Unsupported file format. Please choose a CSV (.csv) or Excel spreadsheet (.xlsx, .xls).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25 MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const newDataset = await api.uploadDataset(selectedFile);
      setUploadSuccess(newDataset);
      refreshDatasets();
      // Redirect to preview after 1 second
      setTimeout(() => {
        navigate(`/app/datasets/${newDataset.id}`);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed. Please check the file formatting.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    navigate(`/app/datasets/${sampleId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Upload & Explore Data</h1>
        <p className="text-xs text-text-muted mt-1">
          Import your CSV or Excel file for automated quality profiling, statistical testing, and AI analysis.
        </p>
      </div>

      {/* Main Upload Zone */}
      <Card>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-card p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-blue-50/50 scale-[1.01]'
              : 'border-border hover:border-blue-300 hover:bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-surface-soft text-primary flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-text-main mb-1">
            {selectedFile ? selectedFile.name : 'Choose a file or drag & drop it here'}
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
            Supported formats: <strong>CSV</strong>, <strong>XLSX</strong>, <strong>XLS</strong> up to 25 MB.
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Local Files
          </Button>
        </div>

        {/* Selected file confirmation & Upload trigger */}
        {selectedFile && (
          <div className="mt-5 p-4 bg-slate-50 border border-border rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs font-semibold text-text-main">{selectedFile.name}</p>
                <p className="text-[11px] text-text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button
              onClick={handleUpload}
              isLoading={isUploading}
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Start Analysis
            </Button>
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification */}
        {uploadSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Upload successful! Redirecting to data profile...</span>
          </div>
        )}
      </Card>

      {/* Pre-Packaged Sample Datasets Picker */}
      <Card
        title="Or Choose a Sample Dataset"
        subtitle="Pre-loaded realistic datasets for instant testing and demonstration without uploading"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datasets.filter(d => d.isSample).map(sample => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              className="p-4 border border-border rounded-xl hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary" size="sm">Sample</Badge>
                  <span className="text-[11px] text-text-muted font-mono">
                    {sample.profile?.rowCount || 25} rows
                  </span>
                </div>
                <h4 className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">
                  {sample.name}
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  {sample.description || 'Pre-configured domain dataset with structured columns and KPIs.'}
                </p>
              </div>

              <div className="pt-4 flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>Explore Dataset</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
