/* global React, ReactDOM, google */
const { useState, useMemo, useEffect } = React;

/* ---------- Icons ---------- */
const iconCls = "h-5 w-5";
const IconUser = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/>
  </svg>
);
const IconDownload = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/>
  </svg>
);
const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/>
  </svg>
);
const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/>
  </svg>
);
const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconHistory = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M12 8v5l3 3"/><path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/>
  </svg>
);
const IconSettings = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1 .4 1.65 1.65 0 0 0-.6 1Z"/>
  </svg>
);
const IconHome = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconCls} {...p}>
    <path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/>
  </svg>
);

/* ---------- constants / helpers ---------- */
const LOGO_PUBLIC = "logo-ng.png";
const SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATEGIES = [
  "Trend Line Bounce",
  "2 Touch Point Trend Line Break",
  "3 / 3+ Touch Point Trend Line Break",
  "Trend Line Break & Re-test",
  "Trend Continuation"
];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE"];
const ACC_TYPES = ["Cent Account","Dollar Account"];

const r2 = (n) => Math.round(n * 100) / 100;
const fmt$ = (n) => "$" + (isFinite(n) ? r2(n) : 0).toFixed(2);
function todayISO() {
  const d = new Date(); const tz = d.getTimezoneOffset(); const l = new Date(d.getTime() - tz*60000);
  return l.toISOString().slice(0,10);
}

/* localStorage helpers */
function loadUsers(){ try{return JSON.parse(localStorage.getItem("ng_users_v1")||"[]");}catch{return[];} }
function saveUsers(u){ try{localStorage.setItem("ng_users_v1",JSON.stringify(u));}catch{} }
const CURRENT_USER_KEY="ng_current_user_v1";
function saveCurrentUserEmail(e){ try{localStorage.setItem(CURRENT_USER_KEY,e);}catch{} }
function getCurrentUserEmail(){ try{return localStorage.getItem(CURRENT_USER_KEY)||"";}catch{return"";} }
function loadUserState(e){ if(!e) return null; try{return JSON.parse(localStorage.getItem("ng_state_"+e)||"null");}catch{return null;} }
function saveUserState(e,s){ try{localStorage.setItem("ng_state_"+e,JSON.stringify(s));}catch{} }

/* P&L calculation */
function perLotValueForMove(symbol, priceDelta, accType) {
  const abs = Math.abs(priceDelta);
  const isStd = accType === "Dollar Account";
  const mult = (std) => (isStd ? std : std / 100);
  switch (symbol) {
    case "US30":
    case "US100": return abs * mult(10);
    case "XAUUSD": return abs * mult(100);
    case "BTCUSD": return abs * mult(1);
    case "EURUSD":
    case "GBPUSD": { const pips = abs / 0.0001; return pips * mult(10); }
    case "AUDCAD":
    case "USDCAD": { const pips = abs / 0.0001; return pips * mult(7.236); }
    case "USDJPY": { const pips = abs / 0.01;   return pips * mult(6.795); }
    default: return 0;
  }
}
function legPnL(symbol, side, entry, exit, lot, accType) {
  const raw = perLotValueForMove(symbol, exit - entry, accType) * (lot || 0);
  const sign = side === "BUY" ? Math.sign(exit - entry) : -Math.sign(exit - entry);
  return raw * sign;
}
function computeDollarPnL(t, accType) {
  if (typeof t.exit === "number" && (!t.exitType || t.exitType === "TP"))
    return legPnL(t.symbol, t.side, t.entry, t.exit, t.lotSize, accType);

  const has = (v) => typeof v === "number" && isFinite(v);
  const { entry, sl, tp1, tp2, lotSize: lot } = t;
  switch (t.exitType) {
    case "SL":     if (!has(sl))  return null; return legPnL(t.symbol, t.side, entry, sl,  lot, accType);
    case "TP":     if (has(tp2))  return legPnL(t.symbol, t.side, entry, tp2, lot, accType);
                   if (has(tp1))  return legPnL(t.symbol, t.side, entry, tp1, lot, accType);
                   return null;
    case "TP1_BE": if (!has(tp1)) return null; return (legPnL(t.symbol, t.side, entry, tp1, lot, accType) + 0) / 2;
    case "TP1_SL": if (!has(tp1) || !has(sl)) return null;
                   return (legPnL(t.symbol, t.side, entry, tp1, lot, accType) +
                           legPnL(t.symbol, t.side, entry, sl,  lot, accType)) / 2;
    case "BE":     return 0;
    default:       return null;
  }
}
function formatPnlDisplay(accType, pnlDollar) {
  return accType === "Cent Account" ? (r2(pnlDollar * 100)).toFixed(2) + " ¢" : fmt$(pnlDollar);
}
function formatUnits(accType, pnlDollar) {
  return accType === "Dollar Account" ? r2(pnlDollar).toFixed(2) : r2(pnlDollar * 100).toFixed(2);
}

/* CSV export (kept as-is) */
function toCSV(rows) {
  if (!rows.length) return "";
  const HEADERS = ["date","symbol","side","lotSize","entry","exit","tp1","tp2","sl","strategy","exitType","pnl_dollars","pnl_units"];
  const NL = "\r\n";       // fixed
  const BOM = "﻿";
  const esc = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [];
  lines.push(HEADERS.map(esc).join(","));
  for (const r of rows) lines.push(HEADERS.map((h)=>esc(r[h])).join(","));
  return BOM + lines.join(NL);
}

/* small UI helpers */
function Stat({ label, value }) {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-3">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
function Th({ children, className, ...rest }) {
  return <th {...rest} className={(className? className+" ":"")+"px-4 py-3 text-left font-semibold text-slate-300"}>{children}</th>;
}
function Td({ children, className, ...rest }) {
  return <td {...rest} className={(className? className+" ":"")+"px-4 py-3 align-top"}>{children}</td>;
}

/* Modal */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-3 ng-modal">
      <div className="relative w-[95vw] ng-modal-card bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* Account setup modal (unchanged behavior) */
function AccountSetupModal({ name, setName, accType, setAccType, capital, setCapital, depositDate, setDepositDate, onClose, email }) {
  const [tab, setTab] = useState('personal');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const savePassword = () => {
    if (!pw1 || pw1.length < 6) return setMsg('Password must be at least 6 characters.');
    if (pw1 !== pw2) return setMsg('Passwords do not match.');
    const users = loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === (email||'').toLowerCase());
    if (idx >= 0) { users[idx].password = pw1; saveUsers(users); setMsg('Password updated.'); setPw1(''); setPw2(''); }
  };
  return (
    <Modal title="Account Setup" onClose={onClose}>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('personal')} className={`px-3 py-1.5 rounded-lg border ${tab==='personal'?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={() => setTab('security')} className={`px-3 py-1.5 rounded-lg border ${tab==='security'?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
      </div>
      {tab === 'personal' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={(e)=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                {ACC_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Account Capital ($)</label>
              <input type="number" value={capital} onChange={(e)=>setCapital(parseFloat(e.target.value || '0'))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
            </div>
          </div>
          <div className="text-right">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Save & Close</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">New Password</label>
            <input type="password" value={pw1} onChange={(e)=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-slate-300">Confirm Password</label>
            <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
          {msg && <div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right">
            <button onClick={savePassword} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* Settings panel (unchanged behavior) */
function SettingsPanel({ name, setName, accType, setAccType, capital, setCapital, depositDate, setDepositDate, email }) {
  const [tab, setTab] = useState('personal');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const savePassword = () => {
    if (!pw1 || pw1.length < 6) return setMsg('Password must be at least 6 characters.');
    if (pw1 !== pw2) return setMsg('Passwords do not match.');
    const users = loadUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === (email||'').toLowerCase());
    if (idx >= 0) { users[idx].password = pw1; saveUsers(users); setMsg('Password updated.'); setPw1(''); setPw2(''); }
  };
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4"><IconSettings /><div className="font-semibold">Settings</div></div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('personal')} className={`px-3 py-1.5 rounded-lg border ${tab==='personal'?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Personal Info</button>
        <button onClick={() => setTab('security')} className={`px-3 py-1.5 rounded-lg border ${tab==='security'?"bg-slate-700 border-slate-600":"border-slate-700"}`}>Privacy & Security</button>
      </div>
      {tab==='personal' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300">Acc Type</label>
              <select value={accType} onChange={(e)=>setAccType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{ACC_TYPES.map(s => <option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Account Capital ($)</label>
              <input type="number" value={capital} onChange={(e)=>setCapital(parseFloat(e.target.value||'0'))} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm text-slate-300">Capital Deposit Date</label>
              <input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">New Password</label>
            <input type="password" value={pw1} onChange={(e)=>setPw1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-slate-300">Confirm Password</label>
            <input type="password" value={pw2} onChange={(e)=>setPw2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
          {msg && <div className="text-sky-400 text-sm">{msg}</div>}
          <div className="text-right">
            <button onClick={savePassword} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update Password</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Trade modal (wider + BUY/SELL colors) */
function TradeModal({ initial, onClose, onSave, onDelete, accType }) {
  const i = initial || {};
  const [symbol, setSymbol] = useState(i.symbol || SYMBOLS[0]);
  const [side, setSide] = useState(i.side || 'BUY');
  const [date, setDate] = useState(i.date || todayISO());
  const [lotSize, setLotSize] = useState(i.lotSize ?? 0.01);
  const [entry, setEntry] = useState(i.entry ?? '');
  const [exit, setExit] = useState(i.exit ?? '');
  const [tp1, setTp1] = useState(i.tp1 ?? '');
  const [tp2, setTp2] = useState(i.tp2 ?? '');
  const [sl, setSl] = useState(i.sl ?? '');
  const [strategy, setStrategy] = useState(i.strategy || STRATEGIES[0]);
  const [exitType, setExitType] = useState(i.exitType || 'TP');

  const num = (v) => (v === '' || v === undefined || v === null) ? undefined : parseFloat(v);
  const draft = useMemo(() => ({
    id: i.id, date, symbol, side,
    lotSize: parseFloat(lotSize || 0),
    entry: num(entry), exit: num(exit), tp1: num(tp1), tp2: num(tp2), sl: num(sl),
    strategy, exitType
  }), [i.id, date, symbol, side, lotSize, entry, exit, tp1, tp2, sl, strategy, exitType]);

  const preview = useMemo(() => {
    const v = computeDollarPnL(draft, accType);
    if (v === null || !isFinite(v)) return '-';
    return `${formatPnlDisplay(accType, v)} (${formatUnits(accType, v)})`;
  }, [draft, accType]);

  return (
    <Modal title={i.id ? 'Edit Trade' : 'Add Trade'} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-300">Symbol</label>
          <select value={symbol} onChange={(e)=>setSymbol(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{SYMBOLS.map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="text-sm text-slate-300">Action</label>
          <div className="mt-1 flex gap-2">
            <button onClick={()=>setSide('BUY')}  className={`flex-1 px-3 py-2 rounded-lg border btn-buy ${side==='BUY' ? 'active text-white' : ''}`}>BUY</button>
            <button onClick={()=>setSide('SELL')} className={`flex-1 px-3 py-2 rounded-lg border btn-sell ${side==='SELL' ? 'active text-white' : ''}`}>SELL</button>
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-300">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Lot size</label>
          <input type="number" step="0.01" value={lotSize} onChange={(e)=>setLotSize(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Entry price</label>
          <input type="number" step="0.0001" value={entry} onChange={(e)=>setEntry(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Exit Price</label>
          <input type="number" step="0.0001" value={exit} onChange={(e)=>setExit(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" placeholder="Leave blank for OPEN" />
        </div>
        <div>
          <label className="text-sm text-slate-300">TP 1</label>
          <input type="number" step="0.0001" value={tp1} onChange={(e)=>setTp1(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-300">TP 2</label>
          <input type="number" step="0.0001" value={tp2} onChange={(e)=>setTp2(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Stop-Loss</label>
          <input type="number" step="0.0001" value={sl} onChange={(e)=>setSl(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-300">Strategy</label>
          <select value={strategy} onChange={(e)=>setStrategy(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{STRATEGIES.map(s => <option key={s}>{s}</option>)}</select>
        </div>
        <div>
          <label className="text-sm text-slate-300">Exit Type</label>
          <select value={exitType} onChange={(e)=>setExitType(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">{EXIT_TYPES.map(s => <option key={s}>{s}</option>)}</select>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-300">P&L preview: <span className="font-semibold">{preview}</span></div>
        <div className="flex items-center gap-2">
          {i.id && (
            <button onClick={()=>onDelete(i.id)} className="px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-900/20">Delete</button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-700">Cancel</button>
          <button onClick={()=>onSave(draft)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save</button>
        </div>
      </div>
    </Modal>
  );
}

/* Calendar modal (smaller Year view + day red/green) */
function CalendarModal({ onClose, trades, view, setView, month, setMonth, year, setYear, selectedDate, setSelectedDate }) {
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDow = (y, m) => new Date(y, m, 1).getDay();

  const tradesByDate = useMemo(() => {
    const map = {};
    for (const t of trades) {
      map[t.date] = map[t.date] || [];
      map[t.date].push(t);
    }
    return map;
  }, [trades]);

  const dayColor = (iso) => {
    const list = tradesByDate[iso] || [];
    if (!list.length) return '';
    let sum = 0, any = false;
    for (const t of list) {
      const v = computeDollarPnL(t, t.accType || "Dollar Account"); // fallback
      if (v !== null && isFinite(v)) { sum += v; any = true; }
    }
    if (!any) return '';
    return sum > 0 ? 'border-green-600 bg-green-900/10' :
           sum < 0 ? 'border-red-600 bg-red-900/10' : 'border-slate-700';
  };

  return (
    <Modal title="Calendar" onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {['year','month','day'].map(v => (
            <button key={v} onClick={()=>setView(v)} className={`px-3 py-1.5 rounded-lg border ${view===v?'bg-slate-700 border-slate-600':'border-slate-700'}`}>{v.toUpperCase()}</button>
          ))}
        </div>
        {view !== 'day' && (
          <div className="flex items-center gap-2">
            <button onClick={()=> view==='month'
              ? (setMonth(m=> (m+11)%12), setYear(y=> y - (month===0?1:0)))
              : setYear(y=>y-1)} className="px-2 py-1 border border-slate-700 rounded-lg">◀</button>
            <div className="text-sm">{view==='month' ? `${monthNames[month]} ${year}` : year}</div>
            <button onClick={()=> view==='month'
              ? (setMonth(m=> (m+1)%12), setYear(y=> y + (month===11?1:0)))
              : setYear(y=>y+1)} className="px-2 py-1 border border-slate-700 rounded-lg">▶</button>
          </div>
        )}
      </div>

      {view === 'year' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {monthNames.map((mn, i) => (
            <div key={mn} className="ng-month-tile">
              <div className="ng-month-title">{mn}</div>
              <div className="text-slate-400 text-xs">
                Trades: {trades.filter(t => (new Date(t.date)).getMonth()===i && (new Date(t.date)).getFullYear()===year).length}
              </div>
              <button onClick={()=>{ setMonth(i); setView('month'); }}
                      className="mt-2 px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Open</button>
            </div>
          ))}
        </div>
      )}

      {view === 'month' && (
        <div>
          <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-1">{dayNames.map(d=> <div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:firstDow(year, month)}).map((_,i) => <div key={'e'+i} />)}
            {Array.from({length:daysInMonth(year, month)}).map((_,d) => {
              const day = String(d+1).padStart(2,'0');
              const iso = `${year}-${String(month+1).padStart(2,'0')}-${day}`;
              const items = tradesByDate[iso] || [];
              const colorCls = dayColor(iso);
              return (
                <button key={iso} onClick={()=>{ setSelectedDate(iso); setView('day'); }}
                        className={`text-left p-2 rounded-lg border ${colorCls || (items.length? 'border-blue-700/60 bg-blue-900/10' : 'border-slate-700 bg-slate-900/30')}`}>
                  <div className="text-xs text-slate-400">{d+1}</div>
                  {items.slice(0,3).map(it => (
                    <div key={it.id} className="truncate text-xs">{it.symbol} {it.side}</div>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div>
          <div className="text-sm text-slate-300 mb-2">{selectedDate}</div>
          {(tradesByDate[selectedDate]||[]).length===0 ? (
            <div className="text-slate-400 text-sm">No trades this day.</div>
          ) : (
            <div className="space-y-2">
              {(tradesByDate[selectedDate]||[]).map(t => (
                <div key={t.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                  <div className="text-sm"><span className="text-blue-300 font-medium">{t.symbol}</span> · {t.side} · Lot {t.lotSize}</div>
                  <div className="text-sm">{typeof t.entry==='number'?fmt$(t.entry):''} → {typeof t.exit==='number'?fmt$(t.exit):''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* Persisted state per user */
function usePersistedState(email) {
  const [state, setState] = useState(() => {
    const s = loadUserState(email || getCurrentUserEmail());
    return s || { name: "", email: email || "", accType: ACC_TYPES[1], capital: 0, depositDate: todayISO(), trades: [] };
  });
  useEffect(() => { if (state && state.email) saveUserState(state.email, state); }, [state]);
  return [state, setState];
}

/* User menu (top-right) */
function UserMenu({ onExport, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800"><IconUser /></button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
          <button onClick={()=>{ setOpen(false); onExport(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700"><IconDownload />Export CSV</button>
          <button onClick={()=>{ setOpen(false); onLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-red-300"><IconLogout />Logout</button>
        </div>
      )}
    </div>
  );
}

/* Login view with Google button (popup) */
function LoginView({ onLogin, onSignup }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    // Render Google button
    if (!window.google || !window.NG_GOOGLE_CLIENT_ID) return;
    google.accounts.id.initialize({
      client_id: window.NG_GOOGLE_CLIENT_ID,
      callback: (resp) => {
        try {
          const payload = JSON.parse(atob(resp.credential.split(".")[1]));
          const email = payload.email;
          const name = payload.name || payload.given_name || "";
          if (email) {
            // Auto-create user if new
            const users = loadUsers();
            const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!existing) {
              users.push({ name, email, password: "" });
              saveUsers(users);
              saveUserState(email, { name, email, accType: ACC_TYPES[1], capital: 0, depositDate: todayISO(), trades: [] });
            }
            saveCurrentUserEmail(email);
            window.location.replace(window.location.origin + window.location.pathname); // go to app
          }
        } catch (e) {
          console.error(e);
          setErr("Google sign-in failed.");
        }
      },
      ux_mode: "popup"
    });
    const btn = document.getElementById("gsi-btn");
    if (btn) {
      google.accounts.id.renderButton(btn, { theme: "outline", size: "large", width: 220 });
    }
  }, []);

  const submit = () => {
    setErr('');
    if (mode==='login') {
      if (!email || !password) return setErr('Fill all fields.');
      const u = loadUsers().find(x => x.email.toLowerCase() === email.toLowerCase());
      if (!u) return setErr('No such user. Please sign up.');
      if (u.password !== password) return setErr('Wrong password.');
      saveCurrentUserEmail(u.email);
      window.location.reload();
    } else {
      if (!name || !email || !password || !confirm) return setErr('Fill all fields.');
      if (password !== confirm) return setErr('Passwords do not match.');
      const users = loadUsers();
      if (users.some(x => x.email.toLowerCase() === email.toLowerCase())) return setErr('Email already registered.');
      users.push({ name, email, password }); saveUsers(users);
      saveUserState(email, { name, email, accType: ACC_TYPES[1], capital: 0, depositDate: todayISO(), trades: [] });
      saveCurrentUserEmail(email); window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
      <div className="w-[92vw] max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_PUBLIC} className="h-8 w-8" alt="" />
          <div className="text-xl font-semibold">Nitty Gritty</div>
        </div>
        <div className="mb-6 text-slate-300">
          <div className="text-2xl font-semibold">Trade smart. Learn smarter.</div>
          <div className="text-sm mt-1 text-slate-400">“Discipline is choosing what you want most over what you want now.”</div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('login')} className={`flex-1 px-3 py-2 rounded-lg border ${mode==='login'? 'bg-slate-700 border-slate-600':'border-slate-700'}`}>Login</button>
          <button onClick={()=>setMode('signup')} className={`flex-1 px-3 py-2 rounded-lg border ${mode==='signup'? 'bg-slate-700 border-slate-600':'border-slate-700'}`}>Sign up</button>
        </div>
        {mode==='signup' && (
          <div className="mb-3">
            <label className="text-sm text-slate-300">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
        )}
        <div className="mb-3">
          <label className="text-sm text-slate-300">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="text-sm text-slate-300">Password</label>
          <div className="mt-1 flex gap-2">
            <input type={showPw? 'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
            <button onClick={()=>setShowPw(v=>!v)} className="px-3 py-2 rounded-lg border border-slate-700">{showPw? 'Hide':'Show'}</button>
          </div>
        </div>
        {mode==='signup' && (
          <div className="mb-4">
            <label className="text-sm text-slate-300">Confirm Password</label>
            <input type={showPw? 'text':'password'} value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
        )}
        {err && <div className="text-red-400 text-sm mb-3">{err}</div>}
        <div className="flex items-center justify-between">
          <div id="gsi-btn"></div>
          <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Continue</button>
        </div>
        <div className="mt-3 text-right text-slate-400 text-sm">
          Forgot password? Use “Sign up” with the same email to reset locally.
        </div>
      </div>
    </div>
  );
}

/* General stats */
function GeneralStats({ trades, accType, capital, depositDate }) {
  const realized = trades.filter(t => new Date(t.date) >= new Date(depositDate) && t.exitType);
  const pnl = realized.map(t => computeDollarPnL(t, accType)).filter(v => v !== null && isFinite(v));
  const total = pnl.reduce((a,b)=>a+b,0);
  const wins = pnl.filter(v=>v>0).length;
  const losses = pnl.filter(v=>v<0).length;
  const open = trades.filter(t => !t.exitType && (t.exit===undefined || t.exit===null)).length;
  const wr = (wins+losses)>0 ? Math.round((wins/(wins+losses))*100) : 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Capital" value={accType==='Cent Account' ? `${r2(capital*100).toFixed(2)} ¢` : fmt$(capital)} />
      <Stat label="Realized P&L" value={formatPnlDisplay(accType, total)} />
      <Stat label="Win Rate" value={`${wr}%`} />
      <Stat label="Open" value={open} />
    </div>
  );
}

/* Detailed stats */
function DetailedStats({ trades, accType }) {
  const bySym = useMemo(() => {
    const map = {};
    for (const t of trades) {
      const k = t.symbol || 'N/A';
      const v = computeDollarPnL(t, accType);
      const s = map[k] || { count:0, pnl:0 };
      s.count += 1;
      s.pnl += (v && isFinite(v)) ? v : 0;
      map[k] = s;
    }
    return Object.entries(map).map(([sym, v]) => ({ sym, count: v.count, pnl: v.pnl }));
  }, [trades, accType]);
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="text-sm font-semibold mb-2">Detailed Statistics</div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm ng-table">
          <thead>
            <tr>
              <Th>Symbol</Th><Th>Trades</Th><Th>Total P&L</Th><Th>P&L (Units)</Th>
            </tr>
          </thead>
          <tbody>
            {bySym.map(r => (
              <tr key={r.sym} className="border-t border-slate-700">
                <Td>{r.sym}</Td>
                <Td>{r.count}</Td>
                <Td>{formatPnlDisplay(accType, r.pnl)}</Td>
                <Td>{formatUnits(accType, r.pnl)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Histories with sidebar toggle */
function Histories({ trades, accType, onEdit, onDelete, onToggleSidebar }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Trade History</div>
        <button onClick={onToggleSidebar} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 text-xs">Toggle Sidebar</button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm ng-table">
          <thead>
            <tr>
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th><Th>Entry</Th><Th>Exit</Th>
              <Th>TP1</Th><Th>TP2</Th><Th>SL</Th><Th>Exit Type</Th><Th>P&L</Th><Th>P&L (Units)</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t => {
              const v = computeDollarPnL(t, accType);
              const closed = !!t.exitType;
              return (
                <tr key={t.id} className="border-t border-slate-700">
                  <Td>{t.date}</Td><Td>{t.symbol}</Td><Td>{t.side}</Td><Td>{t.lotSize}</Td>
                  <Td>{typeof t.entry==='number'? t.entry:''}</Td>
                  <Td>{typeof t.exit==='number'? t.exit:''}</Td>
                  <Td>{typeof t.tp1==='number'? t.tp1:''}</Td>
                  <Td>{typeof t.tp2==='number'? t.tp2:''}</Td>
                  <Td>{typeof t.sl==='number'? t.sl:''}</Td>
                  <Td>{t.exitType||''}</Td>
                  <Td className={v>0? 'text-green-400': v<0? 'text-red-400':''}>{v===null? '-': formatPnlDisplay(accType, v)}</Td>
                  <Td className={v>0? 'text-green-400': v<0? 'text-red-400':''}>{v===null? '-': formatUnits(accType, v)}</Td>
                  <Td>{closed? 'CLOSED':'OPEN'}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={()=>onEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-700">✎</button>
                      <button onClick={()=>onDelete(t.id)} className="px-2 py-1 rounded-lg border border-red-700 text-red-300 hover:bg-red-900/20">✕</button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* App shell: topbar + collapsible sidebar */
function AppShell({ children, onExport, onLogout, capitalPanel, nav, logoSrc, sidebarHidden, setSidebarHidden }) {
  return (
    <div className={`ng-shell ${sidebarHidden ? 'sidebar-hidden' : ''}`}>
      <aside className="ng-sidebar w-72 shrink-0 border-r border-slate-800 min-h-screen p-4 space-y-4">
        <div className="flex items-center gap-3">
          <img src={logoSrc} className="h-8 w-8" alt="logo" />
          <div className="text-lg font-semibold">Nitty Gritty</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">{capitalPanel}</div>
        <div className="space-y-2">{nav}</div>
      </aside>
      <main className="flex-1">
        <div className="ng-topbar flex items-center justify-between px-4 py-2">
          <button onClick={()=>setSidebarHidden(v=>!v)} className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs">Toggle Sidebar</button>
          <UserMenu onExport={onExport} onLogout={onLogout} />
        </div>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}

/* -------- App -------- */
function App() {
  const [currentEmail, setCurrentEmail] = useState(getCurrentUserEmail());
  const [users, setUsers] = useState(loadUsers());
  const [state, setState] = usePersistedState(currentEmail);
  const [page, setPage] = useState('dashboard');
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showAcctModal, setShowAcctModal] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [calView, setCalView] = useState('month');
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calSel, setCalSel] = useState(todayISO());
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => { if (state && (!state.name || !state.depositDate)) setShowAcctModal(true); }, [state?.email]);

  const openTrades = state.trades.filter(t => !t.exitType && (t.exit===undefined || t.exit===null)).length;
  const realizedForCapital = state.trades.filter(t => new Date(t.date) >= new Date(state.depositDate) && t.exitType)
    .map(t => computeDollarPnL(t, state.accType)).filter(v => v !== null && isFinite(v)).reduce((a,b)=>a+b,0);
  const effectiveCapital = state.capital + realizedForCapital;

  const onExport = () => {
    const rows = state.trades.map(t => {
      const d = computeDollarPnL(t, state.accType);
      return { ...t, pnl_dollars: d===null? "" : r2(d), pnl_units: d===null? "" : (state.accType === "Cent Account" ? r2(d*100) : r2(d)) };
    });
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nitty_gritty_trades.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const onLogout = () => { saveCurrentUserEmail(""); setCurrentEmail(""); };

  const login = (email, password, setErr) => {
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return setErr('No such user. Please sign up.');
    if (u.password !== password) return setErr('Wrong password.');
    setErr(''); saveCurrentUserEmail(u.email); setCurrentEmail(u.email);
  };

  const signup = (name, email, password, setErr) => {
    if (users.some(x => x.email.toLowerCase() === email.toLowerCase())) return setErr('Email already registered.');
    const u = { name, email, password };
    const nu = [...users, u];
    setUsers(nu); saveUsers(nu);
    const fresh = { name, email, accType: ACC_TYPES[1], capital: 0, depositDate: todayISO(), trades: [] };
    saveUserState(email, fresh); saveCurrentUserEmail(email); setCurrentEmail(email);
  };

  const addOrUpdateTrade = (draft) => {
    const id = draft.id || Math.random().toString(36).slice(2);
    const arr = state.trades.slice();
    const idx = arr.findIndex(t => t.id === id);
    const rec = { ...draft, id };
    if (idx >= 0) arr[idx] = rec; else arr.unshift(rec);
    setState({ ...state, trades: arr });
    setShowTradeModal(false); setEditItem(null);
  };
  const deleteTrade = (id) => setState({ ...state, trades: state.trades.filter(t => t.id !== id) });

  if (!currentEmail) return <LoginView onLogin={login} onSignup={signup} />;

  const navBtn = (label, pageKey, Icon) => (
    <button onClick={()=>setPage(pageKey)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${page===pageKey? 'bg-slate-700 border-slate-600':'border-slate-700 hover:bg-slate-800'}`}>
      {Icon ? <Icon/> : null}<span>{label}</span>
    </button>
  );

  const capitalPanel = (
    <div>
      <div className="text-sm text-slate-300">Account Type</div>
      <div className="font-semibold mb-3">{state.accType}</div>
      <div className="text-sm text-slate-300">Capital</div>
      <div className="text-2xl font-bold mb-1">{state.accType==='Cent Account' ? `${r2(effectiveCapital*100).toFixed(2)} ¢` : fmt$(effectiveCapital)}</div>
      <div className="text-xs text-slate-400">Deposit: {state.depositDate}</div>
      <div className="mt-3 text-sm text-slate-300">Open trades</div>
      <div className="text-lg font-semibold">{openTrades}</div>
      <div className="pt-2"><button onClick={()=>setShowAcctModal(true)} className="w-full px-3 py-2 rounded-lg border border-slate-700">Account Setup</button></div>
      <div className="pt-2"><button onClick={()=>{ setEditItem(null); setShowTradeModal(true); }} className="w-full px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-2"><IconPlus/>Add trade</button></div>
    </div>
  );

  const nav = (
    <>
      {navBtn('Dashboard','dashboard',IconHome)}
      {navBtn('Histories','histories',IconHistory)}
      <button onClick={()=>{ setShowCal(true); setCalView('month'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800"><IconCalendar/>Calendar</button>
      {navBtn('Settings','settings',IconSettings)}
    </>
  );

  return (
    <AppShell onExport={onExport} onLogout={onLogout} capitalPanel={capitalPanel} nav={nav}
              logoSrc={LOGO_PUBLIC} sidebarHidden={sidebarHidden} setSidebarHidden={setSidebarHidden}>
      {page==='dashboard' && (
        <div className="space-y-4">
          <div className="text-sm font-semibold">General statistics</div>
          <GeneralStats trades={state.trades} accType={state.accType} capital={state.capital} depositDate={state.depositDate} />
          <DetailedStats trades={state.trades} accType={state.accType} />
        </div>
      )}
      {page==='histories' && (
        <Histories trades={state.trades} accType={state.accType}
                   onEdit={(t)=>{ setEditItem(t); setShowTradeModal(true); }}
                   onDelete={deleteTrade}
                   onToggleSidebar={()=>setSidebarHidden(v=>!v)} />
      )}
      {page==='settings' && (
        <SettingsPanel name={state.name} setName={(v)=>setState({...state, name:v})}
                       accType={state.accType} setAccType={(v)=>setState({...state, accType:v})}
                       capital={state.capital} setCapital={(v)=>setState({...state, capital: v||0})}
                       depositDate={state.depositDate} setDepositDate={(v)=>setState({...state, depositDate:v})}
                       email={state.email} />
      )}

      {showTradeModal && (
        <TradeModal initial={editItem} onClose={()=>{ setShowTradeModal(false); setEditItem(null); }}
                    onSave={addOrUpdateTrade} onDelete={deleteTrade} accType={state.accType} />
      )}
      {showAcctModal && (
        <AccountSetupModal name={state.name} setName={(v)=>setState({...state, name:v})}
                           accType={state.accType} setAccType={(v)=>setState({...state, accType:v})}
                           capital={state.capital} setCapital={(v)=>setState({...state, capital:v||0})}
                           depositDate={state.depositDate} setDepositDate={(v)=>setState({...state, depositDate:v})}
                           onClose={()=>setShowAcctModal(false)} email={state.email} />
      )}
      {showCal && (
        <CalendarModal onClose={()=>setShowCal(false)} trades={state.trades} view={calView} setView={setCalView}
                       month={calMonth} setMonth={setCalMonth} year={calYear} setYear={setCalYear}
                       selectedDate={calSel} setSelectedDate={setCalSel} />
      )}
    </AppShell>
  );
}

/* Mount */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
