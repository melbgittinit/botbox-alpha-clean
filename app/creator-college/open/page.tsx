"use client";

import { useEffect, useState } from "react";
import { findUnifiedCreation, STORAGE_BY_KIND, type CreationKind } from "../lib/creatorCollegeStore";

export default function CreatorOpenPage(){
 const[message,setMessage]=useState("Opening your creation…");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const kind=params.get("kind") as CreationKind|null;const id=params.get("id");if(!kind||!id||!STORAGE_BY_KIND[kind]){setMessage("We could not identify that creation.");return}const item=findUnifiedCreation(kind,id);if(!item){setMessage("That saved creation could not be found on this device.");return}localStorage.setItem(STORAGE_BY_KIND[kind].activeKey,id);window.location.href=STORAGE_BY_KIND[kind].builderRoute},[]);
 return <main className="cc4-shell"><section className="cc4-hero"><span className="cc4-eyebrow">CREATOR COLLEGE</span><h1>{message}</h1><p>We’re restoring the exact saved project and sending you back to its builder.</p></section></main>
}
