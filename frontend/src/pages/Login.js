import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2CC9A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="#2CC9A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI-Powered FNOL',
    desc: 'Automated first notice of loss with intelligent form filling and fraud scoring in real-time.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" stroke="#24C0E5" strokeWidth="2" />
        <path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="#24C0E5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Smart Fraud Detection',
    desc: 'Multi-dimensional risk scoring with explainable AI alerts and SIU escalation workflows.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="#2CC9A2" strokeWidth="2" />
        <path d="M8 21h8M12 17v4" stroke="#2CC9A2" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 8h4M7 11h8" stroke="#2CC9A2" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'End-to-End Lifecycle',
    desc: 'From FNOL to settlement — reserves, reinsurance splits, authority limits and legal management.',
  },
];

const STATS = [
  { value: '94%', label: 'Faster Processing' },
  { value: '3.2×', label: 'Fraud Detection Rate' },
  { value: '£100M+', label: 'Claims Managed' },
];

// Animated SVG illustration
function HeroIllustration() {
  return (
    <svg viewBox="0 0 440 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 420 }}>
      {/* Background circles */}
      <circle cx="220" cy="190" r="160" fill="rgba(255,255,255,0.04)" />
      <circle cx="220" cy="190" r="120" fill="rgba(255,255,255,0.04)" />

      {/* Central shield */}
      <g style={{ animation: 'float 4s ease-in-out infinite' }}>
        <path d="M220 60 L290 90 L290 150 C290 195 220 225 220 225 C220 225 150 195 150 150 L150 90 Z"
          fill="rgba(44,201,162,0.15)" stroke="#2CC9A2" strokeWidth="2" />
        <path d="M200 145 L213 158 L242 130" stroke="#2CC9A2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Document card 1 */}
      <g style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '0.8s' }}>
        <rect x="60" y="120" width="100" height="80" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <rect x="72" y="135" width="60" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
        <rect x="72" y="148" width="45" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="72" y="158" width="52" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="72" y="168" width="36" height="4" rx="2" fill="rgba(44,201,162,0.6)" />
        <circle cx="137" cy="125" r="6" fill="#2CC9A2" />
        <text x="134" y="129" fontSize="8" fill="white" fontWeight="bold">AI</text>
      </g>

      {/* Document card 2 */}
      <g style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '1.5s' }}>
        <rect x="278" y="100" width="105" height="90" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <rect x="290" y="117" width="55" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
        <rect x="290" y="130" width="42" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="290" y="140" width="50" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="290" y="150" width="32" height="4" rx="2" fill="rgba(36,192,229,0.6)" />
        <rect x="290" y="162" width="70" height="14" rx="4" fill="rgba(44,201,162,0.2)" stroke="#2CC9A2" strokeWidth="1" />
        <text x="300" y="173" fontSize="8" fill="#2CC9A2" fontWeight="600">APPROVED</text>
      </g>

      {/* Bottom stats card */}
      <g style={{ animation: 'float 4.5s ease-in-out infinite', animationDelay: '0.4s' }}>
        <rect x="120" y="255" width="200" height="75" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <text x="140" y="278" fontSize="11" fill="rgba(255,255,255,0.6)" fontFamily="Poppins">Risk Score</text>
        <rect x="140" y="285" width="100" height="5" rx="3" fill="rgba(255,255,255,0.15)" />
        <rect x="140" y="285" width="72" height="5" rx="3" fill="#2CC9A2" />
        <text x="250" y="290" fontSize="10" fill="#2CC9A2" fontWeight="600">72%</text>
        <text x="140" y="308" fontSize="11" fill="rgba(255,255,255,0.6)" fontFamily="Poppins">Fraud Score</text>
        <rect x="140" y="314" width="100" height="5" rx="3" fill="rgba(255,255,255,0.15)" />
        <rect x="140" y="314" width="30" height="5" rx="3" fill="#24C0E5" />
        <text x="250" y="319" fontSize="10" fill="#24C0E5" fontWeight="600">24%</text>
      </g>

      {/* Connection lines */}
      <line x1="162" y1="170" x2="188" y2="175" stroke="rgba(44,201,162,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="278" y1="165" x2="252" y2="172" stroke="rgba(36,192,229,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="220" y1="228" x2="220" y2="253" stroke="rgba(44,201,162,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Orbit dots */}
      <circle cx="158" cy="80" r="4" fill="#2CC9A2" style={{ animation: 'pulse-ring 3s ease-out infinite' }} />
      <circle cx="310" cy="65" r="3" fill="#24C0E5" style={{ animation: 'pulse-ring 3s ease-out infinite', animationDelay: '1s' }} />
      <circle cx="350" cy="220" r="3.5" fill="#2CC9A2" style={{ animation: 'pulse-ring 3s ease-out infinite', animationDelay: '2s' }} />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('handler@arch.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(email, password);
      if (data.access_token) {
        login(data.access_token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-3/5 p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #022D5E 0%, #03448C 45%, #0558B0 70%, #065FC4 100%)',
        }}
      >
        {/* Background decorations */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(44,201,162,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(36,192,229,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Logo and Product Name */}
        <div className={mounted ? 'animate-fadeIn' : ''}>
          <div className="mb-10">
            <img
              src="/aidenlogo.svg"
              alt="Aiden AI"
              className="h-8 brightness-0 invert opacity-100"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="text-white/50 font-semibold tracking-[0.25em] text-[10.5px] uppercase">
                Product
              </div>
              <div className="h-px bg-white/20 w-8" />
            </div>
            <h1 style={{ color: '#fff', fontSize: 38, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
              Claims <span style={{ fontWeight: 600 }}>Workbench</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, fontWeight: 400, marginTop: 10 }}>
              Intelligent claims resolution platform
            </p>
          </div>
        </div>

        {/* Hero Content */}
        <div className={`flex-1 flex flex-col justify-center ${mounted ? 'animate-slideUp delay-100' : ''}`}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: 'rgba(44,201,162,0.15)',
              border: '1px solid rgba(44,201,162,0.3)',
              borderRadius: 9999, color: '#2CC9A2', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2CC9A2', display: 'inline-block' }} />
              AI-AUGMENTED PLATFORM
            </span>
          </div>

          <h1 style={{
            color: '#fff', fontSize: 42, fontWeight: 800,
            lineHeight: 1.15, margin: '16px 0',
            letterSpacing: '-0.02em',
          }}>
            Next-Generation<br />
            <span style={{
              background: 'linear-gradient(90deg, #2CC9A2, #24C0E5)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Claims Management</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
            Streamline every step from FNOL to settlement with intelligent automation, real-time fraud detection, and AI-driven insights.
          </p>

          {/* Illustration */}
          <div className="animate-float" style={{ marginBottom: 24 }}>
            <HeroIllustration />
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={mounted ? `animate-fadeInLeft delay-${(i + 2) * 100}` : ''}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 13.5, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className={mounted ? 'animate-fadeIn delay-600' : ''} style={{ display: 'flex', gap: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#2CC9A2', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className={`w-full max-w-md ${mounted ? 'animate-fadeInRight' : ''}`}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #03448C 0%, #2CC9A2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M9 12h6M9 16h6M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#03448C' }}>Claims Workbench</span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#1A2332', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14.5, marginTop: 8 }}>
              Sign in to your account to continue managing claims.
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: 20, padding: '12px 16px',
              background: '#FFF5F5', border: '1px solid #FED7D7',
              borderRadius: 10, color: '#C53030', fontSize: 13.5,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#C53030" strokeWidth="2" />
                <path d="M12 8v4m0 4h.01" stroke="#C53030" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #E5EAF2', borderRadius: 10,
                  fontSize: 14, color: '#1A2332', background: '#FAFBFC',
                  outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#03448C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(3,68,140,0.08)';
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#E5EAF2';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#FAFBFC';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #E5EAF2', borderRadius: 10,
                  fontSize: 14, color: '#1A2332', background: '#FAFBFC',
                  outline: 'none', transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#03448C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(3,68,140,0.08)';
                  e.target.style.background = '#fff';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#E5EAF2';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#FAFBFC';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #03448C 0%, #0558B0 100%)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(3,68,140,0.35)',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontFamily: 'Poppins, sans-serif',
              }}
              onMouseEnter={e => {
                if (!loading) e.currentTarget.style.boxShadow = '0 8px 24px rgba(3,68,140,0.45)';
              }}
              onMouseLeave={e => {
                if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,68,140,0.35)';
              }}
            >
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin-slow 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{
            marginTop: 28, padding: 18,
            background: 'linear-gradient(135deg, #F0F7FF 0%, #F5FBFF 100%)',
            border: '1px solid #D0E8FF', borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: '#03448C', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#fff" strokeWidth="2.5" />
                </svg>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#03448C' }}>DEMO ACCOUNTS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { role: 'FNOL Officer', email: 'fnol@arch.com' },
                { role: 'Claims Handler', email: 'handler@arch.com' },
                { role: 'Claims Manager', email: 'manager@arch.com' },
              ].map(u => (
                <div
                  key={u.email}
                  onClick={() => { setEmail(u.email); setPassword('demo123'); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                    background: email === u.email ? 'rgba(3,68,140,0.06)' : 'transparent',
                    border: email === u.email ? '1px solid rgba(3,68,140,0.15)' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(3,68,140,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = email === u.email ? 'rgba(3,68,140,0.06)' : 'transparent'}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#03448C', display: 'block' }}>{u.role}</span>
                    <span style={{ fontSize: 11.5, color: '#6B7280' }}>{u.email} / demo123</span>
                  </div>
                  {email === u.email && (
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" stroke="#2CC9A2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 24 }}>
            © 2025 Arch Insurance Group · Claims Workbench v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
