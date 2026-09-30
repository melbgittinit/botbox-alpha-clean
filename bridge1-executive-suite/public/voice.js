const startButton = document.querySelector("#start");
const controls = document.querySelector("#controls");
const muteButton = document.querySelector("#mute");
const endButton = document.querySelector("#end");
const status = document.querySelector("#status");
const orb = document.querySelector("#orb");
const remoteAudio = document.querySelector("#remoteAudio");

let pc;
let dc;
let localStream;
let queuedPrompt;
let bridgeSessionId;
const inviteGate=document.querySelector("#inviteGate");
const voiceRoom=document.querySelector("#voiceRoom");

function setState(label, state="") {
  status.textContent = label;
  orb.className = `orb ${state}`.trim();
}

function sendText(text) {
  if (!dc || dc.readyState !== "open") { queuedPrompt = text; return; }
  dc.send(JSON.stringify({ type:"conversation.item.create", item:{ type:"message", role:"user", content:[{ type:"input_text", text }] } }));
  dc.send(JSON.stringify({ type:"response.create" }));
}

async function begin() {
  startButton.disabled = true;
  setState("Requesting microphone access…", "live");
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio:{ echoCancellation:true, noiseSuppression:true }, video:false });
    const coreResponse = await fetch("/api/core/sessions", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({}) });
    const coreSession = await coreResponse.json();
    if (!coreResponse.ok || !coreSession.id) throw new Error("Unable to create executive session");
    bridgeSessionId = coreSession.id;
    const tokenResponse = await fetch(`/api/realtime-token?session_id=${encodeURIComponent(bridgeSessionId)}`, { method:"POST" });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.value) throw new Error(token.error || "Session unavailable");

    pc = new RTCPeerConnection();
    pc.ontrack = event => { remoteAudio.srcObject = event.streams[0]; };
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    dc = pc.createDataChannel("oai-events");
    dc.onopen = () => {
      controls.hidden = false;
      startButton.hidden = true;
      setState("BRIDGE-1 is listening", "live");
      if (queuedPrompt) { const prompt = queuedPrompt; queuedPrompt = null; sendText(prompt); }
      else dc.send(JSON.stringify({ type:"response.create", response:{ instructions:"Greet the visitor using the approved opening and invite one business objective." } }));
    };
    dc.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.type === "input_audio_buffer.speech_started") setState("Listening…", "live");
      if (message.type === "response.output_audio.delta") setState("BRIDGE-1 is speaking", "speaking");
      if (message.type === "response.done") setState("BRIDGE-1 is listening", "live");
      if (message.type === "response.done") handleFunctionCalls(message.response?.output || []);
      if (message.type === "error") setState("The conversation needs to be restarted");
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime/calls`, {
      method:"POST",
      headers:{ "Authorization":`Bearer ${token.value}`, "Content-Type":"application/sdp" },
      body:offer.sdp
    });
    if (!sdpResponse.ok) throw new Error("Unable to connect voice");
    await pc.setRemoteDescription({ type:"answer", sdp:await sdpResponse.text() });
  } catch (error) {
    console.error(error);
    end(false);
    startButton.disabled = false;
    setState(error.name === "NotAllowedError" ? "Microphone permission is required" : "Voice is temporarily unavailable");
  }
}

async function handleFunctionCalls(output) {
  for (const item of output) {
    if (item.type !== "function_call") continue;
    let args = {};
    try { args = JSON.parse(item.arguments || "{}"); } catch {}
    const response = await fetch("/api/core/tool", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ session_id:bridgeSessionId, name:item.name, arguments:args })
    });
    const result = await response.json();
    dc.send(JSON.stringify({ type:"conversation.item.create", item:{ type:"function_call_output", call_id:item.call_id, output:JSON.stringify(result) } }));
    dc.send(JSON.stringify({ type:"response.create" }));
  }
}

async function recordCompletion(outcome) {
  if (!bridgeSessionId) return;
  const id = bridgeSessionId;
  bridgeSessionId = null;
  try { await fetch(`/api/core/sessions/${encodeURIComponent(id)}/complete`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ outcome }) }); }
  catch (error) { console.warn("Session completion was not recorded", error); }
}

function end(resetLabel=true, outcome="visitor-ended") {
  if (dc) dc.close();
  if (pc) pc.close();
  if (localStream) localStream.getTracks().forEach(track => track.stop());
  dc = pc = localStream = null;
  controls.hidden = true;
  startButton.hidden = false;
  startButton.disabled = false;
  muteButton.textContent = "Mute";
  recordCompletion(outcome);
  if (resetLabel) setState("Conversation ended. Start again when ready.");
}

startButton.addEventListener("click", begin);
endButton.addEventListener("click", () => end(true, "visitor-ended"));
muteButton.addEventListener("click", () => {
  const track = localStream?.getAudioTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  muteButton.textContent = track.enabled ? "Mute" : "Unmute";
  setState(track.enabled ? "BRIDGE-1 is listening" : "Microphone muted", track.enabled ? "live" : "");
});
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => {
  queuedPrompt = button.dataset.prompt;
  if (!pc) begin(); else sendText(queuedPrompt);
}));

async function checkAccess(){
  const access=await fetch("/api/access").then(response=>response.json());
  inviteGate.hidden=access.invited;
  voiceRoom.hidden=!access.invited;
}
document.querySelector("#inviteForm").addEventListener("submit",async event=>{
  event.preventDefault();
  const response=await fetch("/api/invitations/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:document.querySelector("#inviteCode").value})});
  const result=await response.json();
  if(!response.ok){document.querySelector("#inviteError").textContent=result.error||"Invitation could not be verified.";return;}
  await checkAccess();
});
checkAccess().catch(()=>{inviteGate.hidden=false;voiceRoom.hidden=true;});
