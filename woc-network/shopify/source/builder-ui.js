function gpMount(dialog) {
  if(dialog.dataset.mounted) return;
  dialog.dataset.mounted='true';
  const $=s=>dialog.querySelector(s), $$=s=>[...dialog.querySelectorAll(s)];
  const form=$('[data-gp-form]'), heading=$('[data-gp-title]');
  const defaults={groupType:'close_friends',gatheringType:'coffee',mood:'easy',reason:'just_gather',budgetRange:'50_100',locationType:'home',foodMethod:'host',indoorOutdoor:'either',duration:'90'};
  const portraits={one_friend:'one_girlfriend.jpg?v=1788067243',close_friends:'close_friends.jpg?v=1788067203',church_women:'church_women.jpg?v=1788067203',sorority_sisters:'close_friends.jpg?v=1788067203',neighbors:'neighbors.jpg?v=1788067235',family_women:'family_women.jpg?v=1788067223'};
  let step=0, plan=null, source=null, trigger=null, oldOverflow='', invitationTouched=false;
  const abort=new AbortController(), listen=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});
  function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  $$('[data-gp-options]').forEach(container=>{
    const key=container.dataset.gpOptions;
    GP_OPTIONS[key].forEach(([value,label])=>{
      const item=node('label',undefined,'gp-option'+(key==='groupType'&&!portraits[value]?' gp-text-option':''));
      const radio=document.createElement('input');radio.type='radio';radio.name=key;radio.value=value;radio.checked=defaults[key]===value;
      const span=node('span');
      if(key==='groupType'&&portraits[value]){const img=document.createElement('img');img.src='https://cdn.shopify.com/s/files/1/0766/0335/9530/files/'+portraits[value];img.alt='';img.width=1086;img.height=1448;img.loading='lazy';span.append(img,node('b',label));}else span.textContent=label;
      item.append(radio,span);container.append(item);
    });
  });
  $$('[data-gp-select]').forEach(select=>{GP_OPTIONS[select.dataset.gpSelect].forEach(([value,label])=>{select.add(new Option(label,value));});select.value=defaults[select.dataset.gpSelect];});
  const titles=['Who would you love to see?','What shall we do together?','Set the feeling.','Make it work for you.','Give it a little meaning.'];
  function status(text=''){$('[data-gp-status]').textContent=text;}
  function screen(name,title,intro=''){
    form.hidden=name!=='form';$('[data-gp-result]').hidden=name!=='result';$('[data-gp-keep]').hidden=name!=='keep';$('[data-gp-invitation]').hidden=name!=='invitation';
    heading.textContent=title;$('[data-gp-intro]').textContent=intro;$('[data-gp-progress]').textContent=name==='form'?'STEP '+(step+1)+' OF 5':'MADE FOR YOUR CIRCLE';status();dialog.scrollTop=0;heading.focus({preventScroll:true});
  }
  function showStep(){screen('form',titles[step],step===0?'A few easy choices. A lovely plan. About 90 seconds.':'Choose what feels right. You can change it later.');$$('[data-gp-step]').forEach(el=>el.hidden=Number(el.dataset.gpStep)!==step);$('[data-gp-back]').hidden=step===0;$('[data-gp-next]').textContent=step===4?'Create My Garden Party →':'Continue →';}
  function data(){const d=Object.fromEntries(new FormData(form));d.dateUndecided=form.elements.dateUndecided.checked;return d;}
  function dateState(){const off=form.elements.dateUndecided.checked;form.elements.preferredDate.disabled=off;form.elements.preferredTime.disabled=off;form.elements.preferredDate.required=!off;}
  listen(form.elements.dateUndecided,'change',dateState);
  listen(form,'change',event=>{if(event.target.name==='groupType')form.elements.guestCount.value=event.target.value==='one_friend'?2:6;});
  listen(form,'submit',event=>{
    event.preventDefault();
    if(step===3){if(!form.elements.guestCount.reportValidity()||!form.elements.preferredDate.reportValidity()||!form.elements.preferredTime.reportValidity())return;}
    if(step<4){step++;showStep();}else{plan=gpGenerate(data(),source);renderPlan();}
  });
  // Validate only the visible step, avoiding hidden required controls blocking progression.
  form.noValidate=true;
  listen($('[data-gp-back]'),'click',()=>{step=Math.max(0,step-1);showStep();});
  const details=[['menu','Your menu'],['shoppingList','Your shopping list'],['contributionSuggestions','What sisters can bring'],['checklist','Your host checklist'],['conversationQuestions','Conversation cards']];
  details.forEach(([key,label])=>{const detail=node('details');detail.append(node('summary',label));const field=node('label','Make it yours — one item per line');const textarea=document.createElement('textarea');textarea.rows=5;textarea.maxLength=5000;textarea.dataset.gpList=key;field.append(textarea);detail.append(field);$('[data-gp-plan-details]').append(detail);});
  function updateStats(){const el=$('[data-gp-stats]');el.replaceChildren();[[plan.guestCount,'WOMEN, INCLUDING YOU'],[plan.durationMinutes+' min','TIME TOGETHER'],['$'+plan.estimatedBudgetLow+'–'+plan.estimatedBudgetHigh,'TOTAL BUDGET']].forEach(([value,label])=>{const item=node('div',String(value));item.append(node('small',label));el.append(item);});}
  function renderPlan(){
    $$('[data-gp-edit]').forEach(el=>el.value=plan[el.dataset.gpEdit]);$$('[data-gp-list]').forEach(el=>el.value=plan[el.dataset.gpList].join('\n'));$$('[data-gp-scripture]').forEach(el=>el.value=plan.scripture[el.dataset.gpScripture]);
    $('[data-gp-budget-note]').textContent=plan.budgetNote;$('[data-gp-photo-note]').textContent=plan.photoSuggestion;updateStats();screen('result','Your Garden Party is ready.','A little planning. A lot to look forward to. Everything below is yours to edit.');
  }
  function readEdits(){
    const low=$('[data-gp-edit="estimatedBudgetLow"]'),high=$('[data-gp-edit="estimatedBudgetHigh"]');
    high.setCustomValidity('');
    if(!low.reportValidity()||!high.reportValidity())return false;
    if(Number(high.value)<Number(low.value)){high.setCustomValidity('Enter an upper budget at least as large as the lower budget.');high.reportValidity();return false;}
    $$('[data-gp-edit]').forEach(el=>plan[el.dataset.gpEdit]=el.type==='number'?Number(el.value):el.value.trim());
    if(!plan.partyTitle)plan.partyTitle='My Garden Party';
    $$('[data-gp-list]').forEach(el=>plan[el.dataset.gpList]=el.value.split('\n').map(x=>x.trim()).filter(Boolean));$$('[data-gp-scripture]').forEach(el=>plan.scripture[el.dataset.gpScripture]=el.value.trim());updateStats();return true;
  }
  listen($('[data-gp-edit="estimatedBudgetHigh"]'),'input',e=>e.target.setCustomValidity(''));
  listen($('[data-gp-edit="estimatedBudgetLow"]'),'input',()=> $('[data-gp-edit="estimatedBudgetHigh"]').setCustomValidity(''));
  listen($('[data-gp-change]'),'click',()=>{if(readEdits()){step=0;showStep();}});
  listen($('[data-gp-save]'),'click',()=>{if(readEdits())screen('keep','Keep your Garden Party.');});
  function invitation(force=false){if(force||!invitationTouched)$('[data-gp-invitation-copy]').value=gpInvitation(plan,$('[name="hostFirstName"]').value,$('[data-gp-voice]').value);}
  listen($('[data-gp-invite]'),'click',()=>{if(!readEdits())return;$('[data-gp-voice]').value=plan.invitationVoice;invitationTouched=false;invitation(true);screen('invitation','Invite your sisters.');});
  listen($('[data-gp-invitation-copy]'),'input',()=>invitationTouched=true);
  listen($('[name="hostFirstName"]'),'input',()=>invitation());
  listen($('[data-gp-voice]'),'change',()=>{invitationTouched=false;invitation(true);});
  $$('[data-gp-return]').forEach(el=>listen(el,'click',()=>screen('result','Your Garden Party is ready.','Everything below is yours to edit.')));
  function plainPlan(){return [plan.partyTitle,plan.description,'Date: '+(plan.preferredDate||'To be chosen')+(plan.preferredTime?' at '+plan.preferredTime:''),'Place: '+gpLabel('locationType',plan.locationType),'Budget: $'+plan.estimatedBudgetLow+'–$'+plan.estimatedBudgetHigh,plan.budgetNote,...details.flatMap(([key,label])=>[label.toUpperCase(),...plan[key].map(x=>'• '+x)]),'A GOOD WORD',plan.scripture.reference,plan.scripture.text,plan.sourceStory?'Inspired by: '+plan.sourceStory.headline:'',plan.hostNote,plan.photoSuggestion,'Women of Color — The Network'].filter(Boolean).join('\n\n');}
  listen($('[data-gp-download]'),'click',()=>{const url=URL.createObjectURL(new Blob([plainPlan()],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='My-Garden-Party.txt';dialog.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status('Your plan download has been requested. Check your downloads.');});
  async function copy(){try{await navigator.clipboard.writeText($('[data-gp-invitation-copy]').value);status('Invitation copied. Paste it into a message to your sisters.');}catch{const field=$('[data-gp-invitation-copy]');field.focus();field.select();status('Select and copy the invitation text, then paste it into your message.');}}
  listen($('[data-gp-copy]'),'click',copy);
  listen($('[data-gp-share]'),'click',async()=>{if(!navigator.share){await copy();return;}try{await navigator.share({title:plan.partyTitle,text:$('[data-gp-invitation-copy]').value});}catch(error){if(error.name!=='AbortError')status('Sharing is unavailable here. Use Copy Invitation instead.');}});
  function close(){dialog.close();}
  listen($('[data-gp-close]'),'click',close);
  listen(dialog,'close',()=>{document.body.style.overflow=oldOverflow;if(trigger&&trigger.isConnected)trigger.focus();});
  listen(document,'click',event=>{
    const entry=event.target.closest('button.garden-cta,[data-eve-gather]');if(!entry||dialog.contains(entry))return;
    event.preventDefault();trigger=entry;
    if(!dialog.open){oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();}
    const group=entry.dataset.gpGroup;
    if(group&&GP_OPTIONS.groupType.some(x=>x[0]===group)){form.elements.groupType.value=group;form.elements.guestCount.value=group==='one_friend'?2:6;}
    const storyUrl=entry.dataset.gpStoryUrl;
    source=storyUrl?{id:entry.dataset.gpStoryId||storyUrl,headline:entry.dataset.gpStoryHeadline,category:entry.dataset.gpStoryCategory,image:entry.dataset.gpStoryImage,question:entry.dataset.gpStoryQuestion,scripture:entry.dataset.gpStoryScripture,url:storyUrl}:null;
    const storyEl=$('[data-gp-story]');storyEl.hidden=!source;storyEl.textContent=source?'Gather around: '+source.headline:'';
    if(source)form.elements.gatheringType.value='eve_conversation';step=0;showStep();
  });
  listen(document,'shopify:section:unload',event=>{if(event.target.contains(dialog)){if(dialog.open)close();abort.abort();}});
}
document.querySelectorAll('[data-gp-app]').forEach(gpMount);
document.addEventListener('shopify:section:load',event=>event.target.querySelectorAll('[data-gp-app]').forEach(gpMount));
