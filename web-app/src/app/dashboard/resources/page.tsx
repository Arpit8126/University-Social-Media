'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  ShieldCheck,
  MoreVertical,
  BookOpen,
  History,
  FileBadge
} from 'lucide-react';

const categories = [
  { id: 'ALL', label: 'All Resources', icon: BookOpen },
  { id: 'NOTES', label: 'Lecture Notes', icon: FileText },
  { id: 'PYQ', label: 'Previous Year Papers', icon: History },
  { id: 'ASSIGNMENT', label: 'Assignments', icon: FileBadge },
];

const sampleResources = [
  { 
    id: 1, 
    title: 'Operating Systems - Semester 4', 
    desc: 'Comprehensive notes covering CPU scheduling, Memory Management, and Deadlocks.', 
    uploader: 'Arpit Pandey',
    type: 'NOTES',
    size: '2.4 MB',
    downloads: 142,
    is_verified: true
  },
  { 
    id: 2, 
    title: 'Data Structures PYQ 2024', 
    desc: 'GLA University official end-term question paper for CS-DS.', 
    uploader: 'Sameer Garg',
    type: 'PYQ',
    size: '1.1 MB',
    downloads: 850,
    is_verified: true
  },
];

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-tight">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Resource Center</h1>
          <p className="text-muted-foreground italic lowercase font-medium">Verify university notes and previous year papers.</p>
        </div>
        
        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 transition-all border border-white/10 group">
          <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Share Resource
        </button>
      </div>

      {/* Stats & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by subject name or code (e.g., BCS-401)..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="md:col-span-4 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Department: Computer Science</span>
        </div>
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
      <div className="grid grid-cols-1 gap-6">
        {sampleResources.map((res) => (
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
              <p className="text-sm text-muted-foreground/80 lowercase italic font-medium">{res.desc}</p>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider pt-2">
                <span>By {res.uploader}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{res.size}</span>
                <span className="w-1 h-1 bg-white/20 rounded-full" />
                <span>{res.downloads} downloads</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all group">
                <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
              </button>
              <button className="bg-primary text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 border border-white/10">
                View PDF
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
