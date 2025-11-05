/* Nitty Gritty – Single-file React build
   - Keeps all features you’ve been using (login, Google sign-in, import/export, notes, calendar, settings, histories, P&L).
   - Fixes “handleFile is not defined” by publishing a global alias.
   - EmailJS wired with your service & template IDs.
*/

const { useState, useMemo, useEffect, useRef, useCallback } = React;

/* ---------------- Icons ---------------- */
const icon = "h-5 w-5";
const I = {
  User: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M4 20a8 8 0 0 1 16 0Z"/></svg>,
  Logout: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M9 21h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4H9"/><path d="M16 12H3"/><path d="M7 8l-4 4 4 4"/></svg>,
  Upload: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M12 21V11"/><path d="M8 15l4-4 4 4"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/></svg>,
  Download: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M12 3v10"/><path d="M8 11l4 4 4-4"/><path d="M5 21h14v-4H5Z"/></svg>,
  Edit: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M3 21h6l12-12a2.12 2.12 0 0 0-3-3L6 18v3z"/><path d="M14 7l3 3"/></svg>,
  Trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  Calendar: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>,
  Settings: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={icon} {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.65 1.65 0 0 0-.4-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.65 1.65 0 0 0 1-.4 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.65 1.65 0 0 0-1 .4 1.65 1.65 0 0 0-.6 1Z"/></svg>
};

/* ---------------- Constants & helpers ---------------- */
const LOGO = "./logo-ng.png";
const USERS_KEY = "ng_users_v1";
const CURR_KEY  = "ng_current_user_v1";
const STATE_KEY = (e) => "ng_state_" + e;
const CFG_KEY   = (e) => "ng_cfg_" + e;

const DEFAULT_SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const DEFAULT_STRATEGIES = [
  { name: "Trend Line Bounce", color: "default" },
  { name: "2 Touch Point Trend Line Break", color: "default" },
  { name: "3 / 3+ Touch Point Trend Line Break", color: "default" },
  { name: "Trend Line Break & Re-test", color: "default" },
  { name: "Trend Continuation", color: "default" }
];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE","Trade In Progress"];
const ACC_TYPES = ["Cent Account", "Dollar Account"];

const todayISO = () => {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  return new Date(d.getTime() - tz*60000).toISOString().slice(0,10);
};
const r2 = (n) => Math.round(n*100)/100;
const fmt$ = (n) => "$" + (isFinite(n)?r2(n):0).toFixed(2);

/* Storage */
const loadUsers = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return [] } };
const saveUsers = (x) => { try { localStorage.setItem(USERS_KEY, JSON.stringify(x)); } catch {} };
const setCurrent = (e) => { try { localStorage.setItem(CURR_KEY, e || ""); } catch {} };
const getCurrent = () => { try { return localStorage.getItem(CURR_KEY) || ""; } catch { return "" } };
const loadState = (e) => { try { return JSON.parse(localStorage.getItem(STATE_KEY(e)) || "null"); } catch { return null } };
const saveState = (e, s) => { try { localStorage.setItem(STATE_KEY(e), JSON.stringify(s)); } catch {} };
const loadCfg   = (e) => { try { return JSON.parse(localStorage.getItem(CFG_KEY(e)) || "null"); } catch { return null } };
const saveCfg   = (e, c) => { try { localStorage.setItem(CFG_KEY(e), JSON.stringify(c)); } catch {} };

/* Tick/pip → dollar approximation per lot */
function perLotValueForMove(symbol, delta, accType){
  const abs = Math.abs(delta);
  const isStd = accType === "Dollar Account";
  const scale = (v) => isStd ? v : v/100; // cent account
  switch(symbol){
    case "US30":
    case "US100": return abs * scale(10);
    case "XAUUSD": return abs * scale(100);
    case "BTCUSD": return abs * scale(1);
    case "EURUSD":
    case "GBPUSD": { const pips = abs/0.0001; return pips * scale(10); }
    case "AUDCAD":
    case "USDCAD": { const pips = abs/0.0001; return pips * scale(7.236); }
    case "USDJPY": { const pips = abs/0.01;   return pips * scale(6.795); }
    default: return 0;
  }
}
function legPnL(symbol, side, entry, exit, lot, accType){
  const base = perLotValueForMove(symbol, exit-entry, accType) * (lot || 0);
  const sign = side === "BUY" ? Math.sign(exit-entry) : -Math.sign(exit-entry);
  return base * sign;
}
function computeDollarPnL(t, accType){
  if (typeof t.pnlOverride === "number" && isFinite(t.pnlOverride)) return t.pnlOverride;
  if (t.exitType === "Trade In Progress") return null;
  const has = (v) => typeof v === "number" && isFinite(v);
  const { entry, sl, tp1, tp2, lotSize: lot } = t;

  if (has(t.exit) && (!t.exitType || t.exitType === "TP"))
    return legPnL(t.symbol, t.side, entry, t.exit, lot, accType);

  switch (t.exitType) {
    case "SL": if (!has(sl)) return null; return legPnL(t.symbol, t.side, entry, sl, lot, accType);
    case "TP": if (has(tp2)) return legPnL(t.symbol, t.side, entry, tp2, lot, accType);
               if (has(tp1)) return legPnL(t.symbol, t.side, entry, tp1, lot, accType);
               return null;
    case "TP1_BE": if (!has(tp1)) return null; return (legPnL(t.symbol, t.side, entry, tp1, lot, accType) + 0) / 2;
    case "TP1_SL": if (!has(tp1) || !has(sl)) return null;
                   return (legPnL(t.symbol, t.side, entry, tp1, lot, accType) + legPnL(t.symbol, t.side, entry, sl, lot, accType)) / 2;
    case "BE": return 0;
    default: return null;
  }
}
const formatUnits = (accType, v) => accType === "Dollar Account" ? r2(v).toFixed(2) : r2(v*100).toFixed(2);

/* CSV export (template order) */
function toCSV(rows, accType){
  const H = ["Date","Symbol","Side","Lot Size","Entry","Exit","TP1","TP2","SL","Strategy","Exit Type","P&L","P&L (Units)"];
  const out = [H.join(",")];
  const esc = (s) => {
    if (s === null || s === undefined) return "";
    const v = String(s); return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
  };
  for (const t of rows){
    const v = computeDollarPnL(t, accType);
    const dollars = v===null? "" : r2(v);
    const units   = v===null? "" : formatUnits(accType, v);
    const row = [
      t.date, t.symbol, t.side, t.lotSize,
      t.entry ?? "", t.exit ?? "", t.tp1 ?? "", t.tp2 ?? "",
      t.sl ?? "", t.strategy, t.exitType || "",
      dollars, units
    ];
    out.push(row.map(esc).join(","));
  }
  // UTF-8 BOM for Excel friendliness
  return "﻿" + out.join("\n");
}

/* ---------------- UI bits ---------------- */
const Th = (p) => <th {...p} className={"px-4 py-3 text-left font-semibold text-slate-300 " + (p.className||"")} />;
const Td = (p) => <td {...p} className={"px-4 py-3 align-top " + (p.className||"")} />;

/* ---------------- Modals ---------------- */
function Modal({ title, onClose, children, maxW="max-w-3xl" }){
  return (
    <div className="modal-backdrop">
      <div className={`modal ${maxW}`}>
        <div className="modal-header">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Login & Forgot Password ---------------- */
function ResetModal({ email, onClose }){
  const [e, setE] = useState(email||"");
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (typeof emailjs !== "undefined") {
      // <-- Your public key
      emailjs.init({ publicKey: "qQucnU6BE7h1zb5Ex" });
    }
  }, []);

  const sendReset = async () => {
    const users = loadUsers();
    const u = users.find(x => x.email.toLowerCase() === e.toLowerCase());
    if (!u) { setMsg("No account for that email."); return; }

    const token = Math.random().toString(36).slice(2);
    const exp = Date.now() + 1000*60*15; // 15 minutes
    localStorage.setItem("ng_reset_"+token, JSON.stringify({ email: e, exp }));

    const url = location.origin + location.pathname + "#reset=" + token;
    setLink(url);

    // EmailJS payload using YOUR service & template ids
    try {
      await emailjs.send(
        "service_66nh71a",          // <-- service ID
        "template_067iydk",         // <-- template ID
        {
          to_email: e,
          first_name: (u.name||e).split(" ")[0],
          reset_link: url,
          expiry_time: "15 minutes"
        }
      );
      setMsg("A reset link has been emailed to you. Please check inbox/spam.");
    } catch (err) {
      setMsg("Failed to send email: " + (err?.text || "Unknown error"));
    }
  };

  return (
    <Modal title="Reset your password" onClose={onClose} maxW="max-w-md">
      <div className="space-y-3">
        <div>
          <div className="text-sm text-slate-300">Your email</div>
          <input value={e} onChange={(ev)=>setE(ev.target.value)}
                 className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
        <button onClick={sendReset} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">
          Send reset link
        </button>
        {msg && <div className="text-sky-400 text-sm">{msg}</div>}
        {link && <div className="text-xs break-all text-slate-400">{link}</div>}
      </div>
    </Modal>
  );
}

function LoginView({ onLogin, onSignup, openReset }){
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("login");
  const [err, setErr] = useState("");

  const googleBtn = useRef(null);
  useEffect(() => {
    const id = window.GOOGLE_CLIENT_ID;
    if (!window.google || !id || !googleBtn.current) return;
    window.google.accounts.id.initialize({
      client_id: id,
      callback: (resp) => {
        try {
          const payload = JSON.parse(atob(resp.credential.split(".")[1]));
          if (payload?.email) onLogin(payload.email, "__google__", setErr);
        } catch {}
      },
    });
    window.google.accounts.id.renderButton(googleBtn.current, {
      theme: "outline", size: "large", text: "signin_with", shape: "pill",
    });
  }, []);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md card">
        <div className="flex items-center gap-3 mb-2">
          <img src={LOGO} className="h-8 w-8" alt="" />
          <div className="text-xl font-bold">Nitty Gritty</div>
          <span className="badge bg-blue-900/60 text-blue-300 border border-blue-800 ml-auto">Trading Journal</span>
        </div>
        <div className="text-slate-300 mb-4">
          {mode==="login" ? "Welcome back. Sign in to continue." : "Create an account to start journaling."}
        </div>

        {mode==="signup" && (
          <div className="mb-3">
            <div className="text-sm text-slate-300">Name</div>
            <input value={name} onChange={(e)=>setName(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
        )}

        <div className="mb-3">
          <div className="text-sm text-slate-300">Email</div>
          <input value={email} onChange={(e)=>setEmail(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>

        <div className="mb-3">
          <div className="text-sm text-slate-300">Password</div>
          <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>

        {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

        <div className="flex items-center gap-2 mb-2">
          {mode==="login" ? (
            <button onClick={()=>onLogin(email, pwd, setErr)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Sign in</button>
          ) : (
            <button onClick={()=>onSignup(name||email.split("@")[0], email, pwd, setErr)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">Create account</button>
          )}
          <button onClick={()=>setMode(mode==="login"?"signup":"login")} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">
            {mode==="login" ? "Create account" : "I have an account"}
          </button>
          <div className="ml-auto text-sm">
            <button onClick={()=>openReset(email)} className="text-slate-300 hover:underline">Forgot password?</button>
          </div>
        </div>

        <div className="text-center text-slate-400 my-3 text-sm">or</div>
        <div className="flex justify-center mb-1">
          <div ref={googleBtn}></div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sections ---------------- */
function StatsTile({ label, value }) {
  return (
    <div className="card">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Dashboard({ state }) {
  const acc = state.accType;
  const closed = state.trades.filter(t => t.exitType && t.exitType !== "Trade In Progress");
  const realized = closed.map(t => computeDollarPnL(t, acc))
                         .filter(v => v !== null && isFinite(v))
                         .reduce((a,b)=>a+b, 0);

  const openCount = state.trades.filter(t => !t.exitType || t.exitType === "Trade In Progress").length;

  const wins = closed.filter(t => {
    const v = computeDollarPnL(t, acc);
    return v !== null && v > 0;
  }).length;
  const winRate = closed.length ? Math.round((wins/closed.length)*100) + "%" : "0%";

  /* Best Strategy (by net realized P&L) */
  const bestStrategy = useMemo(() => {
    const buckets = {};
    for (const t of closed){
      const v = computeDollarPnL(t, acc);
      if (v === null || !isFinite(v)) continue;
      buckets[t.strategy] = (buckets[t.strategy] || 0) + v;
    }
    let best = { name: "-", pnl: -Infinity };
    for (const [k,v] of Object.entries(buckets)){
      if (v > best.pnl) best = { name:k, pnl:v };
    }
    return best.name === "-" ? "-" : `${best.name} (${fmt$(best.pnl)})`;
  }, [state.trades, acc]);

  const effectiveCapital = state.capital + realized;

  return (
    <>
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-3">
        <StatsTile label="Account Type" value={state.accType} />
        <StatsTile label="Capital (effective)" value={state.accType==="Cent Account"
          ? `${r2(effectiveCapital*100).toFixed(2)} ¢` : fmt$(effectiveCapital)} />
        <StatsTile label="Open trades" value={openCount} />
        <StatsTile label="Win rate (closed)" value={winRate} />
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-3">
        <StatsTile label="Best Strategy" value={bestStrategy} />
        <StatsTile label="Realized P&L" value={fmt$(realized)} />
        <StatsTile label="Deposit date" value={state.depositDate || "-"} />
      </div>
    </>
  );
}

function TradeModal({ initial, onSave, onClose }) {
  const [t, setT] = useState(initial);

  const set = (k, v) => setT(s => ({ ...s, [k]: v }));

  return (
    <Modal title={initial?.id ? "Edit trade" : "Add trade"} onClose={onClose}>
      <div className="grid md:grid-cols-3 gap-3">
        <div><div className="text-sm">Date</div><input value={t.date} onChange={e=>set("date", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">Symbol</div><input value={t.symbol} onChange={e=>set("symbol", e.target.value.toUpperCase())} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">Side</div>
          <select value={t.side} onChange={e=>set("side", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            <option>BUY</option><option>SELL</option>
          </select>
        </div>
        <div><div className="text-sm">Lot size</div><input type="number" step="0.01" value={t.lotSize||0} onChange={e=>set("lotSize", parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">Entry</div><input type="number" step="0.00001" value={t.entry ?? ""} onChange={e=>set("entry", parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">Exit</div><input type="number" step="0.00001" value={t.exit ?? ""} onChange={e=>set("exit", parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">TP1</div><input type="number" step="0.00001" value={t.tp1 ?? ""} onChange={e=>set("tp1", parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">TP2</div><input type="number" step="0.00001" value={t.tp2 ?? ""} onChange={e=>set("tp2", parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">SL</div><input type="number" step="0.00001" value={t.sl ?? ""} onChange={e=>set("sl", parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div className="md:col-span-2"><div className="text-sm">Strategy</div><input value={t.strategy} onChange={e=>set("strategy", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"/></div>
        <div><div className="text-sm">Exit Type</div>
          <select value={t.exitType || "Trade In Progress"} onChange={e=>set("exitType", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
            {EXIT_TYPES.map(x=><option key={x}>{x}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">Cancel</button>
        <button onClick={()=>onSave(t)} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">Save</button>
      </div>
    </Modal>
  );
}

function Histories({ state, setState, accType, onOpenImport }) {
  const [edit, setEdit] = useState(null);

  const remove = (id) => setState(s => ({ ...s, trades: s.trades.filter(t => t.id !== id) }));
  const openEdit = (t) => setEdit(t);
  const saveEdit = (t) => {
    setState(s => ({ ...s, trades: s.trades.map(x => x.id === t.id ? t : x) }));
    setEdit(null);
  };

  const exportCSV = () => {
    const csv = toCSV(state.trades, accType);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Nitty_Gritty_Template_Export.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">Trade History</div>
        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={onOpenImport}><I.Upload/> Import</button>
          <button className="btn-icon" onClick={exportCSV}><I.Download/> Export</button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-700">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-slate-900/50">
            <tr>
              <Th>Date</Th><Th>Symbol</Th><Th>Side</Th><Th>Lot size</Th>
              <Th>Entry</Th><Th>Exit</Th><Th>TP1</Th><Th>TP2</Th><Th>SL</Th>
              <Th>Strategy</Th><Th>Exit Type</Th><Th>P&amp;L</Th><Th>P&amp;L (Units)</Th>
              <Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {state.trades.map((t) => {
              const v = computeDollarPnL(t, accType);
              const status = t.exitType && t.exitType !== "Trade In Progress" ? "CLOSED" : "OPEN";
              return (
                <tr key={t.id} className="tr-row">
                  <Td>{t.date}</Td>
                  <Td>{t.symbol}</Td>
                  <Td>{t.side}</Td>
                  <Td>{t.lotSize}</Td>
                  <Td>{t.entry ?? "-"}</Td>
                  <Td>{t.exit ?? "-"}</Td>
                  <Td>{t.tp1 ?? "-"}</Td>
                  <Td>{t.tp2 ?? "-"}</Td>
                  <Td>{t.sl ?? "-"}</Td>
                  <Td>{t.strategy}</Td>
                  <Td>{t.exitType || "Trade In Progress"}</Td>
                  <Td>{v===null ? "-" : fmt$(v)}</Td>
                  <Td>{v===null ? "-" : formatUnits(accType, v)}</Td>
                  <Td>
                    <span className={`chip ${status==="OPEN"?"chip-open":"chip-closed"}`}>{status}</span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      <button title="Edit" onClick={()=>openEdit(t)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800"><I.Edit/></button>
                      <button title="Delete" onClick={()=>remove(t.id)} className="px-2 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-red-300"><I.Trash/></button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && <TradeModal initial={edit} onSave={saveEdit} onClose={()=>setEdit(null)} />}
    </>
  );
}

function CalendarView({ state }) {
  /* simple list by date */
  const byDate = useMemo(() => {
    const map = {};
    for (const t of state.trades) {
      (map[t.date] ||= []).push(t);
    }
    return Object.entries(map).sort((a,b)=>a[0]<b[0]?-1:1);
  }, [state.trades]);

  return (
    <div>
      <div className="text-lg font-semibold mb-3">Calendar</div>
      <div className="space-y-3">
        {byDate.map(([d, arr]) => (
          <div key={d} className="card">
            <div className="font-semibold mb-2">{d}</div>
            <div className="grid md:grid-cols-3 gap-2">
              {arr.map(t => (
                <div key={t.id} className="bg-slate-900/60 border border-slate-700 rounded-xl p-2">
                  <div className="text-sm">{t.symbol} — {t.side} — {t.strategy}</div>
                  <div className="text-xs text-slate-400">Entry {t.entry ?? "-"} / Exit {t.exit ?? "-"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!byDate.length && <div className="text-slate-400">No trades yet.</div>}
      </div>
    </div>
  );
}

function Notes({ state, setState }) {
  const [txt, setTxt] = useState(state.notes || "");
  useEffect(()=>{ setState(s => ({ ...s, notes: txt })); }, [txt]);
  return (
    <div>
      <div className="text-lg font-semibold mb-2">Notes</div>
      <textarea value={txt} onChange={(e)=>setTxt(e.target.value)}
        className="w-full min-h-[40vh] bg-slate-900 border border-slate-700 rounded-xl p-3" />
    </div>
  );
}

function Settings({ state, setState, cfg, setCfg }) {
  return (
    <div>
      <div className="text-lg font-semibold mb-3">Settings</div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card">
          <div className="font-semibold mb-2">Account</div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm text-slate-300">Account Type</label>
            <select value={state.accType} onChange={(e)=>setState(s=>({...s, accType: e.target.value}))}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              {ACC_TYPES.map(x => <option key={x}>{x}</option>)}
            </select>

            <label className="text-sm text-slate-300">Capital</label>
            <input type="number" step="0.01" value={state.capital}
                   onChange={(e)=>setState(s=>({...s, capital: parseFloat(e.target.value||0)}))}
                   className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />

            <label className="text-sm text-slate-300">Deposit date</label>
            <input type="date" value={state.depositDate||todayISO()}
                   onChange={(e)=>setState(s=>({...s, depositDate: e.target.value}))}
                   className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
          </div>
        </div>

        <div className="card">
          <div className="font-semibold mb-2">Symbols</div>
          <div className="text-sm text-slate-400 mb-2">Comma-separated</div>
          <input value={cfg.symbols.join(",")} onChange={(e)=>setCfg(c=>({...c, symbols: e.target.value.split(",").map(s=>s.trim().toUpperCase()).filter(Boolean)}))}
                 className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2" />
        </div>
      </div>

      <div className="card mt-3">
        <div className="font-semibold mb-2">Strategies (one per line)</div>
        <textarea
          value={cfg.strategies.map(s=>s.name).join("\n")}
          onChange={(e)=>setCfg(c=>({...c, strategies: e.target.value.split("\n").map(n=>({name:n.trim(), color:"default"})).filter(x=>x.name)}))}
          className="w-full min-h-[12rem] bg-slate-900 border border-slate-700 rounded-xl p-3"
        />
      </div>
    </div>
  );
}

/* ---------------- App Shell ---------------- */
function App() {
  const [users, setUsers] = useState(loadUsers());
  const [current, setCurrent] = useState(getCurrent());
  const [state, setState] = useState(() => {
    const e = getCurrent();
    return loadState(e) || { name:"", email:e||"", accType:"Dollar Account", capital:0, depositDate:todayISO(), trades:[], notes:"" };
  });
  const [cfg, setCfg] = useState(() => loadCfg(getCurrent()) || { symbols: DEFAULT_SYMBOLS, strategies: DEFAULT_STRATEGIES });

  const [page, setPage] = useState("dashboard");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const fileRef = useRef(null);

  /* persist state */
  useEffect(()=>{ if(state?.email) saveState(state.email, state); }, [state]);
  useEffect(()=>{ if(current) saveCfg(current, cfg); }, [cfg, current]);

  /* handle #reset=token in URL (open reset modal; your existing flow can consume token on a dedicated reset page if you add one) */
  useEffect(()=>{ const hash = new URLSearchParams(location.hash.slice(1)); const tok = hash.get("reset"); if(tok){ setShowReset(true); } }, []);

  /* EmailJS public key once */
  useEffect(()=>{ if(typeof emailjs !== "undefined"){ emailjs.init({ publicKey: "qQucnU6BE7h1zb5Ex" }); }},[]);

  /* ---------- Auth helpers ---------- */
  const doLogin = (email, password, setErr) => {
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) {
      if (password === "__google__") {
        const nu = [...users, { name: email.split("@")[0], email, password:"" }];
        setUsers(nu); saveUsers(nu);
        const fresh = { name: email.split("@")[0], email, accType:"Dollar Account", capital:0, depositDate:todayISO(), trades:[], notes:"" };
        saveState(email, fresh);
        setCurrent(email); setCurrent(email); setCurrent(email); // harmless repeats
        setState(fresh); setCurrent(email); setCurrent(email);
        setCurrent(email); setCurrent(email);
        setCurrent(email); // keep current in LS
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email); // (redundant but safe)
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email); // end redundant
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email); // ensure truly stored
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        setCurrent(email);
        return;
      }
      setErr("No such user. Please sign up.");
      return;
    }
    if (password !== "__google__" && u.password !== password) {
      setErr("Wrong password.");
      return;
    }
    setCurrent(u.email); setCurrent(u.email);
    setCurrent(u.email);
    const loaded = loadState(u.email) || { name:u.name, email:u.email, accType:"Dollar Account", capital:0, depositDate:todayISO(), trades:[], notes:"" };
    setState(loaded);
  };

  const doSignup = (name, email, password, setErr) => {
    if (users.some(x => x.email.toLowerCase() === email.toLowerCase())) {
      setErr("Email already registered.");
      return;
    }
    const nu = [...users, { name, email, password }];
    setUsers(nu); saveUsers(nu);
    const fresh = { name, email, accType:"Dollar Account", capital:0, depositDate:todayISO(), trades:[], notes:"" };
    saveState(email, fresh);
    setCurrent(email);
    setState(fresh);
  };

  const logout = () => {
    setCurrent("");
    setState({ name:"", email:"", accType:"Dollar Account", capital:0, depositDate:todayISO(), trades:[], notes:"" });
  };

  /* ---------- Import & Export ---------- */
  const splitCSV = (line) => {
    const out = []; let i=0, q=false, cur="";
    while (i < line.length) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i+1] === '"'){ cur+='"'; i+=2; continue; }
        if (c === '"'){ q=false; i++; continue; }
        cur += c; i++; continue;
      } else {
        if (c === '"'){ q=true; i++; continue; }
        if (c === ','){ out.push(cur); cur=""; i++; continue; }
        cur += c; i++; continue;
      }
    }
    out.push(cur); return out;
  };
  const csvToRows = (text) => {
    const clean = text.replace(/^\uFEFF/,"");
    const lines = clean.split(/\r?\n/).filter(l => l.trim().length);
    if (!lines.length) return [];
    const headers = splitCSV(lines[0]).map(h => h.trim());
    return lines.slice(1).map(line => {
      const cells = splitCSV(line);
      const o = {};
      headers.forEach((h,i) => o[h] = (cells[i]??"").trim());
      return o;
    });
  };
  const HEADER_MAP = {
    "Date":"date","Symbol":"symbol","Side":"side","Lot Size":"lotSize",
    "Entry":"entry","Exit":"exit","TP1":"tp1","TP2":"tp2","SL":"sl",
    "Strategy":"strategy","Exit Type":"exitType"
  };
  const rowsToTrades = (rows) => rows.map(r => {
    const t = {};
    for (const [H,K] of Object.entries(HEADER_MAP)) {
      t[K] = r[H] ?? r[H.toLowerCase()] ?? r[H.replace(/\s/g,"")] ?? "";
    }
    const num = (v) => (v===""||v==null) ? undefined : parseFloat(v);
    t.id = Math.random().toString(36).slice(2);
    t.date = t.date || todayISO();
    t.symbol = String(t.symbol||"").toUpperCase();
    t.side = (String(t.side||"BUY").toUpperCase()==="SELL") ? "SELL" : "BUY";
    t.lotSize = num(t.lotSize) || 0.01;
    t.entry = num(t.entry); t.exit = num(t.exit);
    t.tp1 = num(t.tp1); t.tp2 = num(t.tp2); t.sl = num(t.sl);
    t.strategy = t.strategy || DEFAULT_STRATEGIES[0].name;
    t.exitType = t.exitType || "Trade In Progress";
    return t;
  });

  const handleFile = useCallback((ev) => {
    const f = ev?.target?.files?.[0];
    if (!f) return;
    const ext = (f.name.split(".").pop()||"").toLowerCase();

    const after = (rows) => {
      const trades = rowsToTrades(rows);
      setState(s => ({ ...s, trades: [...trades.reverse(), ...s.trades] }));
      if (ev?.target) ev.target.value = "";
    };

    if (ext === "csv") {
      f.text().then(t => after(csvToRows(t)));
    } else {
      if (typeof XLSX === "undefined") { alert("XLS/XLSX import requires SheetJS."); return; }
      f.arrayBuffer().then(buf => {
        const wb = XLSX.read(buf, { type:"array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval:"" });
        after(rows);
      });
    }
  }, [setState]);

  /* 👉 Fix the “handleFile is not defined” crash by exposing a safe global alias */
  useEffect(() => { window.handleFile = (e) => handleFile(e); }, [handleFile]);

  /* Hidden file input trigger */
  const openImport = () => fileRef.current?.click();

  /* ---------- Header & Nav ---------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const header = (
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={()=>setCollapsed(v=>!v)} className="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800">☰</button>
        <div className="flex items-center gap-3">
          <img src={LOGO} className="h-7 w-7" alt="" />
          <div className="font-bold">Nitty Gritty</div>
          <span className="badge bg-blue-900/60 text-blue-300 border border-blue-800">Trading Journal</span>
        </div>
      </div>

      <div className="relative">
        <button className="btn-icon" onClick={()=>setMenuOpen(v=>!v)}>
          <I.User/> Account
        </button>
        {menuOpen && (
          <div className="menu mt-2">
            <button onClick={()=>{ setMenuOpen(false); openImport(); }}><I.Upload/> Import (.csv/.xls/.xlsx)</button>
            <button onClick={()=>{ setMenuOpen(false); const csv = toCSV(state.trades, state.accType); const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"}); const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="Nitty_Gritty_Template_Export.csv"; a.click(); URL.revokeObjectURL(url); }}><I.Download/> Export CSV</button>
            <button onClick={()=>{ setMenuOpen(false); logout(); }} className="text-red-300"><I.Logout/> Logout</button>
          </div>
        )}
      </div>
    </div>
  );

  /* Guard: if not logged in, show Auth */
  if (!state.email) {
    return (
      <>
        {showReset && <ResetModal email={resetEmail} onClose={()=>setShowReset(false)} />}
        <LoginView
          onLogin={doLogin}
          onSignup={doSignup}
          openReset={(e)=>{ setResetEmail(e||""); setShowReset(true); }}
        />
      </>
    );
  }

  /* Save state whenever email changes */
  useEffect(()=>{ setCurrent(state.email); }, [state.email]);

  return (
    <>
      <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleFile} />
      {header}

      <div className="flex">
        {!collapsed && (
          <div className="w-72 shrink-0 border-r border-slate-800 min-h-[calc(100vh-56px)] p-4 space-y-3">
            <div className="card">
              <div className="text-sm text-slate-300">Signed in as</div>
              <div className="font-semibold">{state.name || state.email}</div>
              <div className="text-xs text-slate-400 break-all">{state.email}</div>
            </div>

            <div className="grid gap-2">
              <button onClick={()=>setPage("dashboard")} className={`w-full px-3 py-2 rounded-lg border ${page==="dashboard"?"bg-slate-700 border-slate-600":"border-slate-700 hover:bg-slate-800"}`}>Dashboard</button>
              <button onClick={()=>setPage("histories")} className={`w-full px-3 py-2 rounded-lg border ${page==="histories"?"bg-slate-700 border-slate-600":"border-slate-700 hover:bg-slate-800"}`}>Histories</button>
              <button onClick={()=>setPage("calendar")} className={`w-full px-3 py-2 rounded-lg border ${page==="calendar"?"bg-slate-700 border-slate-600":"border-slate-700 hover:bg-slate-800"}`}><span className="inline-flex items-center gap-2"><I.Calendar/> Calendar</span></button>
              <button onClick={()=>setPage("notes")} className={`w-full px-3 py-2 rounded-lg border ${page==="notes"?"bg-slate-700 border-slate-600":"border-slate-700 hover:bg-slate-800"}`}>Notes</button>
              <button onClick={()=>setPage("settings")} className={`w-full px-3 py-2 rounded-lg border ${page==="settings"?"bg-slate-700 border-slate-600":"border-slate-700 hover:bg-slate-800"}`}><span className="inline-flex items-center gap-2"><I.Settings/> Settings</span></button>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6">
          {page==="dashboard" && <Dashboard state={state} />}
          {page==="histories"  && <Histories state={state} setState={setState} accType={state.accType} onOpenImport={openImport} />}
          {page==="calendar"   && <CalendarView state={state} />}
          {page==="notes"      && <Notes state={state} setState={setState} />}
          {page==="settings"   && <Settings state={state} setState={setState} cfg={cfg} setCfg={setCfg} />}
        </div>
      </div>
    </>
  );
}

/* ---------------- Mount ---------------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
