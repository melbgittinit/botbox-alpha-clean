"use client";
import Link from "next/link";
import { useState } from "react";
import styles from "../press.module.css";

export default function MediaPassPage(){
  const [form,setForm]=useState({name:"",outlet:"",role:"",email:"",beat:"AI"});
  const [result,setResult]=useState<any>(null);
  async function submit(e:React.FormEvent){e.preventDefault();const r=await fetch("/api/media/pass",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});setResult(await r.json());}
  return <main className={styles.press}><div className={styles.wrap}>
    <nav className={styles.nav}><Link className={styles.brand} href="/press">THE BOT STORES • MEDIA FLOOR</Link><div className={styles.navlinks}><Link href="/press/fresh">Fresh Dings</Link><Link href="/press/interview">Information Director</Link></div></nav>
    <section className={styles.hero}><div className={styles.eyebrow}>MEDIA PASS™</div><h1>PRESS ACCESS WITHOUT THE RUNAROUND.</h1><p>Request access for protected media features. Public materials remain available without a pass.</p></section>
    <section className={styles.panel}><form className={styles.form} onSubmit={submit}>
      <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Outlet / show / newsletter<input value={form.outlet} onChange={e=>setForm({...form,outlet:e.target.value})}/></label>
      <label>Role<input value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/></label>
      <label>Work email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Coverage area<select value={form.beat} onChange={e=>setForm({...form,beat:e.target.value})}>{["AI","Technology","Business","Entrepreneurship","Retail","Government","Creators","Publishing","Entertainment","Culture","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
      <button className={styles.button}>REQUEST MEDIA PASS</button>
    </form>{result&&<div className={styles.result}><div className={styles.meta}>{result.status || "REQUEST"}</div><p>{result.message || result.error}</p>{result.pass_id&&<div className={styles.small}>Pass request: {result.pass_id}</div>}</div>}</section>
  </div></main>
}