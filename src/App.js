import { useState, useEffect, useCallback } from "react";
const API_BASE = "https://utu-backend-3p1g.onrender.com";
const SESSION_ID = Math.random().toString(36).slice(2);
export default function App() {
  const [step, setStep] = useState("login");
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState("");
  const [captchaVal, setCaptchaVal] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const refreshCaptcha = useCallback(() => {
    setCaptchaUrl(`${API_BASE}/captcha?session_id=${SESSION_ID}&t=${Date.now()}`);
    setCaptchaVal("");
  }, []);
  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);
  async function handleSubmit() {
    if (!rollNo || !dob || !captchaVal) { setError("Please fill all fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roll_no: rollNo, dob, captcha: captchaVal, session_id: SESSION_ID }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Something went wrong");
      setData(json); setStep("results");
    } catch (e) { setError(e.message); refreshCaptcha(); }
    finally { setLoading(false); }
  }
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#e8e8f0",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",fontFamily:"monospace"}}>
      <h1 style={{fontSize:"2.5rem",marginBottom:"8px",background:"linear-gradient(135deg,#fff,#6c63ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Attendance Tracker</h1>
      <p style={{color:"#6b6b8a",marginBottom:"40px"}}>Veer Madho Singh Bhandari UTU</p>
      {step==="login" && (
        <div style={{background:"#12121a",border:"1px solid #2a2a3d",borderRadius:"16px",padding:"32px",width:"100%",maxWidth:"480px"}}>
          <div style={{marginBottom:"20px"}}>
            <label style={{display:"block",fontSize:"12px",color:"#6b6b8a",marginBottom:"8px",textTransform:"uppercase"}}>Roll No.</label>
            <input placeholder="e.g. 22XXXXX001" value={rollNo} onChange={e=>setRollNo(e.target.value)} style={{width:"100%",background:"#1a1a26",border:"1px solid #2a2a3d",borderRadius:"10px",padding:"12px 16px",color:"#e8e8f0",fontFamily:"monospace",fontSize:"14px",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:"20px"}}>
            <label style={{display:"block",fontSize:"12px",color:"#6b6b8a",marginBottom:"8px",textTransform:"uppercase"}}>Date of Birth (Password)</label>
            <input placeholder="DD/MM/YYYY" value={dob} onChange={e=>setDob(e.target.value)} style={{width:"100%",background:"#1a1a26",border:"1px solid #2a2a3d",borderRadius:"10px",padding:"12px 16px",color:"#e8e8f0",fontFamily:"monospace",fontSize:"14px",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:"20px"}}>
            <label style={{display:"block",fontSize:"12px",color:"#6b6b8a",marginBottom:"8px",textTransform:"uppercase"}}>Captcha</label>
            <div style={{display:"flex",gap:"12px"}}>
              <input placeholder="Enter captcha" value={captchaVal} onChange={e=>setCaptchaVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={{flex:1,background:"#1a1a26",border:"1px solid #2a2a3d",borderRadius:"10px",padding:"12px 16px",color:"#e8e8f0",fontFamily:"monospace",fontSize:"14px",outline:"none"}}/>
              <div onClick={refreshCaptcha} style={{background:"#1a1a26",border:"1px solid #2a2a3d",borderRadius:"10px",padding:"8px",cursor:"pointer",display:"flex",alignItems:"center",minWidth:"120px"}}>
                {captchaUrl?<img src={captchaUrl} alt="captcha" style={{height:"30px",objectFit:"contain"}}/>:<span style={{fontSize:"11px",color:"#6b6b8a"}}>Loading…</span>}
              </div>
            </div>
            <p style={{fontSize:"11px",color:"#6b6b8a",marginTop:"6px"}}>↑ Click image to refresh</p>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{width:"100%",padding:"14px",background:"#6c63ff",border:"none",borderRadius:"10px",color:"white",fontSize:"15px",fontWeight:"700",cursor:"pointer",opacity:loading?0.5:1}}>
            {loading?"Fetching...":"View My Attendance →"}
          </button>
          {error&&<div style={{background:"rgba(255,79,107,0.1)",border:"1px solid rgba(255,79,107,0.3)",borderRadius:"10px",padding:"12px",color:"#ff4f6b",marginTop:"16px",fontSize:"13px"}}>⚠ {error}</div>}
        </div>
      )}
      {step==="results"&&data&&(
        <div style={{width:"100%",maxWidth:"480px"}}>
          <button onClick={()=>{setStep("login");setData(null);refreshCaptcha();}} style={{background:"none",border:"1px solid #2a2a3d",color:"#6b6b8a",borderRadius:"8px",padding:"8px 16px",cursor:"pointer",marginBottom:"20px",fontFamily:"monospace"}}>← Back</button>
          <div style={{background:"#12121a",border:"1px solid #2a2a3d",borderRadius:"16px",padding:"32px"}}>
            <h2 style={{marginBottom:"24px"}}>{data.name||"Student"} — {data.roll_no}</h2>
            {data.subjects.map((s,i)=>{
              const pct=s.percentage;
              const color=pct>=75?"#00e676":pct>=65?"#ffd740":"#ff4f6b";
              return(
                <div key={i} style={{background:"#1a1a26",border:"1px solid #2a2a3d",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                    <span style={{fontSize:"14px"}}>{s.subject}</span>
                    <span style={{color,fontWeight:"700"}}>{pct}%</span>
                  </div>
                  <div style={{height:"4px",background:"#2a2a3d",borderRadius:"999px"}}>
                    <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:color,borderRadius:"999px"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:"6px",fontSize:"11px",color:"#6b6b8a"}}>
                    <span>{s.present}/{s.total} classes</span>
                    <span style={{color}}>{pct>=75?"✓ Safe":pct>=65?"⚠ Warning":"✗ Shortage"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
