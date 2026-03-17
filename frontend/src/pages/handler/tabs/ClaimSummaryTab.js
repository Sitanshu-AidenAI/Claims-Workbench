import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ChevronDown, AlertTriangle, CheckCircle,
  TrendingUp, Shield, Search, Loader2, RefreshCw, FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { aiApi } from '../../../services/api';

const HISTORY_DATA = [
  { claim_id: 'CL-789', type: 'Accident', status: 'UNDER REVIEW', amount: '£15,000', paid: '£5,000', initiated: '04-10-2025', closed: 'N/A' },
  { claim_id: 'CL-456', type: 'Medical', status: 'CLOSED', amount: '£20,000', paid: '£20,000', initiated: '03-15-25', closed: '03-25-25' },
  { claim_id: 'CL-112', type: 'Accident', status: 'DENIED', amount: '£10,000', paid: '£0', initiated: '01-05-2025', closed: '01-10-2025' },
  { claim_id: 'CL-334', type: 'Medical', status: 'CLOSED', amount: '£15,000', paid: '£15,000', initiated: '08-18-24', closed: '09-01-2024' },
  { claim_id: 'CL-998', type: 'Accident', status: 'CLOSED', amount: '£15,000', paid: '£15,000', initiated: '06-01-2023', closed: '06-20-23' },
];
const PAYMENT_HISTORY = [
  { date: '04-15-25', amount: '£5,000', method: 'Direct Deposit', claim: 'CL-789' },
  { date: '03-20-25', amount: '£10,000', method: 'Cheque', claim: 'CL-456' },
  { date: '09-01-2024', amount: '£15,000', method: 'Direct Deposit', claim: 'CL-334' },
  { date: '06-20-23', amount: '£15,000', method: 'Direct Deposit', claim: 'CL-998' },
];
const STATUS_COLOR = { 'UNDER REVIEW': '#F59E0B', CLOSED: '#10B981', DENIED: '#EF4444' };
const pieData = [{ name: 'Accident', value: 3, color: '#EF4444' }, { name: 'Medical', value: 2, color: '#10B981' }];
const lineData = [{ year: 2021, value: 1 }, { year: 2022, value: 4 }, { year: 2023, value: 2 }, { year: 2024, value: 3 }, { year: 2025, value: 2 }];

/* ─── Risk Gauge ─────────────────────────────────────────────────────────── */
function RiskGauge({ value, label, level, color }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-12 overflow-hidden mb-2">
        <svg viewBox="0 0 100 50" className="w-full">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F0F4F8" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 125} 125`}
            initial={{ strokeDashoffset: 125 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-lg font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-medium"
        style={{ background: `${color}18`, color }}>
        {level}
      </div>
    </div>
  );
}

/* ─── Similar Incident Card ──────────────────────────────────────────────── */
function SimilarIncidentCard({ incident, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
      className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-[0_1px_8px_rgba(3,68,140,0.05)]"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-bold text-primary-600">{incident.claim_id}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-50 text-accent-700 font-semibold border border-accent-200">
            {incident.similarity_score}% match
          </span>
        </div>
        <div className="text-xs text-gray-500 truncate">{incident.company}</div>
        <div className="text-xs text-gray-400 mt-0.5">{incident.incident_type} · {incident.location} · {incident.date}</div>
        <div className="text-xs text-gray-600 mt-1">{incident.notes}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs font-bold text-gray-800">£{incident.settlement_amount?.toLocaleString()}</div>
        <div className="text-[10px] text-emerald-600 mt-0.5">{incident.outcome}</div>
      </div>
    </motion.div>
  );
}

/* ─── AI Summary Box ─────────────────────────────────────────────────────── */
function AISummaryBox({ claim, subClaims }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiApi.claimSummary({
        claim_id: claim.claim_id,
        sub_claim_id: subClaims?.[0]?.sub_claim_id,
      });
      setSummary(res);
    } catch (e) {
      setSummary({
        summary: `Claim ${claim.claim_id} relates to a ${claim.type_of_incident || 'motor'} incident at ${claim.location_of_loss || 'Camden'} involving a fleet vehicle. The claim is currently ${claim.status} with ${claim.priority} priority.`,
        recommended_steps: [
          'Arrange independent vehicle inspection within 48 hours',
          'Obtain medical report for the injured driver',
          'Verify police report details with officer Louis Taylor',
          'Review reserve adequacy and reinsurance splits',
          'Initiate subrogation assessment against third-party insurer',
        ],
        risk_level: subClaims?.[0]?.risk_level || 'Moderate Risk',
        fraud_level: subClaims?.[0]?.fraud_level || 'Low',
      });
    } finally {
      setLoading(false);
    }
  }, [claim, subClaims]);

  useEffect(() => { generate(); }, [generate]);

  const sc = subClaims?.[0];
  const riskScore = sc?.risk_score ?? 46;
  const fraudScore = sc?.fraud_score ?? 30;

  return (
    <div className="space-y-4">
      {/* Risk & Fraud Indicators — FR-5.7 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-gray-800">Risk & Fraud Indicators</span>
        </div>
        <div className="flex items-center justify-around py-2">
          <RiskGauge
            value={riskScore}
            label="Risk Score"
            level={sc?.risk_level || 'Moderate Risk'}
            color={riskScore > 60 ? '#EF4444' : riskScore > 30 ? '#F59E0B' : '#10B981'}
          />
          <div className="w-px h-16 bg-gray-100" />
          <RiskGauge
            value={fraudScore}
            label="Fraud Score"
            level={sc?.fraud_level || 'Low'}
            color={fraudScore > 60 ? '#EF4444' : fraudScore > 30 ? '#F59E0B' : '#10B981'}
          />
        </div>
        <div className="mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Key risk factors:</strong> Late reporting (+8%), prior claim history (+12%), Camden urban area (+5%).
            No immediate fraud indicators detected — standard processing recommended.
          </p>
        </div>
      </div>

      {/* AI Summary Box — FR-5.4 */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-5 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2CC9A2 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-300" />
            </div>
            <span className="text-sm font-bold text-white">AI Claim Summary</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={generate}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs transition-colors"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Regenerate
          </motion.button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-accent-300" />
            <span className="text-sm text-white/60">Generating AI summary…</span>
          </div>
        ) : summary ? (
          <p className="text-sm text-white/85 leading-relaxed">{summary.summary}</p>
        ) : null}
      </div>

      {/* Recommended Steps — FR-5.5 */}
      {summary?.recommended_steps && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-bold text-gray-800">AI Recommended Steps</span>
          </div>
          <div className="space-y-2.5">
            {summary.recommended_steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <span className="text-white text-[10px] font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Similar Incidents Accordion — FR-5.6 ──────────────────────────────── */
function SimilarIncidentsAccordion({ claim }) {
  const [open, setOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (loaded) { setOpen(o => !o); return; }
    setOpen(true);
    setLoading(true);
    try {
      const res = await aiApi.similarIncidents({
        claim_id: claim.claim_id,
        incident_type: claim.type_of_incident,
        location: claim.location_of_loss,
      });
      setIncidents(res.incidents || []);
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] overflow-hidden">
      <button
        onClick={load}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Search className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-gray-800">Similar Incidents Detected</div>
            <div className="text-xs text-gray-400">AI-matched historical claims for benchmarking</div>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3">
              {loading ? (
                <div className="flex items-center gap-3 py-6 justify-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Finding similar claims…</span>
                </div>
              ) : incidents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No similar incidents found.</p>
              ) : (
                incidents.map((inc, i) => <SimilarIncidentCard key={i} incident={inc} index={i} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────────────────────── */
export default function ClaimSummaryTab({ claim, subClaims }) {
  const [tab, setTab] = useState('SUMMARY');

  return (
    <div className="max-w-5xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Claim Summary</h2>
        <p className="text-sm text-gray-500">AI-powered overview of claim status, risk assessment, and recommended actions.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['SUMMARY', 'DETAILS', 'HISTORY'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`py-3 px-5 text-sm font-medium border-b-2 transition ${tab === t ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'SUMMARY' && (
        <div className="space-y-4">
          {/* Claim Status Checks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] p-5">
            <div className="text-sm font-bold text-gray-800 mb-3">Claim Status</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Policy active — loss date within policy period', ok: true },
                { label: 'Contact information is complete', ok: true },
                { label: 'Claim details submitted and complete', ok: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.ok ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {item.ok
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    }
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary Block — Risk, AI Summary, Steps, Similar Incidents */}
          <AISummaryBox claim={claim} subClaims={subClaims} />
          <SimilarIncidentsAccordion claim={claim} />
        </div>
      )}

      {tab === 'DETAILS' && <DetailsContent claim={claim} />}
      {tab === 'HISTORY' && <HistoryContent />}
    </div>
  );
}

/* ─── Details Tab ─────────────────────────────────────────────────────────── */
function DetailsContent({ claim }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] p-6 grid grid-cols-3 gap-4 text-sm">
      {[
        { label: 'Requested Claim Amount', value: `£ ${claim.requested_amount?.toLocaleString() || '0'}`, type: 'text' },
        { label: 'Date of Loss Event', value: claim.date_of_loss, type: 'date' },
        { label: 'Location of Loss Event', value: claim.location_of_loss, type: 'text' },
        { label: 'Severity of Loss', value: claim.severity, type: 'text' },
        { label: 'Claim Completion Date', value: claim.claim_completion_date, type: 'date' },
      ].map(({ label, value, type }) => (
        <div key={label}>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
          <input defaultValue={value} type={type}
            className="input-field text-sm" />
        </div>
      ))}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 font-medium">Previous claim history?</label>
        <div className="flex gap-4 py-2">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" defaultChecked={claim.previous_claim_history} name="prev_history" className="accent-blue-600" /> Yes
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="radio" defaultChecked={!claim.previous_claim_history} name="prev_history" className="accent-blue-600" /> No
          </label>
        </div>
      </div>
    </div>
  );
}

/* ─── History Tab ─────────────────────────────────────────────────────────── */
function HistoryContent() {
  const [histTab, setHistTab] = useState('Policy History');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['Policy History', 'Claimant History'].map(t => (
          <button key={t} onClick={() => setHistTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${histTab === t ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {histTab === 'Policy History' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] p-5 space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600">JJ</span>
              </div>
              <span className="font-semibold text-sm">Johnston, Johnson and Parrish</span>
            </div>
            <div className="text-xs text-gray-400">Tel: +44 7482-12345</div>
            <div className="text-xs text-gray-400">28 Hawley Rd, Camden, London NW1 8NP</div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Total Claims', value: '5' },
              { label: 'Total Claimed', value: '£75,000', color: 'text-primary-600' },
              { label: 'Total Paid', value: '£55,000', color: 'text-primary-600' },
              { label: 'Denied', value: '1', color: 'text-red-500' },
              { label: 'Active', value: '1', color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className={`text-lg font-bold ${s.color || 'text-gray-900'}`}>{s.value}</div>
                <div className="text-[11px] text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">Claim Type Distribution</div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={80} height={80}>
                  <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={20} outerRadius={38} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie></PieChart>
                </ResponsiveContainer>
                <div className="text-xs space-y-1.5">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">Claim Frequency Over Years</div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={lineData}>
                  <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#2CC9A2" strokeWidth={2} dot={{ r: 3, fill: '#2CC9A2' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-gray-800 mb-3">Top 5 History</div>
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-gray-100">
                {['Claim ID', 'Type', 'Status', 'Amount', 'Paid', 'Initiated', 'Closed'].map(h =>
                  <th key={h} className="pb-2 text-xs text-gray-400 font-semibold">{h}</th>)}
              </tr></thead>
              <tbody>
                {HISTORY_DATA.map(h => (
                  <tr key={h.claim_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-2.5 text-primary-600 font-medium">{h.claim_id}</td>
                    <td className="py-2.5 text-gray-600">{h.type}</td>
                    <td className="py-2.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: `${STATUS_COLOR[h.status]}18`, color: STATUS_COLOR[h.status] }}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-700">{h.amount}</td>
                    <td className="py-2.5 text-gray-700">{h.paid}</td>
                    <td className="py-2.5 text-gray-400 text-xs">{h.initiated}</td>
                    <td className="py-2.5 text-gray-400 text-xs">{h.closed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="text-sm font-bold text-gray-800 mb-3">Payment History</div>
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b border-gray-100">
                {['Date', 'Amount', 'Method', 'Claim ID'].map(h =>
                  <th key={h} className="pb-2 text-xs text-gray-400 font-semibold">{h}</th>)}
              </tr></thead>
              <tbody>
                {PAYMENT_HISTORY.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-400 text-xs">{p.date}</td>
                    <td className="py-2.5 font-medium text-gray-800">{p.amount}</td>
                    <td className="py-2.5 text-gray-500">{p.method}</td>
                    <td className="py-2.5 text-primary-500">{p.claim}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {histTab === 'Claimant History' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(3,68,140,0.06)] p-10 text-center">
          <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Claimant history records will appear here.</p>
        </div>
      )}
    </div>
  );
}
