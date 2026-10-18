import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Trash2,
  AlertCircle,
  X,
  Bot,
  User,
  Lightbulb,
} from 'lucide-react';
import { useDeepSolveMessages, dbService } from '../../services/database';
import { DeepSolveResult } from '../../types';

export const DeepSolveScreen: React.FC = () => {
  const messages = useDeepSolveMessages();
  const [inputText, setInputText] = useState('');
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedImageMime, setAttachedImageMime] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() && !attachedImageBase64) return;

    setSolving(true);
    setError(null);

    // Save user message to chat
    dbService.addDeepSolveMessage({
      role: 'user',
      text: textToSend.trim(),
      imageBase64: attachedImageBase64 || undefined,
      audioText: voiceTranscript || undefined,
    });

    const currentImage = attachedImageBase64;
    const currentMime = attachedImageMime;
    const currentVoice = voiceTranscript;

    // Reset input
    setInputText('');
    setAttachedImageBase64(null);
    setAttachedImageMime(null);
    setVoiceTranscript(null);

    try {
      const res = await fetch('/api/ai/deep-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend.trim(),
          imageBase64: currentImage,
          imageMimeType: currentMime,
          audioText: currentVoice,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error ' + res.status);
      }

      const solution: DeepSolveResult = await res.json();

      dbService.addDeepSolveMessage({
        role: 'assistant',
        text: solution.summaryAnswer,
        solution,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to solve task.');
    } finally {
      setSolving(false);
    }
  };

  const samplePrompts = [
    'Calculate the pediatric amoxicillin dosage for an 18 kg child with severe otitis media (90 mg/kg/day divided q12h). Show working and bottle volume.',
    'A drug has zero-order elimination at 10 mg/hour. If initial plasma concentration is 100 mg/L in a 10 L volume, how long until complete elimination?',
    'Explain the clinical mechanism of ACE inhibitor-induced cough vs Angiotensin Receptor Blockers (ARBs) bradykinin pathway.',
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-[#00696f]" />
            <span>Deep Solve Academic Assistant</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Solve complex homework, clinical problems, mathematical derivations, or attached exam
            questions using typed text, voice notes, or uploaded photos.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => dbService.clearDeepSolve()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 rounded-xl transition-colors self-start shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        )}
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Suggested Tasks to Deep Solve
          </span>
          <div className="grid grid-cols-1 gap-2">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-left text-xs p-3 rounded-xl bg-slate-50 hover:bg-[#d2ecee]/40 border border-slate-200 text-slate-800 transition-colors flex items-center justify-between group"
              >
                <span>{p}</span>
                <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-[#00696f] shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3.5 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-9 h-9 rounded-xl bg-[#00696f] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-5 ${
                m.role === 'user'
                  ? 'bg-[#00696f] text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 shadow-xs text-slate-900 space-y-4'
              }`}
            >
              {/* User text / attached image */}
              {m.role === 'user' && (
                <div className="space-y-2 text-sm">
                  {m.imageBase64 && (
                    <img
                      src={m.imageBase64}
                      alt="Uploaded problem"
                      className="max-h-56 rounded-lg object-contain bg-black/10"
                    />
                  )}
                  {m.audioText && (
                    <div className="text-xs text-teal-100 italic">
                      Voice note: &quot;{m.audioText}&quot;
                    </div>
                  )}
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              )}

              {/* Assistant Deep Solution */}
              {m.role === 'assistant' && m.solution && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{m.solution.title}</h3>
                    <div className="mt-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                        Executive Answer / Summary:
                      </span>
                      <p className="text-sm font-semibold text-emerald-950 whitespace-pre-line leading-relaxed">
                        {m.solution.summaryAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Step by Step Working */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00696f] block">
                      Step-by-Step Rigorous Mathematical & Clinical Working
                    </span>
                    <div className="space-y-2.5">
                      {m.solution.stepByStepSolution.map((s) => (
                        <div
                          key={s.stepNumber}
                          className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#00696f] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {s.stepNumber}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm">{s.stepTitle}</h4>
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-line pl-7 leading-relaxed font-mono">
                            {s.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tutor Pedagogical Insight */}
                  <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-[#004d52]">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Tutor Pedagogical Insight
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {m.solution.tutorInsight}
                    </p>
                  </div>

                  {/* Marking Notes */}
                  {m.solution.markingCriteriaNotes && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                      <span className="font-bold text-amber-800">Examiner Marking Note: </span>
                      {m.solution.markingCriteriaNotes}
                    </div>
                  )}

                  {/* Related Practice */}
                  {m.solution.practiceQuestions && m.solution.practiceQuestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Related Practice Questions & Solutions
                      </span>
                      <div className="space-y-2">
                        {m.solution.practiceQuestions.map((pq, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                          >
                            <p className="font-semibold text-slate-800">• {pq.question}</p>
                            <p className="text-slate-600 pl-3">
                              <span className="font-medium text-emerald-700">Answer:</span>{' '}
                              {pq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-4 z-20 bg-white rounded-2xl p-3 sm:p-4 border border-slate-300 shadow-xl space-y-3">
        {/* Attached previews */}
        {(attachedImageBase64 || voiceTranscript) && (
          <div className="flex items-center gap-2 px-1">
            {attachedImageBase64 && (
              <div className="relative inline-block">
                <img
                  src={attachedImageBase64}
                  alt="Preview"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                />
                <button
                  onClick={() => setAttachedImageBase64(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {voiceTranscript && (
              <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
                <span>Voice: &quot;{voiceTranscript}&quot;</span>
                <button onClick={() => setVoiceTranscript(null)}>
                  <X className="w-3 h-3 text-teal-600" />
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hidden Image Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Attach problem photo or diagram"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl transition-colors ${
              isRecording
                ? 'bg-red-50 text-red-600 animate-pulse'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isRecording ? 'Listening... click to stop' : 'Record voice note'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isRecording
                ? 'Listening to your voice...'
                : 'Type an academic task, pharmacology calculation, or ask to solve an attached image...'
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00696f] resize-none"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={solving || (!inputText.trim() && !attachedImageBase64)}
            className="px-5 py-2.5 bg-[#00696f] hover:bg-[#005358] text-white rounded-xl font-semibold text-sm shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {solving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Deep Solve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
