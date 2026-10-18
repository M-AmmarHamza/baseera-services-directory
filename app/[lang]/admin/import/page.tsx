'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Database,
  Layers,
  MapPin,
  Trash2,
} from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '@/lib/db';

interface FailedRow {
  rowNumber: number;
  name: string;
  reason: string;
}

interface ImportResponse {
  success: boolean;
  totalRows: number;
  importedCount: number;
  failedCount: number;
  failedRows: FailedRow[];
  statusApplied?: string;
  message?: string;
}

export default function AdminImportPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || 'en';

  const [file, setFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [parsedPreviewRows, setParsedPreviewRows] = useState<any[]>([]);
  const [totalParsedRows, setTotalParsedRows] = useState<number>(0);
  const [parseError, setParseError] = useState<string>('');

  // Dropzone drag-state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuration
  const [defaultStatus, setDefaultStatus] = useState<'approved' | 'pending' | 'suspended'>('approved');

  // Submission & Results
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [generalError, setGeneralError] = useState<string>('');

  // Handle file selection and parse preview using PapaParse
  const processFile = (selectedFile: File) => {
    setParseError('');
    setGeneralError('');
    setImportResult(null);

    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      setParseError('Please upload a valid .csv file format.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvRawText(content);

      // Parse with PapaParse for client-side preview
      Papa.parse(content, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            console.warn('PapaParse warnings:', results.errors);
          }
          const rows = results.data as any[];
          setTotalParsedRows(rows.length);
          // Keep top 5 rows for immediate preview
          setParsedPreviewRows(rows.slice(0, 5));
        },
        error: (err) => {
          setParseError(`CSV Parsing error: ${err.message}`);
        },
      });
    };

    reader.onerror = () => {
      setParseError('Failed to read file contents. Please try again.');
    };

    reader.readAsText(selectedFile, 'utf-8');
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const clearFile = () => {
    setFile(null);
    setCsvRawText('');
    setParsedPreviewRows([]);
    setTotalParsedRows(0);
    setParseError('');
    setImportResult(null);
    setGeneralError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download official CSV template
  const downloadTemplate = () => {
    const templateContent = [
      'fullName,whatsappNumber,categorySlug,citySlug,countrySlug,tradeTitle,shortBio,profileType,startingPrice,serviceArea',
      'Muhammad Tariq,+923001234567,electrician,karachi,pk,Master Residential & Solar Electrician,15+ years experience in domestic and commercial electrical repairs.,individual,800,"PECHS, Clifton, DHA"',
      'Ahmed Al-Mansoor,+971501234567,ac-technician,dubai,ae,Certified Chiller & Inverter AC Specialist,24/7 emergency central and split AC repair across Dubai.,shop,150,"Deira, Downtown Dubai, Business Bay"',
      'Rashid Khan,+966501234567,plumber,riyadh,sa,Emergency Plumbing & Leak Detection Specialist,Residential sanitary fittings water pumps and drainage clearing.,individual,100,"Al-Olaya, Al-Malaz, Al-Sulaimaniyah"',
      'Carlos Mendez,+525512345678,carpenter,mexico-city,mx,Maestro Carpintero & Modular Furniture,Custom kitchen cabinets solid wood doors and interior finishes.,individual,350,"Roma Norte, Condesa, Polanco"',
      'Lucas Silva,+5511987654321,painter,sao-paulo,br,Pintor Profissional & Texturas Decorativas,Residential and commercial painting damp-proofing and decorative textures.,individual,200,"Pinheiros, Vila Madalena, Jardins"',
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'baseera_providers_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit bulk import to API
  const handleImportSubmit = async () => {
    if (!csvRawText.trim() || totalParsedRows === 0) {
      setGeneralError('Please upload a valid CSV with at least one data row.');
      return;
    }

    setIsUploading(true);
    setGeneralError('');
    setImportResult(null);

    try {
      const res = await fetch('/api/admin/providers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent: csvRawText,
          defaultStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setImportResult(data);
      } else {
        setGeneralError(data.error || 'Failed to complete bulk import. Please check file formatting.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Network error occurred during bulk import.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href={`/${lang}/admin`} className="hover:text-emerald-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${lang}/admin/providers`} className="hover:text-emerald-700 transition-colors">
          Providers
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-semibold">Bulk Import CSV</span>
      </div>

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
            <UploadCloud className="w-6 h-6 text-[#006948]" />
            <span>Bulk CSV Provider Import</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Import hundreds of verified local specialists at once. Valid rows are batch-inserted directly into the directory database with custom initial approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200/90 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-[#006948]" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Relational Schema Guidance Info Card */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-[#006948] shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-gray-600 leading-relaxed flex-1">
            <p className="font-bold text-gray-900 text-sm">
              Relational Integrity Requirements
            </p>
            <p>
              To maintain database consistency, ensure your CSV columns exactly match these specifications:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200/70">
                <span className="font-bold text-gray-900 block mb-0.5">1. Mandatory Columns</span>
                <code className="text-[11px] text-[#006948] font-semibold break-all">
                  fullName, whatsappNumber, categorySlug, citySlug, countrySlug
                </code>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200/70">
                <span className="font-bold text-gray-900 block mb-0.5">2. WhatsApp Format</span>
                <span className="text-[11px] text-gray-600">
                  Must be E.164 international standard with country code (e.g. <code className="text-[#006948] font-bold">+923001234567</code> or <code className="text-[#006948] font-bold">+971501234567</code>).
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200/70">
                <span className="font-bold text-gray-900 block mb-0.5">3. Slugs Integrity</span>
                <span className="text-[11px] text-gray-600">
                  <code className="text-[#006948] font-semibold">categorySlug</code> and <code className="text-[#006948] font-semibold">citySlug</code> must match existing slugs in Baseera database.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Drag & Drop Card */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        
        {/* Dropzone Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!file) fileInputRef.current?.click();
          }}
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-100 scale-[1.01]'
              : file
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-gray-300 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#006948] flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • {totalParsedRows} rows parsed
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 transition-colors inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center">
                <UploadCloud className="w-7 h-7 text-[#006948]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isDragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or <span className="text-[#006948] font-bold underline">browse from your computer</span>
                </p>
              </div>
              <span className="text-[11px] text-gray-400 mt-1">
                Supports .CSV formatted files up to 15MB
              </span>
            </div>
          )}
        </div>

        {parseError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {generalError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Configuration Options */}
        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Default Approval Status
            </label>
            <p className="text-xs text-gray-500">
              Select the initial status applied to all valid imported providers.
            </p>
          </div>

          <select
            value={defaultStatus}
            onChange={(e) => setDefaultStatus(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#006948] cursor-pointer"
          >
            <option value="approved">Approved (Instant Live Public Listing)</option>
            <option value="pending">Pending (Held for Moderator Review)</option>
            <option value="suspended">Suspended (Hidden from Public)</option>
          </select>
        </div>

        {/* Parsed Preview Table (Top 5 Rows) */}
        {parsedPreviewRows.length > 0 && (
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                File Preview ({Math.min(5, parsedPreviewRows.length)} of {totalParsedRows} rows)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Ready for Batch Upload
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50/90 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-3.5 py-2">Full Name</th>
                    <th className="px-3.5 py-2">WhatsApp</th>
                    <th className="px-3.5 py-2">Category</th>
                    <th className="px-3.5 py-2">City</th>
                    <th className="px-3.5 py-2">Country</th>
                    <th className="px-3.5 py-2">Headline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {parsedPreviewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-3.5 py-2 font-semibold text-gray-900 whitespace-nowrap">
                        {row.fullName || row.full_name || row.name || '—'}
                      </td>
                      <td className="px-3.5 py-2 font-mono whitespace-nowrap">
                        {row.whatsappNumber || row.whatsapp_number || row.phone || '—'}
                      </td>
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[11px]">
                          {row.categorySlug || row.category_slug || row.category || '—'}
                        </span>
                      </td>
                      <td className="px-3.5 py-2 capitalize whitespace-nowrap">
                        {row.citySlug || row.city_slug || row.city || '—'}
                      </td>
                      <td className="px-3.5 py-2 uppercase font-bold text-gray-500 whitespace-nowrap">
                        {row.countrySlug || row.country_slug || row.country || '—'}
                      </td>
                      <td className="px-3.5 py-2 text-gray-500 truncate max-w-xs">
                        {row.tradeTitle || row.trade_title || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
          <Link
            href={`/${lang}/admin/providers`}
            className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={!file || totalParsedRows === 0 || isUploading}
            onClick={handleImportSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Bulk Import...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Import {totalParsedRows > 0 ? `${totalParsedRows} Providers` : 'CSV'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Detailed Import Results Report */}
      {importResult && (
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                importResult.failedCount === 0
                  ? 'bg-emerald-100 text-[#006948]'
                  : importResult.importedCount > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                {importResult.failedCount === 0 ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Bulk Import Report
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied Status: <span className="font-bold uppercase text-[#006948]">{importResult.statusApplied || defaultStatus}</span>
                </p>
              </div>
            </div>

            <Link
              href={`/${lang}/admin/providers`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <span>View Providers in Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
              <span className="text-xs text-gray-500 font-semibold block mb-1">Total Processed</span>
              <span className="text-2xl font-extrabold text-gray-900">{importResult.totalRows}</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">rows in CSV file</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block mb-1">Successfully Imported</span>
              <span className="text-2xl font-extrabold text-emerald-900">{importResult.importedCount}</span>
              <span className="text-[11px] text-emerald-700 block mt-0.5">active in directory</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              importResult.failedCount > 0
                ? 'bg-rose-50 border-rose-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`text-xs font-semibold block mb-1 ${
                importResult.failedCount > 0 ? 'text-rose-800' : 'text-gray-500'
              }`}>
                Skipped / Failed
              </span>
              <span className={`text-2xl font-extrabold ${
                importResult.failedCount > 0 ? 'text-rose-900' : 'text-gray-700'
              }`}>
                {importResult.failedCount}
              </span>
              <span className={`text-[11px] block mt-0.5 ${
                importResult.failedCount > 0 ? 'text-rose-700 font-medium' : 'text-gray-400'
              }`}>
                failed validation checks
              </span>
            </div>
          </div>

          {/* Failed Rows Breakdown Table */}
          {importResult.failedRows && importResult.failedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Validation Failures ({importResult.failedRows.length} rows skipped)
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                The valid rows above were successfully imported. Review the errors below to fix and re-import only the failed rows:
              </p>

              <div className="max-h-72 overflow-y-auto rounded-xl border border-rose-200 bg-rose-50/20">
                <table className="w-full text-xs text-left">
                  <thead className="bg-rose-50 text-rose-900 font-bold border-b border-rose-200 sticky top-0">
                    <tr>
                      <th className="px-3.5 py-2 w-16">Row #</th>
                      <th className="px-3.5 py-2 w-48">Provider Identifier</th>
                      <th className="px-3.5 py-2">Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 text-gray-800">
                    {importResult.failedRows.map((fail, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/50">
                        <td className="px-3.5 py-2 font-mono font-bold text-gray-700">
                          {fail.rowNumber}
                        </td>
                        <td className="px-3.5 py-2 font-semibold text-gray-900 whitespace-nowrap">
                          {fail.name}
                        </td>
                        <td className="px-3.5 py-2 text-rose-700 font-medium leading-relaxed">
                          {fail.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={clearFile}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
            >
              Import Another CSV File
            </button>
            <Link
              href={`/${lang}/admin/providers`}
              className="text-xs font-semibold text-[#006948] hover:underline"
            >
              Go to Provider Moderation Panel →
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
