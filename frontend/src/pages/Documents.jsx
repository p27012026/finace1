import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Bank Statement');
  const [uploading, setUploading] = useState(false);
  const [uploadRes, setUploadRes] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('/api/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadRes(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_category', category);

    try {
      const res = await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadRes(res.data);
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Document Upload & AI Scanner Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload Bank Statements, Salary Slips, Tax Documents, or Insurance Policies (PDF, CSV, Excel, Images).
          Gemini AI automatically extracts financial entities and updates your dashboard!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">Upload Document</h3>
          <form onSubmit={handleUpload} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Document Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {['Bank Statement', 'Salary Slip', 'Credit Card Statement', 'Loan Document', 'Insurance Policy', 'Tax Document', 'Investment Statement'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-800/40">
              <input
                type="file"
                required
                accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-indigo-400 animate-bounce" />
                <span className="text-xs font-semibold text-slate-200">
                  {file ? file.name : 'Click to browse file'}
                </span>
                <span className="text-[10px] text-slate-400">PDF, CSV, Excel, PNG, JPG (Max 25MB)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>OCR Extraction Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Scan & Process via AI</span>
                </>
              )}
            </button>
          </form>

          {/* Upload Results Box */}
          {uploadRes && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Extracted Successfully!</span>
              </div>
              <p className="text-[11px] leading-snug">{uploadRes.extracted_summary}</p>
            </div>
          )}
        </div>

        {/* Processed Documents List */}
        <div className="glass-panel p-5 lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-700/40 pb-3">
            Processed Document Repository ({documents.length})
          </h3>
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold uppercase text-[10px]">
                      {doc.file_type}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-200">{doc.filename}</h4>
                      <p className="text-[10px] text-slate-400">{doc.doc_category} • {new Date(doc.upload_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Parsed & Stored
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
