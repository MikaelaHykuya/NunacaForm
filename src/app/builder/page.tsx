'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FormSchema, Question, QuestionType } from '@/types/form';
import { Plus, GripVertical, Trash2, Save, ArrowLeft, Settings2, Layout, Type, CheckSquare, AlignLeft, ToggleLeft, ArrowRight, CornerDownRight, LogOut, Layers, Check, Copy, Eye, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession, logout } from '@/lib/auth';
import { isPublished, setPublished, getCachedSchema, saveSchema as persistSchema } from '@/lib/storage';
import { pullPublished, pullSchema } from '@/lib/supabase';

export default function BuilderPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authName, setAuthName] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'welcome' | 'thankyou'>('welcome');
  const [copied, setCopied] = useState(false);
  const [published, setPublishedState] = useState(true);
  const router = useRouter();

  // Resizable right panel
  const [panelWidth, setPanelWidth] = useState(500);
  const panelWidthRef = useRef(500);
  const [isDragging, setIsDragging] = useState(false);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelWidthRef.current;
    setIsDragging(true);

    const onMove = (ev: MouseEvent) => {
      const newW = Math.min(700, Math.max(300, startW + (startX - ev.clientX)));
      panelWidthRef.current = newW;
      setPanelWidth(newW);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);


  // Multi-Lini Usaha Support
  const businessLines = [
    { id: 'barbershop', name: 'Nunaca Barbershop' },
    { id: 'beauty_bar', name: 'Nunaca Beauty Bar' },
    { id: 'kids_spa', name: 'Nunaca Baby & Kids Spa' },
    { id: 'coffee', name: 'Nunaca Coffee & Pastry' },
    { id: 'agency', name: 'Nunaca Agency' },
    { id: 'skincare', name: 'Nunaca Skincare' },
    { id: 'travel', name: 'Nunaca Travel' },
    { id: 'butik', name: 'Nunaca Butik' }
  ];
  const [activeWorkspace, setActiveWorkspace] = useState('barbershop');

  const createBlankSchema = (workspaceId: string): FormSchema => ({
    id: `form_${workspaceId}`,
    title: `Form ${workspaceId}`,
    welcomeScreen: { title: 'Halo!', description: 'Selamat datang, silakan mulai mengisi formulir.', buttonText: 'Mulai' },
    questions: [],
    thankYouScreen: { title: 'Terima Kasih!', description: 'Terima kasih telah mengisi formulir kami.' },
  });

  useEffect(() => {
    // Auth Check (Supabase session via PIN)
    let alive = true;
    getSession().then((session) => {
      if (!alive) return;
      if (session?.role !== 'admin') {
        router.push('/admin/login?next=/builder');
        return;
      }
      setAuthName(session.name);
      setIsAuthorized(true);
      setPublishedState(isPublished(activeWorkspace));

      const cached = getCachedSchema(activeWorkspace);
      setSchema(cached ?? createBlankSchema(activeWorkspace));
      setActiveQuestion(null);
      pullSchema(activeWorkspace).then((remote) => {
        if (!alive) return;
        if (remote) {
          setSchema(remote as FormSchema);
          persistSchema(activeWorkspace, remote as FormSchema);
        }
      });
      pullPublished(activeWorkspace).then((distant) => {
        if (!alive) return;
        if (distant !== null) setPublishedState(distant);
      });
    });
    return () => {
      alive = false;
    };
  }, [activeWorkspace, router]);

  if (!isAuthorized) return <div className="min-h-screen bg-[#050505] text-[#FFCC00] flex items-center justify-center font-bold tracking-widest uppercase">Checking Authorization...</div>;
  if (!schema) return <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Loading Workspace...</div>;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(schema.questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSchema({ ...schema, questions: items });
  };

  const saveSchema = () => {
    persistSchema(activeWorkspace, schema);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const copyShareLink = async () => {
    const url = `${window.location.origin}/form?workspace=${activeWorkspace}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Salin link ini:', url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPreview = () => {
    saveSchema();
    window.open(`${window.location.origin}/form?workspace=${activeWorkspace}&preview=1`, '_blank');
  };

  const togglePublish = () => {
    const next = !published;
    setPublished(activeWorkspace, next);
    setPublishedState(next);
    saveSchema();
  };

  const updateWelcome = (updates: Partial<NonNullable<FormSchema['welcomeScreen']>>) => {
    setSchema({
      ...schema,
      welcomeScreen: { ...(schema.welcomeScreen || { title: '', description: '', buttonText: 'Mulai' }), ...updates },
    });
  };

  const updateThankYou = (updates: Partial<NonNullable<FormSchema['thankYouScreen']>>) => {
    setSchema({
      ...schema,
      thankYouScreen: { ...(schema.thankYouScreen || { title: '', description: '' }), ...updates },
    });
  };

  const addQuestion = () => {
    const newQ: Question = {
      id: `q_${Date.now()}`,
      type: 'short_text',
      title: '',
      required: true
    };
    setSchema({ ...schema, questions: [...schema.questions, newQ] });
    setActiveQuestion(newQ);
  };

  const deleteQuestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newQs = schema.questions.filter(q => q.id !== id);
    setSchema({ ...schema, questions: newQs });
    if (activeQuestion?.id === id) setActiveQuestion(null);
  };

  const updateActiveQuestion = (updates: Partial<Question>) => {
    if (!activeQuestion) return;
    const updated = { ...activeQuestion, ...updates } as Question;
    setActiveQuestion(updated);
    setSchema({
      ...schema,
      questions: schema.questions.map(q => q.id === updated.id ? updated : q)
    });
  };

  const getAutoShortcut = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'short_text': return <Type size={16} />;
      case 'long_text': return <AlignLeft size={16} />;
      case 'multiple_choice': return <CheckSquare size={16} />;
      case 'yes_no': return <ToggleLeft size={16} />;
      default: return <Layout size={16} />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'short_text': return 'Jawaban Pendek';
      case 'long_text': return 'Paragraf';
      case 'multiple_choice': return 'Pilihan Ganda';
      case 'yes_no': return 'Ya / Tidak';
      default: return type;
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] font-sans text-white flex overflow-hidden selection:bg-[#FFCC00]/30">
      
      {/* COLUMN 1: LEFT SIDEBAR (Question List) */}
      <div className="w-[340px] bg-black/60 backdrop-blur-3xl border-r border-white/10 flex flex-col h-full z-20 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.8)] relative">
        <div className="h-24 border-b border-white/10 flex flex-col justify-center px-6 shrink-0 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-white/40 hover:text-[#FFCC00] flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:-translate-x-1">
              <ArrowLeft size={14} /> Beranda
            </Link>
          </div>
          <div className="relative group">
            <select 
              value={activeWorkspace}
              onChange={(e) => setActiveWorkspace(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs font-bold outline-none focus:border-[#FFCC00] text-white/90 shadow-inner appearance-none cursor-pointer transition-colors group-hover:border-white/20"
            >
              {businessLines.map(line => (
                <option key={line.id} value={line.id}>{line.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-hover:text-[#FFCC00] transition-colors">
              <Settings2 size={14} />
            </div>
          </div>
        </div>
        
        <div className="p-6 flex items-center justify-between group cursor-pointer transition-colors hover:bg-white/5" onClick={() => setActiveQuestion(null)}>
          <div className="flex items-center gap-4 text-white/90">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFCC00]/20 to-[#FFCC00]/5 flex items-center justify-center text-[#FFCC00] border border-[#FFCC00]/20 shadow-[0_0_15px_rgba(255,204,0,0.1)]">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">Alur Formulir</h2>
              <p className="text-xs text-white/40 mt-0.5">{schema.questions.length} Pertanyaan</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                  <AnimatePresence>
                    {schema.questions.map((q, index) => (
                      <Draggable key={q.id} draggableId={q.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            onClick={() => setActiveQuestion(q)}
                            className={`group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${activeQuestion?.id === q.id ? 'bg-gradient-to-r from-[#FFCC00]/20 to-[#FFCC00]/5 border border-[#FFCC00]/50 shadow-[0_0_30px_rgba(255,204,0,0.15)] backdrop-blur-md' : 'bg-[#111] hover:bg-[#1A1A1A] border border-white/5 hover:border-white/20'} ${snapshot.isDragging ? 'shadow-2xl bg-[#1A1A1A] border-[#FFCC00] scale-105 z-50' : ''}`}
                          >
                            <div {...provided.dragHandleProps} className="text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing p-1 transition-colors">
                              <GripVertical size={18} />
                            </div>
                            <div className="flex flex-col items-center justify-center w-8 h-8">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${activeQuestion?.id === q.id ? 'text-[#FFCC00]' : 'text-white/30'}`}>Q{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`truncate text-sm font-bold ${activeQuestion?.id === q.id ? 'text-white' : 'text-white/70'}`}>
                                {q.title || <span className="italic opacity-40">Tanpa Judul</span>}
                              </div>
                              <div className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mt-1">
                                {getIconForType(q.type)} {getTypeName(q.type)}
                              </div>
                            </div>
                            <button onClick={(e) => deleteQuestion(q.id, e)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white bg-transparent hover:bg-red-500/80 p-2 rounded-xl transition-all duration-300 shadow-sm">
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <button 
            onClick={addQuestion}
            className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Plus size={14} /> Tambah Baru
          </button>
        </div>

        {/* User Profile / Logout */}
        <div className="p-5 border-t border-white/5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-wide">{authName || 'Admin'}</span>
            <span className="text-[#FFCC00] text-[10px] uppercase tracking-widest mt-0.5">Administrator</span>
          </div>
<button
            onClick={() => { void logout().then(() => router.push('/')); }}
            className="text-white/40 hover:text-red-400 p-2.5 bg-white/5 hover:bg-red-400/10 rounded-xl transition-all shadow-sm"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Drag overlay — blocks all pointer events while resizing to prevent text selection */}
      {isDragging && (
        <div className="fixed inset-0 z-[9999] cursor-ew-resize" style={{ userSelect: 'none' }} />
      )}

      {/* COLUMN 2: MIDDLE CANVAS (Preview) */}
      <div className="flex-1 min-w-0 overflow-hidden relative flex flex-col bg-[#050505]">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>
        
        {/* Top Navbar */}
        <div className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/10 backdrop-blur-2xl z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 z-10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute animate-ping opacity-75"></div>
            </div>
            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.25em]">Visual Design Mode</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePublish}
              title={published ? 'Form saat ini terbit dan bisa diakses publik' : 'Form terkunci — bukan admin/pemilik tak bisa buka'}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 border ${published ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/25' : 'bg-red-500/15 border-red-500/50 text-red-400 hover:bg-red-500/25'}`}
            >
              <Rocket size={16} /> {published ? 'Terbit' : 'Lepas'}
            </button>
            <button
              onClick={openPreview}
              title="Pratinjau tampilan publik (tidak peduli status terbit)"
              className="flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 border bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Eye size={16} /> Pratinjau
            </button>
            <button
              onClick={saveSchema}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${isSaved ? 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-95' : 'bg-[#FFCC00] text-black hover:bg-yellow-300 hover:scale-[1.02] shadow-[0_0_30px_rgba(255,204,0,0.3)]'}`}
            >
              <Save size={16} /> {isSaved ? 'Tersimpan!' : 'Simpan Kuis'}
            </button>
            <button
              onClick={copyShareLink}
              title="Salin link formulir ini"
              className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 border ${copied ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10 hover:text-white'}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Tersalin!' : 'Salin Link'}
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-12 overflow-y-auto z-10 scroll-smooth">
          <AnimatePresence mode="wait">
          {activeQuestion ? (
             <motion.div 
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-16 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden"
             >
                {/* Glow Effect behind card */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-[#FFCC00]/20 blur-[100px] pointer-events-none rounded-full"></div>
               <div className="flex items-start gap-4 mb-8">
                  <div className="text-[#FFCC00] font-bold text-2xl flex items-center mt-1">
                    {schema.questions.findIndex(q => q.id === activeQuestion.id) + 1} 
                    <ArrowRight size={24} className="ml-2 text-[#FFCC00]/50" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase italic tracking-tighter">
                      {activeQuestion.title || <span className="opacity-30">Ketik Pertanyaan Anda...</span>}
                      {activeQuestion.required && <span className="text-[#FFCC00] ml-3 text-2xl">*</span>}
                    </h2>
                    {activeQuestion.description && (
                      <p className="text-xl text-white/50 mt-4 leading-relaxed">{activeQuestion.description}</p>
                    )}
                  </div>
               </div>

               <div className="pl-14">
                  {(activeQuestion.type === 'short_text' || activeQuestion.type === 'long_text') && (
                    <div className="w-full max-w-xl opacity-50 pointer-events-none">
                       <div className="text-2xl text-white/30 border-b border-white/20 pb-3 font-medium">
                         Ketik jawaban di sini...
                       </div>
                    </div>
                  )}

                  {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'yes_no') && (
                    <div className="flex flex-col gap-3 w-full max-w-lg opacity-80 pointer-events-none">
                      {(activeQuestion.options || []).map((opt, i) => (
                        <div key={opt.id} className="flex items-center gap-4 p-4 border border-white/10 rounded-xl bg-neutral-900/50 shadow-lg">
                          <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-sm font-bold bg-white/5 text-white/70">
                            {opt.shortcutKey || getAutoShortcut(i)}
                          </div>
                          <span className="text-xl font-medium text-white/90">{opt.label || 'Opsi kosong'}</span>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
             </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-white/20 text-center"
            >
              <div className="w-32 h-32 rounded-3xl border border-white/5 flex items-center justify-center mb-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm shadow-2xl">
                <Layout size={48} className="text-white/20" />
              </div>
              <p className="text-xl font-medium tracking-widest uppercase text-white/30 leading-relaxed">Pilih Pertanyaan Dari Sidebar<br/>Untuk Memulai Desain</p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* RESIZE HANDLE — flex sibling, no z-index conflicts with panel content */}
      <div
        onMouseDown={startResize}
        className="group relative shrink-0 h-full cursor-ew-resize z-30"
        style={{ width: 16 }}
        title="Geser untuk perbesar/perkecil panel"
      >
        {/* Track line */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/10 group-hover:bg-[#FFCC00]/60 transition-all duration-150 group-hover:w-[3px] group-hover:shadow-[0_0_8px_rgba(255,204,0,0.5)]" />
        {/* Grip dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] shadow-[0_0_6px_rgba(255,204,0,0.9)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] shadow-[0_0_6px_rgba(255,204,0,0.9)]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFCC00] shadow-[0_0_6px_rgba(255,204,0,0.9)]" />
        </div>
      </div>

      {/* COLUMN 3: RIGHT SIDEBAR (Settings) */}
      <div
        style={{ width: panelWidth }}
        className="shrink-0 bg-black/60 backdrop-blur-3xl border-l border-white/10 flex flex-col h-full z-20 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="h-24 border-b border-white/10 flex items-center px-8 bg-gradient-to-b from-black/80 to-transparent sticky top-0 z-10">
          <h2 className="text-[11px] font-black text-white/90 uppercase tracking-[0.25em] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFCC00]/10 flex items-center justify-center border border-[#FFCC00]/30 shadow-[0_0_15px_rgba(255,204,0,0.15)]">
              <Settings2 size={16} className="text-[#FFCC00]" />
            </div>
            Pengaturan Blok
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {activeQuestion ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-12">
              
              {/* Question Type Grid */}
              <div className="mb-10">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                  Format Jawaban
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['short_text', 'long_text', 'multiple_choice', 'yes_no'] as QuestionType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateActiveQuestion({ type })}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${activeQuestion.type === type ? 'bg-[#FFCC00]/10 border-[#FFCC00]/50 text-[#FFCC00] shadow-[0_0_20px_rgba(255,204,0,0.15)] scale-[1.02]' : 'bg-[#111] border-white/5 hover:border-white/20 text-white/60 hover:text-white hover:bg-[#1A1A1A]'}`}
                    >
                      {getIconForType(type)}
                      <span className="text-[11px] font-bold tracking-wide">{getTypeName(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-6 mb-10">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Teks Pertanyaan</label>
                  <textarea 
                    value={activeQuestion.title}
                    onChange={(e) => updateActiveQuestion({ title: e.target.value })}
                    placeholder="Tuliskan pertanyaan Anda..."
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] focus:bg-black/60 transition-all resize-none min-h-[120px] shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Deskripsi (Opsional)</label>
                  <textarea 
                    value={activeQuestion.description || ''}
                    onChange={(e) => updateActiveQuestion({ description: e.target.value })}
                    placeholder="Beri panduan tambahan..."
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] focus:bg-black/60 transition-all h-24 resize-none shadow-inner"
                  />
                </div>

                <label className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md">
                  <span className="text-sm font-bold tracking-wide text-white/80 group-hover:text-white transition-colors">Wajib Dijawab (Required)</span>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${activeQuestion.required ? 'bg-[#FFCC00] shadow-[0_0_10px_rgba(255,204,0,0.5)]' : 'bg-white/10 group-hover:bg-white/20'}`}>
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${activeQuestion.required ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  {/* Hidden Checkbox */}
                  <input 
                    type="checkbox"
                    checked={activeQuestion.required || false}
                    onChange={(e) => updateActiveQuestion({ required: e.target.checked })}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Options Settings */}
              {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'yes_no') && (
                <div className="mb-8">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Pilihan Opsi</label>
                  
                  <div className="space-y-3">
                    {(activeQuestion.options || []).map((opt, i) => (
                      <div key={opt.id} className="flex gap-2 group">
                        <div className="w-10 shrink-0 bg-black/50 border border-white/10 rounded-xl flex items-center justify-center text-xs font-bold text-white/40">
                          {getAutoShortcut(i)}
                        </div>
                        <input 
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...(activeQuestion.options || [])];
                            newOpts[i].label = e.target.value;
                            newOpts[i].shortcutKey = getAutoShortcut(i);
                            updateActiveQuestion({ options: newOpts });
                          }}
                          placeholder={`Opsi ${i + 1}`}
                          className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#FFCC00] transition-all"
                        />
                        <button 
                          onClick={() => {
                            const newOpts = activeQuestion.options?.filter((_, idx) => idx !== i);
                            updateActiveQuestion({ options: newOpts });
                          }}
                          className="w-10 shrink-0 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const nextIndex = activeQuestion.options?.length || 0;
                        const newOpts = [...(activeQuestion.options || []), { id: `opt_${Date.now()}`, label: ``, shortcutKey: getAutoShortcut(nextIndex) }];
                        updateActiveQuestion({ options: newOpts });
                      }}
                      className="w-full text-xs text-white/60 hover:text-black hover:bg-[#FFCC00] border border-white/10 hover:border-[#FFCC00] rounded-xl py-3 flex items-center justify-center gap-2 font-bold uppercase tracking-widest mt-2 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,204,0,0.3)]"
                    >
                      <Plus size={14} /> Tambah Opsi
                    </button>
                  </div>
                </div>
              )}

              {/* Advanced Pro Settings */}
              <div className="pt-6 border-t border-white/10">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-[#FFCC00] transition-colors mb-4 group"
                >
                  <span className="flex items-center gap-2"><CornerDownRight size={14} className="group-hover:translate-x-1 transition-transform"/> Logika Bercabang (Pro)</span>
                  <span className={`px-2 py-1 rounded transition-colors ${showAdvanced ? 'bg-[#FFCC00] text-black' : 'bg-white/10 text-white'}`}>{showAdvanced ? 'ON' : 'OFF'}</span>
                </button>

                {showAdvanced && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 mt-6">
                    
                    {(activeQuestion.type === 'multiple_choice' || activeQuestion.type === 'yes_no') ? (
                      <div className="space-y-4">
                        {(activeQuestion.options || []).map((opt, i) => (
                          <div key={opt.id} className="bg-black/40 border border-white/5 rounded-xl p-4 shadow-inner">
                            <div className="text-xs font-bold text-[#FFCC00] mb-3 truncate flex items-center gap-2">
                               <div className="w-5 h-5 rounded bg-[#FFCC00]/20 flex items-center justify-center text-[10px] text-[#FFCC00]">{getAutoShortcut(i)}</div> 
                               {opt.label || `Opsi ${i + 1}`}
                            </div>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5">Lompat Ke:</div>
                            <select 
                              value={opt.nextQuestionId || ''}
                              onChange={(e) => {
                                const newOpts = [...(activeQuestion.options || [])];
                                newOpts[i].nextQuestionId = e.target.value || undefined;
                                updateActiveQuestion({ options: newOpts });
                              }}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-[#FFCC00] text-white/90"
                            >
                              <option value="">(Lanjut Berurutan)</option>
                              <option value="thank_you">Akhiri (Thank You Screen)</option>
                              {schema.questions.filter(q => q.id !== activeQuestion.id).map(q => (
                                <option key={q.id} value={q.id}>Lompat ke: {q.title.substring(0, 20)}...</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 shadow-inner">
                        <div className="text-[10px] text-[#FFCC00] uppercase tracking-widest mb-2">Setelah Dijawab, Lompat Ke:</div>
                        <select 
                          value={activeQuestion.nextQuestionId || ''}
                          onChange={(e) => updateActiveQuestion({ nextQuestionId: e.target.value || undefined })}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-[#FFCC00] text-white/90"
                        >
                          <option value="">(Lanjut Berurutan)</option>
                          <option value="thank_you">Akhiri (Thank You Screen)</option>
                          {schema.questions.filter(q => q.id !== activeQuestion.id).map(q => (
                            <option key={q.id} value={q.id}>Lompat ke: {q.title.substring(0, 30)}...</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="pb-12">
              <div className="mb-8">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                  Pengaturan Formulir
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSettingsTab('welcome')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${settingsTab === 'welcome' ? 'bg-[#FFCC00]/10 border-[#FFCC00]/50 text-[#FFCC00] shadow-[0_0_20px_rgba(255,204,0,0.15)]' : 'bg-[#111] border-white/5 hover:border-white/20 text-white/60 hover:text-white'}`}
                  >
                    <Type size={16} />
                    <span className="text-[11px] font-bold tracking-wide">Layar Awal</span>
                  </button>
                  <button
                    onClick={() => setSettingsTab('thankyou')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${settingsTab === 'thankyou' ? 'bg-[#FFCC00]/10 border-[#FFCC00]/50 text-[#FFCC00] shadow-[0_0_20px_rgba(255,204,0,0.15)]' : 'bg-[#111] border-white/5 hover:border-white/20 text-white/60 hover:text-white'}`}
                  >
                    <Check size={16} />
                    <span className="text-[11px] font-bold tracking-wide">Layar Akhir</span>
                  </button>
                </div>
              </div>

              {settingsTab === 'welcome' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Judul Layar Awal</label>
                    <input
                      type="text"
                      value={schema.welcomeScreen?.title || ''}
                      onChange={(e) => updateWelcome({ title: e.target.value })}
                      placeholder="Contoh: Halo, Selamat Datang!"
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Deskripsi</label>
                    <textarea
                      value={schema.welcomeScreen?.description || ''}
                      onChange={(e) => updateWelcome({ description: e.target.value })}
                      placeholder="Tuliskan sapaan singkat..."
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all h-28 resize-none shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Teks Tombol Mulai</label>
                    <input
                      type="text"
                      value={schema.welcomeScreen?.buttonText || ''}
                      onChange={(e) => updateWelcome({ buttonText: e.target.value })}
                      placeholder="Mulai"
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all shadow-inner"
                    />
                  </div>
                  <div className="pt-4 border-t border-white/10 text-[11px] text-white/30 leading-relaxed">
                    Layar ini tampil pertama kali saat responden membuka form. Tombol mulai memicu pencatatan metrik <span className="text-[#FFCC00] font-bold">Mulai Mengisi</span>.
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Judul Layar Akhir</label>
                    <input
                      type="text"
                      value={schema.thankYouScreen?.title || ''}
                      onChange={(e) => updateThankYou({ title: e.target.value })}
                      placeholder="Contoh: Terima Kasih!"
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5">Deskripsi</label>
                    <textarea
                      value={schema.thankYouScreen?.description || ''}
                      onChange={(e) => updateThankYou({ description: e.target.value })}
                      placeholder="Tuliskan ucapan penutup..."
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] transition-all h-28 resize-none shadow-inner"
                    />
                  </div>
                  <div className="pt-4 border-t border-white/10 text-[11px] text-white/30 leading-relaxed">
                    Layar ini tampil setelah responden menyelesaikan form. Jawaban akan secara otomatis tersimpan ke dashboard dan memicu notifikasi <span className="text-[#FFCC00] font-bold">Email & WhatsApp</span> untuk lead baru.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
