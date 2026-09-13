'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormSchema, Option } from '../types/form';
import { ChevronRight, Check, ArrowLeft, ChevronUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackView, trackStart, submitResponse } from '@/lib/storage';

interface FormEngineProps {
  schema: FormSchema;
  workspaceId?: string;
}

export default function FormEngine({ schema, workspaceId }: FormEngineProps) {
  const workspace = workspaceId || schema.id || 'default';
  const [currentStep, setCurrentStep] = useState<string>('welcome');
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hiddenFields] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const errorTimerRef = useRef<number | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Track which option was selected to show brief active state before sliding to next question
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  // 1. View Counter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackView(workspace);
    }
  }, [workspace]);

  const flashError = useCallback((message: string) => {
    setErrorMessage(message);
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setErrorMessage(null), 3500);
  }, []);

  const goThankYou = useCallback(() => {
    if (submittedRef.current) {
      setCurrentStep('thank_you');
      return;
    }
    submittedRef.current = true;
    // Honeypot anti-spam: jika bot mengisi field tersembunyi, buang tanpa menyimpan respons
    const honeypotValue = honeypotRef.current?.value?.trim() || '';
    const honeypotFilled = honeypotValue.length > 0;
    if (!honeypotFilled) {
      submitResponse({ workspace, answers, hiddenFields });
    }
    setCurrentStep('thank_you');
  }, [workspace, answers, hiddenFields]);

  // Submit response when reaching thank-you (covers forms with no questions)
  useEffect(() => {
    if (currentStep === 'thank_you' && !submittedRef.current) {
      goThankYou();
    }
  }, [currentStep, goThankYou]);

  const getQuestion = (id: string) => schema.questions.find((q) => q.id === id);
  const currentQuestion = getQuestion(currentStep);

  const advance = (fromStep: string, explicitNextId?: string) => {
    const target = explicitNextId || (getQuestion(fromStep) ? getQuestion(fromStep)!.nextQuestionId : undefined);
    const next = target || 'review';
    setStepHistory((prev) => [...prev, fromStep]);
    setCurrentStep(next === 'thank_you' ? 'review' : next);
  };

  const handleBack = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory((prev) => prev.slice(0, -1));
      setCurrentStep(prevStep);

      const prevQ = getQuestion(prevStep);
      if (prevQ && (prevQ.type === 'short_text' || prevQ.type === 'long_text')) {
        setInputValue(answers[prevStep] || '');
      } else {
        setInputValue('');
      }
    }
  };

  const handleNext = useCallback(
    (nextId?: string) => {
      if (currentStep === 'welcome') {
        trackStart(workspace);
        const first = schema.questions?.[0];
        if (first) setCurrentStep(first.id);
        else setCurrentStep('thank_you');
        return;
      }

      if (!currentQuestion) return;

      if (currentQuestion.type === 'short_text' || currentQuestion.type === 'long_text') {
        if (currentQuestion.required && !inputValue.trim()) {
          flashError('Kolom ini wajib diisi dulu ya.');
          return;
        }
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: inputValue }));
        setInputValue('');
      }

      advance(currentStep, nextId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep, currentQuestion, inputValue, flashError]
  );

  const handleOptionSelect = (option: Option) => {
    setActiveOptionId(option.id);
    setAnswers((prev) => ({ ...prev, [currentQuestion!.id]: option.id }));

    // Slight delay to show the active state animation
    window.setTimeout(() => {
      setActiveOptionId(null);
      advance(currentStep, option.nextQuestionId);
    }, 400);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (currentStep === 'welcome' && e.key === 'Enter') {
        handleNext();
        return;
      }

      if (currentStep === 'review' && e.key === 'Enter') {
        goThankYou();
        return;
      }

      if (currentQuestion) {
        if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'yes_no') {
          const option = currentQuestion.options?.find(
            (o) => o.shortcutKey?.toLowerCase() === e.key.toLowerCase()
          );
          if (option) {
            handleOptionSelect(option);
          }
        } else if ((currentQuestion.type === 'short_text' || currentQuestion.type === 'long_text') && e.key === 'Enter') {
          if (!e.shiftKey) {
            e.preventDefault();
            handleNext();
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStep, currentQuestion, inputValue, handleNext, goThankYou]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const replaceVariables = (text: string) => {
    if (!text) return text;
    return text.replace(/\{\{(.*?)\}\}/g, (_, key) => answers[key] || '');
  };

  const getAnswerLabel = (q: FormSchema['questions'][number], answerValue?: string) => {
    if (!answerValue) return undefined;
    if (q.type === 'multiple_choice' || q.type === 'yes_no') {
      return q.options?.find((o) => o.id === answerValue)?.label;
    }
    return answerValue;
  };

  const renderContent = () => {
    if (currentStep === 'welcome' && schema.welcomeScreen) {
      return (
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 text-white uppercase italic tracking-tighter leading-[1.1]">{schema.welcomeScreen.title}</h1>
          <p className="text-xl md:text-3xl text-white/50 mb-12 leading-relaxed font-light">{schema.welcomeScreen.description}</p>
          <button
            onClick={() => handleNext()}
            className="group flex items-center gap-3 bg-[#FFCC00] text-black px-10 py-4 rounded-xl font-black hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95 text-xl uppercase tracking-widest shadow-[0_0_30px_rgba(255,204,0,0.3)]"
          >
            {schema.welcomeScreen.buttonText}
            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
          <p className="text-sm text-white/40 mt-8 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            tekan <span className="text-white bg-white/10 px-2 py-1 rounded shadow-inner">ENTER ↵</span>
          </p>
        </motion.div>
      );
    }

    if (currentStep === 'thank_you' && schema.thankYouScreen) {
      return (
        <motion.div
          key="thank_you"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-3xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-24 h-24 bg-[#FFCC00]/10 text-[#FFCC00] rounded-full flex items-center justify-center mb-10 border border-[#FFCC00]/30 shadow-[0_0_50px_rgba(255,204,0,0.2)]"
          >
            <Check size={48} strokeWidth={4} />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-white uppercase italic tracking-tighter">{schema.thankYouScreen.title}</h1>
          <p className="text-xl md:text-2xl text-white/50 mb-12 font-light">{schema.thankYouScreen.description}</p>

          <Link href="/" className="inline-flex items-center gap-2 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors uppercase tracking-widest text-sm">
            <ArrowLeft size={18} /> Kembali ke Beranda
          </Link>
        </motion.div>
      );
    }

    if (currentStep === 'review') {
      return (
        <motion.div
          key="review"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, filter: "blur(5px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start max-w-3xl w-full"
        >
          <div className="mb-10">
            <span className="text-[#FFCC00] font-bold tracking-[0.3em] uppercase text-sm">Konfirmasi</span>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase italic tracking-tighter leading-[1.1]">
              Rangkuman Jawaban
            </h1>
            <p className="text-lg text-white/50 leading-relaxed font-light">Koreksi dulu sebelum mengirim formulir ya.</p>
          </div>

          <div className="w-full space-y-4">
            {schema.questions.map((q) => {
              const label = getAnswerLabel(q, answers[q.id]);
              return (
                <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{replaceVariables(q.title)}</p>
                  <p className="text-white font-bold text-lg">
                    {label || <span className="text-white/30 italic font-normal">Tidak dijawab</span>}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => goThankYou()}
              className="flex items-center gap-2 bg-[#FFCC00] text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,204,0,0.3)]"
            >
              Kirim Jawaban <ArrowRight size={20} />
            </button>
            {stepHistory.length > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm"
              >
                Ubah Jawaban
              </button>
            )}
          </div>
          <p className="text-sm text-white/40 mt-8 font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            tekan <span className="text-white bg-white/10 px-2 py-1 rounded shadow-inner">ENTER ↵</span> untuk kirim
          </p>
        </motion.div>
      );
    }

    if (currentQuestion) {
      const questionIndex = schema.questions.findIndex(q => q.id === currentQuestion.id) + 1;

      return (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, filter: "blur(5px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start max-w-4xl w-full"
        >
          <div className="flex items-start gap-6 mb-12">
            <div className="flex items-center text-[#FFCC00] mt-1 font-bold text-2xl">
              <span>{questionIndex}</span>
              <ArrowRight size={24} className="ml-3 opacity-50" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white leading-[1.2] tracking-tight">
                {replaceVariables(currentQuestion.title)}
                {currentQuestion.required && <span className="text-[#FFCC00] ml-3">*</span>}
              </h2>
              {currentQuestion.description && (
                <p className="text-xl md:text-2xl text-white/50 font-light">{replaceVariables(currentQuestion.description)}</p>
              )}
            </div>
          </div>

          <div className="w-full pl-10 md:pl-[4.5rem]">
            {(currentQuestion.type === 'short_text' || currentQuestion.type === 'long_text') && (
              <div className="w-full max-w-2xl">
                {currentQuestion.type === 'short_text' ? (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ketik jawaban di sini..."
                    className="w-full text-3xl md:text-4xl font-medium bg-transparent border-b-2 border-white/20 focus:border-[#FFCC00] outline-none py-4 transition-colors text-[#FFCC00] placeholder:text-white/20"
                    autoFocus
                  />
                ) : (
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ketik jawaban di sini..."
                    className="w-full text-2xl md:text-3xl font-medium bg-transparent border-b-2 border-white/20 focus:border-[#FFCC00] outline-none py-4 transition-colors text-[#FFCC00] placeholder:text-white/20 resize-none h-40"
                    autoFocus
                  />
                )}
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <button
                    onClick={() => handleNext()}
                    disabled={currentQuestion.required && !inputValue.trim()}
                    className="flex items-center gap-2 bg-[#FFCC00] text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all disabled:opacity-20 text-lg uppercase tracking-wide disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,204,0,0.2)]"
                  >
                    OK <Check size={24} strokeWidth={3} />
                  </button>
                  <span className="text-xs font-bold text-white/40 tracking-[0.2em] uppercase flex items-center gap-2">
                    tekan <span className="text-white bg-white/10 px-2 py-1 rounded">ENTER ↵</span>
                  </span>
                </div>
              </div>
            )}

            {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'yes_no') && (
              <div className="flex flex-col gap-4 w-full max-w-xl">
                {currentQuestion.options?.map((option, i) => {
                  const isSelected =
                    activeOptionId === option.id || answers[currentQuestion.id] === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(option)}
                      className={`group relative flex items-center w-full p-4 pr-6 text-left border rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#FFCC00] border-[#FFCC00] text-black scale-[1.02] shadow-[0_0_30px_rgba(255,204,0,0.4)] z-10'
                          : 'bg-white/5 border-white/10 hover:border-[#FFCC00] hover:bg-[#FFCC00]/5 text-white/90 shadow-xl'
                      }`}
                    >
                      <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border mr-5 text-sm font-black transition-colors ${
                        isSelected
                          ? 'bg-black/20 border-black/20 text-black'
                          : 'bg-white/5 border-white/20 text-white/60 group-hover:border-[#FFCC00] group-hover:text-[#FFCC00] group-hover:bg-[#FFCC00]/10'
                      }`}>
                        {option.shortcutKey || String.fromCharCode(65 + i)}
                      </div>
                      <span className={`flex-1 text-xl font-medium ${isSelected ? 'text-black' : 'text-white'}`}>
                        {option.label}
                      </span>

                      {!isSelected && (
                        <div className="opacity-0 group-hover:opacity-100 absolute right-4 flex items-center gap-2 text-xs font-bold tracking-widest text-[#FFCC00] uppercase transition-opacity">
                          tekan <span className="bg-[#FFCC00]/20 px-2 py-1 rounded">{option.shortcutKey || String.fromCharCode(65 + i)}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
                {!currentQuestion.required && (
                  <button
                    onClick={() => handleNext()}
                    className="self-start text-xs font-bold text-white/40 uppercase tracking-widest hover:text-[#FFCC00] transition-colors mt-2"
                  >
                    Lewati pertanyaan ini →
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  const progressWidth =
    currentStep === 'welcome'
      ? '0%'
      : currentStep === 'thank_you'
        ? '100%'
        : currentStep === 'review'
          ? '96%'
          : `${((schema.questions.findIndex(q => q.id === currentStep) + 1) / schema.questions.length) * 100}%`;

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col font-sans text-white relative">
      {/* Honeypot field — disembunyikan dari manusia, diisi bot */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] top-0 h-0 w-0 opacity-0"
      />

      {/* Premium Studio Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#FFCC00]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 md:pl-32 overflow-y-auto relative w-full h-full z-10">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/5 w-full fixed top-0 left-0 z-50">
        <div
          className="h-full bg-[#FFCC00] transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_15px_rgba(255,204,0,0.6)]"
          style={{ width: progressWidth }}
        />
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-bold px-6 py-3 rounded-xl backdrop-blur-md"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Navigation Controls */}
      {currentStep !== 'welcome' && currentStep !== 'thank_you' && (
        <div className="fixed bottom-10 right-10 flex items-center gap-4 z-50">
          <button
            onClick={handleBack}
            disabled={stepHistory.length === 0}
            className="w-14 h-14 bg-black/50 backdrop-blur-md border border-white/20 text-white/70 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:text-[#FFCC00] hover:border-[#FFCC00]/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-2xl"
            title="Kembali ke soal sebelumnya"
          >
            <ChevronUp size={28} />
          </button>
        </div>
      )}
    </div>
  );
}