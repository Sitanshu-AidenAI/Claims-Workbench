import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiApi } from '../services/api';

const QUICK_PROMPTS = {
  Financial: ["What's the reinsurance quota split?", "Check authority limit status", "Calculate net reserve after deductibles"],
  Legal: ["Subrogation recovery steps", "SIU investigation criteria", "Litigation timeline estimate"],
  Medical: ["Assess injury severity", "Recommend medical documentation", "Check treatment guidelines"],
  FNOL: ["Analyse this incident", "Check fraud indicators", "Suggest coverage type"],
};

const CONTEXT_COLORS = {
  Financial: { from: '#03448C', to: '#0558B0' },
  Legal: { from: '#5B21B6', to: '#7C3AED' },
  Medical: { from: '#065F46', to: '#059669' },
  FNOL: { from: '#03448C', to: '#0E7C5F' },
};

function AIIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.5" />
      <path d="M8 12h4M12 8v4" stroke="#2CC9A2" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 16l-2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function AISidebar({ context, claimId, scId, label = 'AI ASSISTANCE', subtitle = 'Streamline your process with AI' }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiApi.chat({ message: msg, conversation_id: convId, context, claim_id: claimId, sub_claim_id: scId });
      setConvId(res.conversation_id);
      setMessages(m => [...m, { role: 'ai', text: res.response }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', text: '⚠ ' + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  const prompts = QUICK_PROMPTS[context] || QUICK_PROMPTS.FNOL;
  const cc = CONTEXT_COLORS[context] || CONTEXT_COLORS.FNOL;

  if (!open) {
    return (
      <div className="w-[148px] flex-shrink-0">
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(3,68,140,0.35)' }}
          whileTap={{ scale: 0.97 }}
          className="w-full border-none cursor-pointer py-5 px-3.5 rounded-2xl flex flex-col items-center gap-3 gradient-primary shadow-[0_4px_20px_rgba(3,68,140,0.25)] relative overflow-hidden"
        >
          <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-accent-400/15" />
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 relative pulse-ring">
            <AIIcon size={22} />
          </div>
          <div className="text-white text-[11.5px] font-bold text-center tracking-wider">{label}</div>
          <div className="text-white/65 text-[10.5px] text-center leading-snug">{subtitle}</div>
          {context && (
            <div className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-white text-[10px] font-bold tracking-wider">
              {context.toUpperCase()}
            </div>
          )}
        </motion.button>
      </div>
    );
  }

  return (
    <div style={{
      width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 16, border: '1px solid #EEF2F8',
      boxShadow: '0 8px 32px rgba(3,68,140,0.12)', maxHeight: '82vh',
      overflow: 'hidden', animation: 'scaleIn 0.2s ease both',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px', flexShrink: 0,
        background: `linear-gradient(135deg, ${cc.from} 0%, ${cc.to} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AIIcon size={16} />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, lineHeight: 1 }}>AI Assistant</div>
            {context && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3,
                padding: '1px 8px', borderRadius: 9999,
                background: 'rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.9)', fontSize: 10.5, fontWeight: 600,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2CC9A2' }} />
                {context}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { title: 'Clear chat', onClick: () => { setMessages([]); setConvId(null); }, icon: <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
            { title: 'Minimise', onClick: () => setOpen(false), icon: <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
          ].map(btn => (
            <button key={btn.title} onClick={btn.onClick} title={btn.title} style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >{btn.icon}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 14px 8px',
        display: 'flex', flexDirection: 'column', gap: 2,
        scrollbarWidth: 'thin', scrollbarColor: '#E5EAF2 transparent',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 12 }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%', margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #EEF6FF, #E7F1FC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="#03448C" strokeWidth="1.5" />
                <path d="M8 12h4M12 8v4" stroke="#2CC9A2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2332', marginBottom: 4 }}>Ready to assist</div>
            <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 14, lineHeight: 1.5 }}>
              {context ? `Specialised for ${context} queries` : 'Ask anything about this claim'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {prompts.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  textAlign: 'left', padding: '8px 12px',
                  background: '#F5F8FF', border: '1px solid #E0EEFF',
                  borderRadius: 9, fontSize: 12, color: '#03448C', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF6FF'; e.currentTarget.style.borderColor = '#C7DFF7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F5F8FF'; e.currentTarget.style.borderColor = '#E0EEFF'; }}
                >
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0, color: '#2CC9A2' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 8, animation: 'fadeIn 0.25s ease both',
          }}>
            {m.role === 'ai' && (
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                marginRight: 7, marginTop: 2,
                background: 'linear-gradient(135deg, #03448C, #2CC9A2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AIIcon size={12} />
              </div>
            )}
            <div style={{
              maxWidth: '83%', padding: '9px 12px', fontSize: 12.5, lineHeight: 1.55,
              borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              ...(m.role === 'user' ? {
                background: 'linear-gradient(135deg, #03448C, #0558B0)',
                color: '#fff', boxShadow: '0 2px 8px rgba(3,68,140,0.2)',
              } : {
                background: '#F8FAFD', border: '1px solid #EEF2F8', color: '#1A2332',
              }),
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginRight: 7, marginTop: 2,
              background: 'linear-gradient(135deg, #03448C, #2CC9A2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AIIcon size={12} />
            </div>
            <div style={{ background: '#F8FAFD', border: '1px solid #EEF2F8', borderRadius: '4px 12px 12px 12px', padding: '10px 14px' }}>
              <div className="chatbot-typing" style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => <span key={i} className={`dot ${['one', 'two', 'three'][i]}`}>.</span>)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts strip */}
      {messages.length > 0 && !loading && (
        <div style={{
          padding: '6px 12px', borderTop: '1px solid #F1F5F9',
          display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0,
        }} className="no-scrollbar">
          {prompts.slice(0, 2).map(q => (
            <button key={q} onClick={() => send(q)} style={{
              padding: '4px 10px', borderRadius: 9999, whiteSpace: 'nowrap',
              background: '#F0F7FF', border: '1px solid #C7DFF7',
              color: '#03448C', fontSize: 11, fontWeight: 500, cursor: 'pointer',
              flexShrink: 0, transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#E7F1FC'}
              onMouseLeave={e => e.currentTarget.style.background = '#F0F7FF'}
            >{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 12px 12px', borderTop: '1px solid #F1F5F9', flexShrink: 0 }}>
        <div className="chartbot-input" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 6px 6px 12px' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask AI about this claim…"
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              fontSize: 12.5, color: '#1A2332', fontFamily: 'Poppins, sans-serif',
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            width: 32, height: 32, borderRadius: 9, border: 'none', flexShrink: 0,
            background: (loading || !input.trim()) ? '#E5EAF2' : 'linear-gradient(135deg, #03448C, #2CC9A2)',
            cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: (loading || !input.trim()) ? 'none' : '0 2px 8px rgba(3,68,140,0.3)',
            transition: 'all 0.15s',
          }}>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke={loading || !input.trim() ? '#9CA3AF' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p style={{ fontSize: 10.5, color: '#9CA3AF', textAlign: 'center', margin: '6px 0 0' }}>
          Advisory only — always verify with policy documents.
        </p>
      </div>
    </div>
  );
}
