import React, { useMemo, useState, useEffect } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";

/* ---------- Utilities & constants ---------- */
const LOGO = "logo-ng.png";
const SYMBOLS = ["XAUUSD","US100","US30","EURUSD","BTCUSD","AUDCAD","USDCAD","USDJPY","GBPUSD"];
const STRATS = ["Trend Line Bounce","2 Touch Point Trend Line Break","3 / 3+ Touch Point Trend Line Break","Trend Line Break & Re-test","Trend Continuation"];
const EXIT_TYPES = ["TP","SL","TP1_BE","TP1_SL","BE"];
const ACC_TYPES = ["Cent Account","Dollar Account"];

const r2 = n => Math.round((Number(n)||0)*100)/100;
const isoToday = () => new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const fmt$ = n => "$"+(isFinite(n)? r2(n).toFixed(2) : "0.00");

/* Storage helpers (per-user) */
const KEY_USERS="ng_users_v1", KEY_CUR="ng_current_user_v1";
const uload = () => JSON.parse(localStorage.getItem(KEY_USERS)||"[]");
const usave = v => localStorage.setItem(KEY_USERS, JSON.stringify(v));
const setCur = e => localStorage.setItem(KEY_CUR, e || "");
const getCur = () => localStorage.getItem(KEY_CUR)||"";
const loadState = e => JSON.parse(localStorage.getItem("ng_state_"+e)||"null");
const saveState = (e,s) => localStorage.setItem("ng_state_"+e, JSON.stringify(s||{}));

/* P&L rules */
function perLotValueMove(symbol, delta, accType){
  const abs = Math.abs(delta);
  const isStd = accType === "Dollar Account";
  const m = std => isStd ? std : std/100;
  switch(symbol){
    case "US30":
    case "US100": return abs * m(10);
    case "XAUUSD": return abs * m(100);
    case "BTCUSD": return abs * m(1);
    case "EURUSD":
    case "GBPUSD": return (abs/0.0001) * m(10);
    case "AUDCAD":
    case "USDCAD": return (abs/0.0001) * m(7.236);
    case "USDJPY":  return (abs/0.01)   * m(6.795);
    default: return 0;
  }
}
function leg(symbol, side, entry, exit, lot, acc){
  const raw = perLotValueMove(symbol, exit-entry, acc) * (lot||0);
  const sign = side==="BUY" ? Math.sign(exit-entry) : -Math.sign(exit-entry);
  return raw*sign;
}
function pnlDollar(t, acc){
  if (typeof t.exit==="number" && (!t.exitType || t.exitType==="TP"))
    return leg(t.symbol,t.side,t.entry,t.exit,t.lotSize,acc);
  const ok = v => typeof v==="number" && isFinite(v);
  const {entry, sl, tp1, tp2, lotSize:lot} = t;
  switch(t.exitType){
    case "SL":     if(!ok(sl))return null;  return leg(t.symbol,t.side,entry,sl, lot,acc);
    case "TP":     if(ok(tp2))return leg(t.symbol,t.side,entry,tp2,lot,acc);
                   if(ok(tp1))return leg(t.symbol,t.side,entry,tp1,lot,acc);
                   return null;
    case "TP1_BE": if(!ok(tp1))return null; return (leg(t.symbol,t.side,entry,tp1,lot,acc)+0)/2;
    case "TP1_SL": if(!ok(tp1)||!ok(sl))return null; return (leg(t.symbol,t.side,entry,tp1,lot,acc)+leg(t.symbol,t.side,entry,sl,lot,acc))/2;
    case "BE":     return 0;
    default:       return null;
  }
}
const displayPnL = (acc,v)=> acc==="Cent Account" ? (r2(v*100)).toFixed(2)+" ¢" : fmt$(v);
const unitsPnL   = (acc,v)=> acc==="Dollar Account" ? r2(v).toFixed(2) : r2(v*100).toFixed(2);

/* CSV (kept as current until you confirm template columns) */
function toCSV(rows){
  if(!rows.length) return "";
  const H=["date","symbol","side","lotSize","entry","exit","tp1","tp2","sl","strategy","exitType","pnl_dollars","pnl_units"];
  const esc=s=>s==null?"":(/[",\n]/.test(String(s))?'"'+String(s).replace(/"/g,'""')+'"':s);
  const lines=[H.join(",")];
  rows.forEach(r=>{
    const d=pnlDollar(r,r._accType);
    lines.push(H.map(h=>{
      if(h==="pnl_dollars") return r2(d||0);
      if(h==="pnl_units")   return unitsPnL(r._accType,d||0);
      return esc(r[h]);
    }).join(","));
  });
  return "\ufeff"+lines.join("\n");
}

/* ---------- Components ---------- */
const Icon = {
  user: (<svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M4 20a8 8 0 0 1 16 0Z"/></svg>),
  home: (<svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 10.5 12 3l9 7.5"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M5 9v12h14V9"/></svg>),
  hist: (<svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 8v5l3 3"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 3a9 9 0 1 0 9 9"/><path fill="none" stroke="currentColor" stroke-width="1.8" d="M21 3v6h-6"/></svg>),
  cal:  (<svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M8 3v4M16 3v4"/><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>),
  set:  (<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M19.4 15a1.7 1.7 0 0 0 .4 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V22a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.6 16.9l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 6.24 2.9l.06.06A1.7 1.7 0 0 0 8 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V2a2 2 0 1 1 4 0v.1c0 .38.14.74.4 1 .26.26.62.4 1 .4.62 0 1.22-.25 1.64-.68l.06-.06A2 2 0 1 1 21.1 6.24l-.06.06c-.26.26-.4.62-.4 1s.14.74.4 1c.26.26.62.4 1 .4H22a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1 .4 1.7 1.7 0 0 0-.6 1Z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>)
};

/* Top user menu */
function UserMenu({onExport,onLogout}){
  const [open,setOpen]=React.useState(false);
  return (
    <div className="user-menu">
      <button onClick={()=>setOpen(o=>!o)}>{Icon.user}</button>
      {open && (
        <div className="menu">
          <a className="item" href="#" onClick={(e)=>{e.preventDefault();setOpen(false);onExport();}}>⬇️ Export CSV</a>
          <a className="item" href="#" onClick={(e)=>{e.preventDefault();setOpen(false);onLogout();}} style="color:#ffb4b4">⏻ Logout</a>
        </div>
      )}
    </div>
  );
}

/* Login view with GIS */
function Login({onEmailLogin,onSignup,onGoogle}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState(""); const [pw,setPw]=useState("");
  const [name,setName]=useState(""); const [confirm,setConfirm]=useState("");
  const [err,setErr]=useState("");

  useEffect(()=>{
    if(!window.google || !window.NG_GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: window.NG_GOOGLE_CLIENT_ID,
      callback: cred => onGoogle(cred)
    });
    // render a hidden official button so Google can open its flow reliably
    const c = document.getElementById("g-btn");
    if (c) window.google.accounts.id.renderButton(c,{theme:"outline",size:"large",width:240});
  },[]);

  const submit=()=>{
    setErr("");
    if(mode==="login"){
      if(!email||!pw) return setErr("Fill all fields.");
      onEmailLogin(email,pw,setErr);
    }else{
      if(!name||!email||!pw||!confirm) return setErr("Fill all fields.");
      if(pw!==confirm) return setErr("Passwords do not match.");
      onSignup(name,email,pw,setErr);
    }
  };
  return (
    <div className="login-shell">
      <div className="login-wrap">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <img src={LOGO} alt="" width="32" height="32"/><div style="font-weight:800;font-size:18px">Nitty Gritty</div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <button onClick={()=>setMode("login")} style={mode==="login"?"background:#152038":""}>Login</button>
          <button onClick={()=>setMode("signup")} style={mode==="signup"?"background:#152038":""}>Sign up</button>
        </div>
        {mode==="signup" && (<div style="margin-bottom:10px"><label>Name</label><input value={name} onInput={e=>setName(e.target.value)} /></div>)}
        <div style="margin-bottom:10px"><label>Email</label><input value={email} onInput={e=>setEmail(e.target.value)} /></div>
        <div style="margin-bottom:10px"><label>Password</label><input type="password" value={pw} onInput={e=>setPw(e.target.value)} /></div>
        {mode==="signup" && (<div style="margin-bottom:10px"><label>Confirm Password</label><input type="password" value={confirm} onInput={e=>setConfirm(e.target.value)} /></div>)}
        {err && <div style={{color:"#ff8c8c",marginBottom:"10px"}}>{err}</div>}
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div id="g-btn"></div>
          <button style="background:var(--brand);border-color:var(--brand-2)" onClick={submit}>Continue</button>
        </div>
        <div style="margin-top:10px;color:var(--muted);font-size:12px">Tip: If Google shows “no registered origin”, add <b>https://aneryerrr.github.io</b> to Authorized JavaScript origins in Google Cloud.</div>
      </div>
    </div>
  );
}

/* Modal */
function Modal({title,children,onClose}){
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div style="font-weight:700">{title}</div>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/* Trade modal (wider/shorter; BUY green / SELL red) */
function TradeModal({initial,accType,onClose,onSave,onDelete}){
  const i = initial||{};
  const [symbol,setSymbol]=useState(i.symbol||SYMBOLS[0]);
  const [side,setSide]=useState(i.side||"BUY");
  const [date,setDate]=useState(i.date||isoToday());
  const [lot,setLot]=useState(i.lotSize??0.01);
  const [entry,setEntry]=useState(i.entry??"");
  const [exit,setExit]=useState(i.exit??"");
  const [tp1,setTp1]=useState(i.tp1??"");
  const [tp2,setTp2]=useState(i.tp2??"");
  const [sl,setSl]=useState(i.sl??"");
  const [strategy,setStrategy]=useState(i.strategy||STRATS[0]);
  const [exitType,setExitType]=useState(i.exitType||"TP");
  const num=v=>v===""||v==null?undefined:parseFloat(v);
  const draft = { id:i.id, date, symbol, side, lotSize:parseFloat(lot||0), entry:num(entry), exit:num(exit), tp1:num(tp1), tp2:num(tp2), sl:num(sl), strategy, exitType };
  const preview = useMemo(()=>{ const v=pnlDollar(draft,accType); return v==null?"-":`${displayPnL(accType,v)} (${unitsPnL(accType,v)})`;},[draft,accType]);
  return (
    <Modal title={i.id?"Edit Trade":"Add Trade"} onClose={onClose}>
      <div className="grid-2">
        <div><label>Symbol</label><select value={symbol} onChange={e=>setSymbol(e.target.value)}>{SYMBOLS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div>
          <label>Action</label>
          <div style="display:flex;gap:8px">
            <button className={"btn-buy "+(side==="BUY"?"active":"")} onClick={()=>setSide("BUY")}>BUY</button>
            <button className={"btn-sell "+(side==="SELL"?"active":"")} onClick={()=>setSide("SELL")}>SELL</button>
          </div>
        </div>
        <div><label>Date</label><input type="date" value={date} onInput={e=>setDate(e.target.value)} /></div>
        <div><label>Lot size</label><input type="number" step="0.01" value={lot} onInput={e=>setLot(e.target.value)} /></div>
        <div><label>Entry price</label><input type="number" step="0.0001" value={entry} onInput={e=>setEntry(e.target.value)} /></div>
        <div><label>Exit Price</label><input type="number" step="0.0001" value={exit} onInput={e=>setExit(e.target.value)} placeholder="Leave blank for OPEN" /></div>
        <div><label>TP 1</label><input type="number" step="0.0001" value={tp1} onInput={e=>setTp1(e.target.value)} /></div>
        <div><label>TP 2</label><input type="number" step="0.0001" value={tp2} onInput={e=>setTp2(e.target.value)} /></div>
        <div><label>Stop-Loss</label><input type="number" step="0.0001" value={sl} onInput={e=>setSl(e.target.value)} /></div>
        <div><label>Strategy</label><select value={strategy} onChange={e=>setStrategy(e.target.value)}>{STRATS.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><label>Exit Type</label><select value={exitType} onChange={e=>setExitType(e.target.value)}>{EXIT_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="actions">
        {i.id && <button onClick={()=>onDelete(i.id)} style="border-color:#b63737;color:#ff9b9b">Delete</button>}
        <button onClick={onClose}>Cancel</button>
        <button onClick={()=>onSave(draft)} style="background:var(--brand);border-color:var(--brand-2)">Save</button>
      </div>
      <div style="margin-top:6px;color:var(--muted);font-size:12px">P&L preview: <b style="color:#cfe0ff">{preview}</b></div>
    </Modal>
  );
}

/* Calendar modal (smaller year cards + day color by P&L) */
function CalendarModal({trades,accType,onClose}){
  const [view,setView]=useState("month");
  const now=new Date(); const [y,setY]=useState(now.getFullYear()); const [m,setM]=useState(now.getMonth());
  const [sel,setSel]=useState(isoToday());
  const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dinm=(yy,mm)=>new Date(yy,mm+1,0).getDate(); const fDow=(yy,mm)=>new Date(yy,mm,1).getDay();

  const byDate = useMemo(()=>{
    const map={}; trades.forEach(t=>{(map[t.date]=map[t.date]||[]).push(t)});
    return map;
  },[trades]);

  const dayProfitMap = useMemo(()=>{
    const map={};
    trades.forEach(t=>{
      const v = pnlDollar(t,accType);
      if(v==null) return;
      map[t.date]=(map[t.date]||0)+v;
    });
    return map;
  },[trades,accType]);

  return (
    <Modal title="Calendar" onClose={onClose}>
      <div className="cal-head">
        <div className="cal-tabs">
          {["year","month","day"].map(v=><button key={v} onClick={()=>setView(v)} style={view===v?"background:#152038":""}>{v.toUpperCase()}</button>)}
        </div>
        {view!=="day" && (
          <div style="display:flex;gap:8px;align-items:center">
            <button onClick={()=>view==="month"?(setM((m+11)%12),setY(y-(m===0?1:0))):setY(y-1)}>◀</button>
            <div style="font-size:12px;color:var(--muted)">{view==="month"? `${monthNames[m]} ${y}`: y}</div>
            <button onClick={()=>view==="month"?(setM((m+1)%12),setY(y+(m===11?1:0))):setY(y+1)}>▶</button>
          </div>
        )}
      </div>

      {view==="year" && (
        <div className="year-grid">
          {monthNames.map((mn,i)=>(
            <div key={mn} className="year-card">
              <div style="font-weight:700;margin-bottom:6px">{mn}</div>
              <div style="color:var(--muted);font-size:12px;margin-bottom:6px">
                Trades: {trades.filter(t=>(new Date(t.date)).getMonth()===i && (new Date(t.date)).getFullYear()===y).length}
              </div>
              <button onClick={()=>{setM(i);setView("month")}}>Open</button>
            </div>
          ))}
        </div>
      )}

      {view==="month" && (
        <div>
          <div className="month-grid" style="margin-bottom:6px;color:var(--muted);font-size:12px;text-align:center">
            {dayNames.map(d=><div key={d}>{d}</div>)}
          </div>
          <div className="month-grid">
            {Array.from({length:fDow(y,m)}).map((_,i)=><div key={"e"+i}></div>)}
            {Array.from({length:dinm(y,m)}).map((_,d)=>{
              const day=String(d+1).padStart(2,"0");
              const iso=`${y}-${String(m+1).padStart(2,"0")}-${day}`;
              const list=byDate[iso]||[];
              const sum = dayProfitMap[iso]||0;
              const cls = sum>0?"day p-win":sum<0?"day p-loss":"day";
              return (
                <button key={iso} className={cls} onClick={()=>{setSel(iso);setView("day")}}>
                  <div style="color:var(--muted);font-size:11px">{d+1}</div>
                  {list.slice(0,3).map(t=><div key={t.id} style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px">{t.symbol} {t.side}</div>)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view==="day" && (
        <div>
          <div style="margin-bottom:8px;color:#cfe0ff;font-weight:700">{sel}</div>
          {(byDate[sel]||[]).length===0
            ? <div style="color:var(--muted)">No trades this day.</div>
            : (byDate[sel]||[]).map(t=>{
                const v=pnlDollar(t,accType);
                return (
                  <div key={t.id} className="year-card" style="display:flex;justify-content:space-between;align-items:center">
                    <div><b style="color:#9bd0ff">{t.symbol}</b> · {t.side} · Lot {t.lotSize}</div>
                    <div>{typeof t.entry==="number"?fmt$(t.entry):""} → {typeof t.exit==="number"?fmt$(t.exit):""} · <b className={v>0?"p-win":v<0?"p-loss":""}>{v==null?"-":displayPnL(accType,v)}</b></div>
                  </div>
                );
              })}
        </div>
      )}
    </Modal>
  );
}

/* Histories table */
function Histories({trades,accType,onEdit,onDelete}){
  return (
    <div className="year-card">
      <div style="font-weight:700;margin-bottom:8px">Trade History</div>
      <div style="overflow:auto">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th><th>Symbol</th><th>Side</th><th>Lot size</th><th>Entry</th><th>Exit</th>
              <th>TP1</th><th>TP2</th><th>SL</th><th>Exit Type</th><th>P&L</th><th>P&L (Units)</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t=>{
              const v=pnlDollar(t,accType), closed=!!t.exitType;
              return (
                <tr key={t.id}>
                  <td>{t.date}</td><td>{t.symbol}</td><td>{t.side}</td><td>{t.lotSize}</td>
                  <td>{typeof t.entry==="number"?t.entry:""}</td>
                  <td>{typeof t.exit==="number"?t.exit:""}</td>
                  <td>{typeof t.tp1==="number"?t.tp1:""}</td>
                  <td>{typeof t.tp2==="number"?t.tp2:""}</td>
                  <td>{typeof t.sl==="number"?t.sl:""}</td>
                  <td>{t.exitType||""}</td>
                  <td style={v>0? "color:var(--green)":v<0?"color:var(--red)":""}>{v==null?"-":displayPnL(accType,v)}</td>
                  <td style={v>0? "color:var(--green)":v<0?"color:var(--red)":""}>{v==null?"-":unitsPnL(accType,v)}</td>
                  <td>{closed?"CLOSED":"OPEN"}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button onClick={()=>onEdit(t)}>Edit</button>
                      <button onClick={()=>onDelete(t.id)} style="border-color:#b63737;color:#ff9b9b">✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* General + Detailed stats */
function Stat({label,value}){return(<div className="stat"><div className="label">{label}</div><div className="value">{value}</div></div>)}
function GeneralStats({trades,accType,capital,depositDate}){
  const realized=trades.filter(t=>new Date(t.date)>=new Date(depositDate)&&t.exitType);
  const list=realized.map(t=>pnlDollar(t,accType)).filter(v=>v!=null&&isFinite(v));
  const total=list.reduce((a,b)=>a+b,0);
  const open=trades.filter(t=>!t.exitType&&(t.exit==null)).length;
  const wins=list.filter(v=>v>0).length, losses=list.filter(v=>v<0).length;
  const wr=(wins+losses)>0? Math.round((wins/(wins+losses))*100):0;
  return (
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">
      <Stat label="Capital" value={accType==='Cent Account'? (r2(capital*100)).toFixed(2)+" ¢": fmt$(capital)} />
      <Stat label="Realized P&L" value={displayPnL(accType,total)} />
      <Stat label="Win Rate" value={wr+"%"} />
      <Stat label="Open" value={open} />
    </div>
  );
}
function DetailedStats({trades,accType}){
  const rows=useMemo(()=>{
    const map={};
    trades.forEach(t=>{
      const v=pnlDollar(t,accType);
      const s=map[t.symbol]||{n:0,p:0}; s.n+=1; s.p+=(v&&isFinite(v))?v:0; map[t.symbol]=s;
    });
    return Object.entries(map).map(([sym,v])=>({sym,count:v.n,pnl:v.p}));
  },[trades,accType]);
  return (
    <div className="year-card">
      <div style="font-weight:700;margin-bottom:8px">Detailed Statistics</div>
      <div style="overflow:auto">
        <table className="table">
          <thead><tr><th>Symbol</th><th>Trades</th><th>Total P&L</th><th>P&L (Units)</th></tr></thead>
          <tbody>
            {rows.map(r=><tr key={r.sym}><td>{r.sym}</td><td>{r.count}</td><td>{displayPnL(accType,r.pnl)}</td><td>{unitsPnL(accType,r.pnl)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Shell */
function AppShell({collapsed,setCollapsed,onExport,onLogout,capitalPanel,nav,children}){
  return (
    <div className={"ng-shell "+(collapsed?"ng-collapsed":"")}>
      <div className="ng-topbar">
        <div className="brand"><img src={LOGO} width="24" height="24"/><span>Nitty Gritty</span></div>
        <UserMenu onExport={onExport} onLogout={onLogout}/>
      </div>
      <button className="ng-collapse-btn" onClick={()=>setCollapsed(v=>!v)}>{collapsed?"☰":"≪"}</button>
      <div className="ng-wrap">
        <aside className="ng-panel">
          <div className="card">{capitalPanel}</div>
          <div className="nav">{nav}</div>
        </aside>
        <main className="ng-main">{children}</main>
      </div>
    </div>
  );
}

/* Main app */
function App(){
  const [users,setUsers]=useState(uload());
  const [cur,setCurEmail]=useState(getCur());
  const stateInit=()=>{
    const s=loadState(cur);
    return s||{name:"",email:cur,accType:ACC_TYPES[1],capital:0,depositDate:isoToday(),trades:[]};
  };
  const [st,setSt]=useState(stateInit);
  useEffect(()=>{ if(cur){ saveState(cur,st); }},[st,cur]);

  const [page,setPage]=useState("dashboard");
  const [collapsed,setCollapsed]=useState(false);
  const [trade,setTrade]=useState(null);
  const [showCal,setShowCal]=useState(false);

  /* Auth handlers */
  const emailLogin=(email,pw,setErr)=>{
    const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u) return setErr("No such user. Please sign up.");
    if(u.password!==pw) return setErr("Wrong password.");
    setCur(email); setCurEmail(email);
    const s=loadState(email)||{name:u.name||"",email,accType:ACC_TYPES[1],capital:0,depositDate:isoToday(),trades:[]};
    setSt(s);
  };
  const signup=(name,email,pw,setErr)=>{
    if(users.some(x=>x.email.toLowerCase()===email.toLowerCase())) return setErr("Email already registered.");
    const nu=[...users,{name,email,password:pw}]; usave(nu); setUsers(nu);
    setCur(email); setCurEmail(email);
    const fresh={name,email,accType:ACC_TYPES[1],capital:0,depositDate:isoToday(),trades:[]}; saveState(email,fresh); setSt(fresh);
  };
  const googleLogin = (credentialResponse)=>{
    try{
      const jwt=credentialResponse.credential; // decode basic payload
      const payload=JSON.parse(atob(jwt.split('.')[1]));
      const email = payload.email;
      const name  = payload.name||payload.given_name||"";
      let u=users.find(x=>x.email.toLowerCase()===email.toLowerCase());
      if(!u){ u={name,email,password:"(google)"}; const nu=[...users,u]; usave(nu); setUsers(nu); if(!loadState(email)) saveState(email,{name,email,accType:ACC_TYPES[1],capital:0,depositDate:isoToday(),trades:[]}); }
      setCur(email); setCurEmail(email); setSt(loadState(email));
    }catch(e){ alert("Google sign-in failed. Check Authorized JavaScript origins in Google Cloud."); }
  };
  const logout=()=>{ setCur(""); setCurEmail(""); setCur(""); };

  /* Export */
  const exportCsv=()=>{
    const rows=st.trades.map(t=>({...t,_accType:st.accType}));
    const csv=toCSV(rows);
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='nitty_gritty_trades.csv'; a.click(); URL.revokeObjectURL(url);
  };

  /* Capital live (includes realized since deposit date) */
  const realized = st.trades.filter(t=>new Date(t.date)>=new Date(st.depositDate)&&t.exitType)
                    .map(t=>pnlDollar(t,st.accType)).filter(v=>v!=null&&isFinite(v)).reduce((a,b)=>a+b,0);
  const openTrades = st.trades.filter(t=>!t.exitType&&(t.exit==null)).length;
  const effectiveCap = st.capital + realized;

  /* Add/update/delete trade */
  const saveTrade = (d)=>{
    const id=d.id||Math.random().toString(36).slice(2);
    const arr=st.trades.slice(); const i=arr.findIndex(x=>x.id===id);
    const rec={...d,id};
    if(i>=0) arr[i]=rec; else arr.unshift(rec);
    setSt({...st,trades:arr}); setTrade(null);
  };
  const delTrade=id=>setSt({...st,trades:st.trades.filter(t=>t.id!==id)});

  if(!cur) return <Login onEmailLogin={emailLogin} onSignup={signup} onGoogle={googleLogin} />;

  const capitalPanel=(
    <div>
      <div style="color:var(--muted);font-size:12px">Account Type</div>
      <div style="font-weight:700;margin-bottom:6px">{st.accType}</div>
      <div style="color:var(--muted);font-size:12px">Capital</div>
      <div style="font-weight:800;font-size:24px;margin:2px 0">{st.accType==="Cent Account"?(r2(effectiveCap*100)).toFixed(2)+" ¢":fmt$(effectiveCap)}</div>
      <div style="color:var(--muted);font-size:12px">Deposit: {st.depositDate}</div>
      <div style="margin-top:8px;color:var(--muted);font-size:12px">Open trades</div>
      <div style="font-weight:700;font-size:18px">{openTrades}</div>
      <div style="margin-top:10px"><button onClick={()=>setPage("settings")}>Account Setup</button></div>
      <div style="margin-top:10px"><button onClick={()=>setTrade({})}>+ Add trade</button></div>
    </div>
  );

  const nav=(
    <div className="nav">
      <button onClick={()=>setPage("dashboard")}>{Icon.home}<span>Dashboard</span></button>
      <button onClick={()=>setPage("histories")}>{Icon.hist}<span>Histories</span></button>
      <button onClick={()=>setShowCal(true)}>{Icon.cal}<span>Calendar</span></button>
      <button onClick={()=>setPage("settings")}>{Icon.set}<span>Settings</span></button>
    </div>
  );

  return (
    <AppShell collapsed={collapsed} setCollapsed={setCollapsed} onExport={exportCsv} onLogout={logout}
              capitalPanel={capitalPanel} nav={nav}>
      {page==="dashboard" && (
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="font-weight:700">General statistics</div>
          <GeneralStats trades={st.trades} accType={st.accType} capital={st.capital} depositDate={st.depositDate} />
          <DetailedStats trades={st.trades} accType={st.accType} />
        </div>
      )}
      {page==="histories" && (
        <Histories trades={st.trades} accType={st.accType} onEdit={t=>setTrade(t)} onDelete={delTrade} />
      )}
      {page==="settings" && (
        <div className="year-card">
          <div style="font-weight:700;margin-bottom:10px">Settings</div>
          <div className="grid-2">
            <div><label>Name</label><input value={st.name} onInput={e=>setSt({...st,name:e.target.value})} /></div>
            <div><label>Acc Type</label><select value={st.accType} onChange={e=>setSt({...st,accType:e.target.value})}>{ACC_TYPES.map(a=><option key={a}>{a}</option>)}</select></div>
            <div><label>Account Capital ($)</label><input type="number" value={st.capital} onInput={e=>setSt({...st,capital:parseFloat(e.target.value||"0")})} /></div>
            <div><label>Capital Deposit Date</label><input type="date" value={st.depositDate} onInput={e=>setSt({...st,depositDate:e.target.value})} /></div>
          </div>
        </div>
      )}

      {trade && <TradeModal initial={trade} accType={st.accType} onClose={()=>setTrade(null)} onSave={saveTrade} onDelete={delTrade} />}
      {showCal && <CalendarModal trades={st.trades} accType={st.accType} onClose={()=>setShowCal(false)} />}
    </AppShell>
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
