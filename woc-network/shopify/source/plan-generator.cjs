/* Controlled Garden Party plans. No network, AI service, or personal data storage. */
const GP_OPTIONS = {
  groupType: [['one_friend','One girlfriend'],['close_friends','Close friends'],['church_women','Church women'],['sorority_sisters','Sorority sisters'],['neighbors','Neighbors'],['family_women','Family women'],['coworkers','Coworkers'],['custom_group','My own circle']],
  gatheringType: [['coffee','Coffee & conversation'],['brunch','Brunch'],['dinner','Dinner'],['porch_patio','Porch or patio'],['food_fashion_fun','Food, fashion & fun'],['scripture_sisters','Scripture & sisters'],['event_outing','An outing'],['eve_conversation','An EVE conversation'],['surprise_me','Choose for me']],
  mood: [['easy','Easy'],['meaningful','Meaningful'],['joyful','Joyful'],['beautiful','Beautiful'],['elegant','Elegant'],['faith_filled','Faith-filled'],['fabulous','Fabulous'],['surprise_me','Choose for me']],
  reason: [['miss_each_other','We miss each other'],['encouragement','A little encouragement'],['celebration','Something to celebrate'],['starting_over','A fresh start'],['laughter','We need a laugh'],['meaningful_conversation','A real conversation'],['meet_new_women','Meet new women'],['just_gather','Just because'],['custom','A reason of our own']],
  locationType: [['home','At home'],['cafe','A cafe or restaurant'],['community','A community space'],['park','A park'],['other','Somewhere else']],
  budgetRange: [['0_25','$0–25'],['25_50','$25–50'],['50_100','$50–100'],['100_200','$100–200'],['200_350','$200–350']],
  foodMethod: [['host','I will provide it'],['potluck','Everyone brings something'],['takeaway','Order in'],['no_food','No food planned']],
  indoorOutdoor: [['indoor','Indoors'],['outdoor','Outdoors'],['either','Either works']],
  duration: [['60','An hour'],['90','An hour and a half'],['120','Two hours'],['180','Three hours']]
};
const GP_PACKS = {
  everyday: ['What has brought you a little joy lately?','What would you love to make more room for?','How can we stay connected after today?'],
  encouragement: ['What is helping you keep going?','What kind of encouragement feels useful right now?','What is one small kindness we can offer each other?'],
  celebration: ['What are we celebrating, big or small?','Who helped you reach this moment?','What would you love to celebrate next?'],
  fresh: ['What would a gentle fresh start look like?','What wisdom do you want to carry forward?','What is one manageable next step?'],
  laughter: ['What is a harmless mishap you can laugh about now?','What always makes you smile?','What fun tradition could we start together?'],
  connection: ['What is something you wish people asked you about?','What has changed your perspective lately?','What would you love to learn from another woman here?']
};
const GP_SCRIPTURES = {
  friendship: {reference:'Proverbs 17:17 (KJV)', text:'A friend loveth at all times, and a brother is born for adversity.'},
  encouragement: {reference:'1 Thessalonians 5:11 (KJV)', text:'Wherefore comfort yourselves together, and edify one another, even as also ye do.'},
  joy: {reference:'Psalm 118:24 (KJV)', text:'This is the day which the LORD hath made; we will rejoice and be glad in it.'},
  fresh: {reference:'Lamentations 3:23 (KJV)', text:'They are new every morning: great is thy faithfulness.'}
};
function gpText(value, max=600) { return String(value || '').trim().slice(0,max); }
function gpChoice(key, value, fallback) {return GP_OPTIONS[key].some(x=>x[0]===String(value)) ? String(value) : fallback;}
function gpLabel(key,value) {return (GP_OPTIONS[key].find(x=>x[0]===String(value)) || ['',value])[1];}
function gpGenerate(input={}, story=null) {
  const groupType=gpChoice('groupType',input.groupType,'close_friends');
  let gatheringType=gpChoice('gatheringType',input.gatheringType,'coffee');
  if(gatheringType==='surprise_me') gatheringType=groupType==='one_friend'?'coffee':'brunch';
  const mood=gpChoice('mood',input.mood,'easy');
  const reason=gpChoice('reason',input.reason,'just_gather');
  const foodMethod=gpChoice('foodMethod',input.foodMethod,'host');
  const budgetRange=gpChoice('budgetRange',input.budgetRange,'50_100');
  const budget=budgetRange.split('_').map(Number);
  const rawCount=Number(input.guestCount);
  const guestCount=Number.isFinite(rawCount)&&rawCount>=2?Math.min(40,Math.round(rawCount)):(groupType==='one_friend'?2:6);
  const durationMinutes=Number(gpChoice('duration',input.duration,'90'));
  const locationType=gpChoice('locationType',input.locationType,'home');
  const indoorOutdoor=gpChoice('indoorOutdoor',input.indoorOutdoor,'either');
  const preferredDate=!input.dateUndecided&&/^\d{4}-\d{2}-\d{2}$/.test(input.preferredDate||'')?input.preferredDate:'';
  const preferredTime=preferredDate&&/^([01]\d|2[0-3]):[0-5]\d$/.test(input.preferredTime||'')?input.preferredTime:'';
  let partyTitle='Sister Circle Gathering';
  if(groupType==='one_friend'&&gatheringType==='coffee') partyTitle='Coffee With One Girlfriend';
  else if(groupType==='church_women'||gatheringType==='scripture_sisters') partyTitle='Church Ladies Around the Table';
  else if(gatheringType==='food_fashion_fun') partyTitle='Food, Fashion & What Women Are Talking About';
  else if(mood==='fabulous') partyTitle='Our Fabulous Sister Circle';
  else if(gatheringType==='brunch') partyTitle='Saturday Sister Brunch';
  // These are editable template names, not assumptions about the host's age or chosen weekday.
  if(partyTitle==='Saturday Sister Brunch'&&preferredDate&&new Date(preferredDate+'T12:00:00').getDay()!==6) partyTitle='Sister Brunch';
  const pack=reason==='encouragement'?'encouragement':reason==='starting_over'?'fresh':reason==='celebration'?'celebration':reason==='laughter'?'laughter':['meet_new_women','meaningful_conversation'].includes(reason)?'connection':'everyday';
  const scripture={...GP_SCRIPTURES[pack==='encouragement'?'encouragement':pack==='fresh'?'fresh':['celebration','laughter'].includes(pack)?'joy':'friendship']};
  const menuLevels=[['Tea or coffee from the pantry','Simple toast or a shared snack'],['Tea, coffee and water','Seasonal fruit','A simple baked treat'],['Tea, coffee and water','Seasonal fruit','A shared main dish'],['Tea, coffee and sparkling water','A shared main dish and salad','Fruit or a small dessert'],['A welcome drink and water','A main dish with two sides','A shared dessert']];
  const tier=GP_OPTIONS.budgetRange.findIndex(x=>x[0]===budgetRange);
  let menu=[...menuLevels[tier]];
  if(gatheringType==='brunch') menu=menu.map(x=>x.includes('main dish')?'Egg bake or a plant-based brunch dish':x);
  if(gatheringType==='dinner') menu=menu.map(x=>x.includes('main dish')?'A one-pot supper with a vegetarian option':x);
  if(gatheringType==='coffee') menu=menu.slice(0,2);
  if(gatheringType==='event_outing') menu=['Agree together whether to eat before or after the outing.','Check venue menu prices before booking.'];
  if(foodMethod==='no_food') menu=['No food planned. Make drinking water available.'];
  const contributionSuggestions=foodMethod==='potluck'?['Ask one sister to bring a dish.','Ask another to bring drinks.','Confirm portions and dietary needs before shopping.']:[];
  const shoppingList=foodMethod==='no_food'?['Drinking water']:foodMethod==='takeaway'?['Confirm the order, portions and total with the restaurant.','Water, serving utensils and napkins.']:['Check the pantry before buying.',...menu.map(x=>'Ingredients for: '+x),'Water, napkins and serving utensils.'];
  let checklist=['Choose a date and confirm the place.','Invite your circle and ask guests to reply directly to you.','Ask about dietary needs and step-free access.'];
  if(guestCount>4) checklist.push('Count seats and plan enough table space.');
  if(guestCount>8) checklist.push('Ask a co-host to help welcome everyone.');
  if(guestCount>16) checklist.push('Confirm the venue capacity and divide hosting tasks.');
  if(guestCount>24) checklist.push('Organize smaller conversation circles.');
  if(indoorOutdoor==='outdoor'||gatheringType==='porch_patio'||locationType==='park') checklist.push('Choose a weather backup and check access to restrooms.');
  if(foodMethod==='potluck') checklist.push('Confirm who is bringing each item.');
  if(foodMethod==='takeaway') checklist.push('Schedule collection or delivery.');
  checklist.push('Prepare the conversation questions.','Set aside '+durationMinutes+' minutes; leave room for everyone to speak.','Afterward, thank each woman for coming.');
  let conversationQuestions=[...GP_PACKS[pack]];
  const source=story&&gpText(story.headline)?{id:gpText(story.id,120),headline:gpText(story.headline,250),category:gpText(story.category,120),image:gpText(story.image,1000),question:gpText(story.question),scripture:gpText(story.scripture),url:gpText(story.url,1000)}:null;
  if(source) {conversationQuestions.unshift(source.question||'What stood out to you in “'+source.headline+'”?');if(source.scripture){scripture.reference=source.scripture;scripture.text='Read this passage together if your circle would enjoy it.';}}
  const voice=['elegant','beautiful'].includes(mood)?'elegant':['joyful','fabulous'].includes(mood)?'joyful':'warm';
  const description='A '+(mood==='surprise_me'?'joyful':gpLabel('mood',mood).toLowerCase())+' '+durationMinutes+'-minute '+gpLabel('gatheringType',gatheringType).toLowerCase()+' gathering for '+guestCount+' women, including you. '+gpLabel('reason',reason)+'.';
  return {partyTitle,description,groupType,gatheringType,mood,reason,guestCount,durationMinutes,locationType,indoorOutdoor,preferredDate,preferredTime,dateUndecided:!preferredDate,foodMethod,estimatedBudgetLow:budget[0],estimatedBudgetHigh:budget[1],budgetNote:'A planning target for the whole gathering, not a price quote. Check local costs and adjust portions. '+(foodMethod==='potluck'?'Includes the value of shared contributions. ':'')+(gatheringType==='event_outing'?'Confirm any tickets and transport separately.':''),menu,shoppingList,contributionSuggestions,checklist,conversationQuestions,scripture,invitationVoice:voice,hostNote:gpText(input.hostNote),photoSuggestion:'If everyone agrees, take one photo together. Ask separately before posting or submitting it.',sourceStoryId:source?source.id:null,sourceStory:source};
}
function gpInvitation(plan,hostName='',voice=plan.invitationVoice) {
  const openings={warm:'I would love to spend some time with you.',joyful:'Let’s make a little room for laughter and something lovely!',elegant:'You are warmly invited to a gathering of good company and conversation.'};
  return [openings[voice]||openings.warm,plan.partyTitle,plan.description,'When: '+(plan.preferredDate||'We will choose a date together')+(plan.preferredTime?' at '+plan.preferredTime:''),'Where: '+gpLabel('locationType',plan.locationType)+' — I will share the details directly.','Please reply to me to let me know whether you can come.',plan.hostNote,hostName?'With love, '+gpText(hostName,80):''].filter(Boolean).join('\n\n');
}
if(typeof module!=='undefined') module.exports={gpGenerate,gpInvitation,GP_OPTIONS};
