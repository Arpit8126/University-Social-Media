'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck,
  BookOpen,
  History,
  FileBadge,
  Loader2,
  X
} from 'lucide-react';
import type { Resource } from '@/lib/types';

const categories = [
  { id: 'ALL', label: 'All Resources', icon: BookOpen },
  { id: 'NOTES', label: 'Lecture Notes', icon: FileText },
  { id: 'PYQ', label: 'Previous Year Papers', icon: History },
  { id: 'ASSIGNMENT', label: 'Assignments', icon: FileBadge },
];

export default function ResourcesPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', category: 'NOTES' as Resource['category'], subject: '', semester: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchResources = useCallback(async () => {
    let query = supabase
      .from('resources')
      .select('*, profiles(full_name, username)')
      .order('created_at', { ascending: false });

    if (activeCategory !== 'ALL') {
      query = query.eq('category', activeCategory);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching resources:', error);
    if (data) setResources(data as Resource[]);
    setIsLoading(false);
  }, [activeCategory]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.title.trim() || !user) return;
    setIsUploading(true);

    const ext = uploadFile.name.split('.').pop();
    const path = `resources/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('campus-media')
      .upload(path, uploadFile);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('campus-media').getPublicUrl(path);

    const fileSizeMB = (uploadFile.size / (1024 * 1024)).toFixed(1);

    const { error: insertError } = await supabase.from('resources').insert({
      title: uploadData.title.trim(),
      description: uploadData.description.trim(),
      category: uploadData.category,
      file_url: publicUrl,
      file_name: uploadFile.name,
      file_size: `${fileSizeMB} MB`,
      uploaded_by: user.id,
      subject: uploadData.subject.trim() || null,
      semester: uploadData.semester.trim() || null,
    });

    if (!insertError) {
      setShowUpload(false);
      setUploadData({ title: '', description: '', category: 'NOTES', subject: '', semester: '' });
      setUploadFile(null);
      fetchResources();
    }
    setIsUploading(false);
  };

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.subject && r.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground italic font-medium">Share and discover university notes and papers.</p>
        </div>
        
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 transition-all border border-white/10 group"
        >
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Share Resource
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by subject name or title..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${
              activeCategory === cat.id 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground italic">No resources found. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((res) => (
            <motion.div 
              key={res.id}
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col md:flex-row md:items-center gap-6 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -z-10 group-hover:bg-primary/10 transition-all" />
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center border border-white/5">
                <FileText className="w-8 h-8 text-primary" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{res.title}</h3>
                  {res.is_verified && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[10px] font-black tracking-widest uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                {res.description && (
                  <p className="text-sm text-muted-foreground/80 italic font-medium">{res.description}</p>
                )}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider pt-2">
                  <span>By {res.profiles?.full_name || 'Unknown'}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>{res.file_size || 'N/A'}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>{res.downloads} downloads</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all group"
                >
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                </a>
                <a
                  href={res.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 border border-white/10"
                >
                  View File
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Upload Resource</h2>
              <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              <textarea placeholder="Description (optional)" value={uploadData.description} onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Subject" value={uploadData.subject} onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                <input type="text" placeholder="Semester" value={uploadData.semester} onChange={(e) => setUploadData({ ...uploadData, semester: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex gap-2">
                {(['NOTES', 'PYQ', 'ASSIGNMENT'] as const).map((cat) => (
                  <button key={cat} onClick={() => setUploadData({ ...uploadData, category: cat })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${uploadData.category === cat ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <label className="block w-full p-4 rounded-xl border-2 border-dashed border-white/10 text-center cursor-pointer hover:border-primary/30 transition-all">
                <input type="file" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                <p className="text-sm text-muted-foreground">{uploadFile ? uploadFile.name : 'Click to select a file'}</p>
              </label>
              <button onClick={handleUpload} disabled={!uploadFile || !uploadData.title.trim() || isUploading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Resource
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
