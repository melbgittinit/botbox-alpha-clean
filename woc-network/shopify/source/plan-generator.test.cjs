const assert=require('node:assert/strict');
const {gpGenerate,gpInvitation,GP_OPTIONS}=require('./plan-generator.cjs');
const one=gpGenerate({groupType:'one_friend',gatheringType:'coffee'});
assert.equal(one.guestCount,2);assert.equal(one.partyTitle,'Coffee With One Girlfriend');
const potluck=gpGenerate({guestCount:12,foodMethod:'potluck',budgetRange:'25_50',indoorOutdoor:'outdoor',reason:'starting_over'});
assert.equal(potluck.estimatedBudgetHigh,50);assert(potluck.contributionSuggestions.length);assert(potluck.checklist.some(x=>x.includes('weather')));assert.equal(potluck.scripture.reference,'Lamentations 3:23 (KJV)');
assert.equal(gpGenerate({foodMethod:'no_food'}).shoppingList.length,1);
assert.equal(gpGenerate({foodMethod:'host'}).contributionSuggestions.length,0);
assert(gpGenerate({foodMethod:'takeaway'}).checklist.some(x=>x.includes('delivery')));
assert.equal(gpGenerate({guestCount:Infinity,budgetRange:'not_a_budget'}).estimatedBudgetHigh,100);
assert.equal(gpGenerate({guestCount:1000}).guestCount,40);
const source={id:'s1',headline:'Sisters in our city',question:'How can we welcome new neighbors?',scripture:'Romans 12:13',url:'https://example.test/story'};
const seeded=gpGenerate({},source);assert.equal(seeded.sourceStoryId,'s1');assert.equal(seeded.conversationQuestions[0],source.question);assert.equal(seeded.scripture.reference,source.scripture);
assert.deepEqual(gpGenerate({gatheringType:'surprise_me'}),gpGenerate({gatheringType:'surprise_me'}));
const date=gpGenerate({preferredDate:'2026-10-10',preferredTime:'14:30',dateUndecided:false});assert.equal(date.preferredDate,'2026-10-10');assert(gpInvitation(date,'Angela').includes('14:30'));assert(gpInvitation(date,'Angela').includes('Angela'));
assert.equal(gpGenerate({preferredDate:'2026-10-10',dateUndecided:true}).preferredDate,'');
for(const [key,options] of Object.entries(GP_OPTIONS))for(const [value] of options){const plan=gpGenerate({[key]:value});assert(Number.isFinite(plan.estimatedBudgetLow));assert(plan.menu.length);assert(plan.conversationQuestions.length>=3);}
console.log('Generator checks passed: all option values, budgets, counts, menus, source story, dates, deterministic templates, invitation personalization.');
