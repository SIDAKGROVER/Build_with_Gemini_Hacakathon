import React, { useState } from 'react';
import axios from 'axios';

export default function SideHustle(){
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const [skills, setSkills] = useState('');
  const [hours, setHours] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);

  const suggest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try{
      const res = await axios.post(`${apiBase}/api/sidehustle/suggest`, { skills, hoursPerWeek: hours });
      setResults(res.data.suggestions || []);
    }catch(err){
      console.error(err);
    }finally{setLoading(false)}
  };

  const generate = async (idea) => {
    setLoading(true);
    try{
      const res = await axios.post(`${apiBase}/api/sidehustle/generate`, { title: idea.title, skills, hoursPerWeek: hours });
      setSelected({ idea, details: res.data });
    }catch(err){
      console.error(err);
    }finally{setLoading(false)}
  };

  const copyToClipboard = (txt) => {
    navigator.clipboard?.writeText(txt);
    alert('Copied to clipboard');
  };

  return (
    <div className="sidehustle">
      <h3 style={{marginTop:0}}>Side-Hustle Generator</h3>
      <form className="sh-form" onSubmit={suggest}>
        <label className="small">Skills (comma separated)</label>
        <textarea value={skills} onChange={e=>setSkills(e.target.value)} placeholder="e.g. video editing, premiere, teaching, excel" rows={2} />

        <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
          <label className="small">Hours/week</label>
          <input type="number" value={hours} min={0} max={80} onChange={e=>setHours(e.target.value)} style={{width:80,padding:8,borderRadius:8}} />
          <button className="btn" type="submit" style={{marginLeft:'auto'}}>{loading ? 'Searching...' : 'Suggest'}</button>
        </div>
      </form>

      <div style={{marginTop:12}}>
        {results.length === 0 && <div className="small">No suggestions yet — enter skills and press Suggest.</div>}

        {results.map((r, idx) => (
          <div className="sh-card" key={idx}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontWeight:700}}>{r.title}</div>
                <div className="small">{r.categories.join(', ')} • Suitability: {r.suitability}%</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700}}>₹{r.estMonthly}</div>
                <button className="btn" onClick={()=>generate(r)} style={{marginTop:8}}>Generate Guide</button>
              </div>
            </div>
            <div style={{marginTop:8,color:'#334155'}}>{r.description}</div>
            <div style={{marginTop:8,display:'flex',gap:8,flexWrap:'wrap'}}>
              {r.steps && r.steps.slice(0,3).map((s,i)=>(<div className="chip" key={i}>{s}</div>))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="sh-details card" style={{marginTop:12}}>
          <h4 style={{margin:'6px 0'}}>{selected.idea.title} — Starter Guide</h4>
          <pre style={{whiteSpace:'pre-wrap',background:'#f8fafc',padding:12,borderRadius:8}}>{selected.details.gigDescription}</pre>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn" onClick={()=>copyToClipboard(selected.details.gigDescription)}>Copy Gig</button>
            <button className="btn" onClick={()=>copyToClipboard(selected.details.resumeSnippet)}>Copy Resume Snippet</button>
          </div>
        </div>
      )}
    </div>
  )
}
