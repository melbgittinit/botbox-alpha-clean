"use client";

import { useEffect } from "react";
import { FACE_ASSETS } from "../lib/face-registry";

const NAME_TO_ID: Record<string,string> = {
  "MeBOT": "mebot",
  "FAM BOT": "fam",
  "Coffee Bot / QWAZY": "coffee",
  "W. Bells": "wbells",
  "MY MTC": "mtc",
  "POP — Predictor On Purpose": "pop",
  "Zipper / Lead Zeppelin": "zipper",
  "imPOSTR": "impostr",
  "TVME / Get ME on TV": "tvme",
  "SLIDE HustL": "slide",
  "Tracking Bot": "tracking",
  "Elevate Bot": "elevate",
  "Beauty BOT": "beauty",
  "Register ME BOT": "register",
  "Creator Closer Bot": "creator",
  "Fund Us Bot": "fundus",
  "Free Money Bot": "freemoney",
  "UFO BOT": "ufo",
};

function makeFace(botId:string, mode:"card"|"detail"|"blueprint"){
  const asset=FACE_ASSETS[botId];
  if(!asset?.url) return null;
  const wrap=document.createElement("div");
  wrap.dataset.faceSlot=mode;
  wrap.dataset.faceBot=botId;
  wrap.dataset.faceStatus=asset.status;
  const img=document.createElement("img");
  img.src=asset.url;
  img.alt=asset.alt;
  img.loading=mode==="card"?"lazy":"eager";
  img.decoding="async";
  wrap.appendChild(img);
  return wrap;
}

function installCardFaces(){
  document.querySelectorAll("article").forEach(article=>{
    const title=article.querySelector("h3")?.textContent?.trim();
    if(!title) return;
    const botId=NAME_TO_ID[title];
    if(!botId || !FACE_ASSETS[botId]?.url || article.querySelector("[data-face-slot='card']")) return;
    const first=article.firstElementChild;
    const face=makeFace(botId,"card");
    if(!face) return;
    if(first && first.tagName==="DIV") first.replaceWith(face);
    else article.prepend(face);
  });
}

function installDetailFaces(){
  document.querySelectorAll("[role='dialog'], dialog, body > div").forEach(scope=>{
    const eyebrow=Array.from(scope.querySelectorAll("span")).find(el=>el.textContent?.trim().startsWith("TRY "));
    if(!eyebrow) return;
    const name=eyebrow.textContent!.trim().slice(4);
    const botId=NAME_TO_ID[name];
    if(!botId || !FACE_ASSETS[botId]?.url || scope.querySelector("[data-face-slot='detail']")) return;
    const face=makeFace(botId,"detail");
    if(face) eyebrow.insertAdjacentElement("afterend",face);
  });
}

function installBlueprintFaces(){
  document.querySelectorAll("aside").forEach(aside=>{
    const title=aside.querySelector("h2")?.textContent?.trim();
    if(!title) return;
    const botId=NAME_TO_ID[title];
    if(!botId || !FACE_ASSETS[botId]?.url || aside.querySelector("[data-face-slot='blueprint']")) return;
    const face=makeFace(botId,"blueprint");
    if(face) aside.prepend(face);
  });
}

function install(){
  installCardFaces();
  installDetailFaces();
  installBlueprintFaces();
}

export default function FacePass(){
  useEffect(()=>{
    install();
    let queued=false;
    const observer=new MutationObserver(()=>{
      if(queued) return;
      queued=true;
      requestAnimationFrame(()=>{ queued=false; install(); });
    });
    observer.observe(document.body,{childList:true,subtree:true});
    return ()=>observer.disconnect();
  },[]);

  return <style>{`
    [data-face-slot]{
      overflow:hidden;
      position:relative;
      border:1px solid rgba(255,255,255,.13);
      background:#0a0c11;
      box-shadow:inset 0 0 32px rgba(255,255,255,.025);
    }
    [data-face-slot='card']{
      width:88px;
      height:88px;
      border-radius:22px;
      margin-bottom:18px;
    }
    [data-face-slot='detail']{
      width:150px;
      height:150px;
      border-radius:28px;
      margin:14px 0 18px;
    }
    [data-face-slot='blueprint']{
      width:110px;
      height:110px;
      border-radius:24px;
      margin:0 0 16px;
    }
    [data-face-slot] img{
      width:100%;
      height:100%;
      display:block;
      object-fit:cover;
      object-position:center 22%;
    }
    [data-face-bot='mtc'] img{object-position:center 20%;}
    [data-face-bot='impostr'] img{object-position:center 18%;}
    [data-face-bot='elevate'] img{object-position:center 35%;}
    @media(max-width:620px){
      [data-face-slot='card']{width:82px;height:82px}
      [data-face-slot='detail']{width:132px;height:132px}
    }
  `}</style>;
}
