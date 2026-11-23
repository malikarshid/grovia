'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminSupplierImportsPage() {
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [inputJson, setInputJson] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sampleJsonTemplate = `[
  {
    "name": "Tata Sampann Chana Dal (Unpolished)",
    "sku": "TATA-CDAL-1KG",
    "departmentSlug": "atta-rice-dal",
    "categorySlug": "staples-grains",
    "brandSlug": "tata-sampann",
    "price": 135,
    "mrp": 155,
    "unit": "1 kg",
    "weight": 1.0,
    "stock": 100,
    "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    "variants": [
      { "title": "500 g", "sku": "TATA-CDAL-500G", "price": 72, "mrp": 82, "stock": 80 },
      { "title": "1 kg", "sku": "TATA-CDAL-1KG-V", "price": 135, "mrp": 155, "stock": 100, "isDefault": true }
    ]
  },
  {
    "name": "Amul Pure Cow Ghee Tin",
    "sku": "AMUL-GHEE-1L",
    "departmentSlug": "dairy-bread-eggs",
    "categorySlug": "dairy-eggs",
    "brandSlug": "amul",
    "price": 610,
    "mrp": 650,
    "unit": "1 Litre",
    "weight": 1.0,
    "stock": 60,
    "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80"
  }
]`;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/catalog/import');
      const data = await res.json();
      setImportHistory(data.imports || []);
    } catch (e) {
      console.error('Failed to load imports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    setInputJson(sampleJsonTemplate);
  }, []);

  const handleExecuteImport = async () => {
    try {
      const parsed = JSON.parse(inputJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setStatusMsg({ type: 'error', text: 'Input must be a non-empty JSON array of product objects' });
        return;
      }

      setImporting(true);
      setStatusMsg(null);

      const res = await fetch('/api/admin/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsed,
          fileName: `marketplace-batch-${new Date().toISOString().slice(0, 10)}.json`,
          format: 'JSON',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: `Batch processed: ${data.successRows} successfully imported, ${data.failedRows} failed.`,
        });
        loadHistory();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Import failed.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: `Invalid JSON syntax: ${err.message}` });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-blue-100 text-blue-700">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Marketplace Catalogue & Supplier Batch Importer
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Bulk ingest thousands of products, variants, and wholesale supplier inventories via JSON / CSV payloads.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Editor & Execution Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Batch Product Payload (JSON Format)
          </span>
          <button
            onClick={() => setInputJson(sampleJsonTemplate)}
            className="text-xs font-bold text-[#2E7D32] hover:underline"
          >
            Load Sample Template
          </button>
        </div>

        <textarea
          rows={12}
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          className="w-full p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 font-mono text-xs outline-none focus:border-[#2E7D32] text-gray-800 dark:text-gray-200 leading-relaxed"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={importing || !inputJson.trim()}
            className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{importing ? 'Processing Batch...' : 'Execute Catalogue Import'}</span>
          </button>
        </div>
      </div>

      {/* Import History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            Past Batch Ingestion Logs
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Batch File Name</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Total Rows</th>
                <th className="py-3 px-4">Success</th>
                <th className="py-3 px-4">Failed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Imported At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading logs...
                  </td>
                </tr>
              ) : importHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No batch imports logged yet.
                  </td>
                </tr>
              ) : (
                importHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      {item.fileName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-600 dark:text-gray-300">
                        {item.format}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{item.totalRows}</td>
                    <td className="py-3 px-4 text-green-600 font-bold">{item.successRows}</td>
                    <td className="py-3 px-4 text-red-500 font-bold">{item.failedRows}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'COMPLETED'
                            ? 'bg-green-100 text-[#2E7D32]'
                            : item.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
