from pathlib import Path
import re,json
root=Path(__file__).resolve().parent.parent
p=root/'theme/sections/garden-party-visible.liquid'
s=p.read_text()
for label,value in [('one girlfriend','one_friend'),('close friends','close_friends'),('church women','church_women'),('sorority sisters','sorority_sisters'),('neighbors','neighbors'),('family women','family_women')]:
    s=s.replace('aria-label="Start a Garden Party with '+label+'"','data-gp-group="'+value+'" aria-label="Start a Garden Party with '+label+'"')
s=s.replace('sorority_sisters.jpg?v=1788067254','close_friends.jpg?v=1788067203').replace('alt="Sorority sisters spending time together"','alt="Women enjoying a sister circle gathering"')
p.write_text(s)
p=root/'theme/sections/network-eve-report.liquid'
s=p.read_text()
s=re.sub(r'<div class="eve-hero-placeholder"[\s\S]*?</div>\s*{% endif %}', '<img class="eve-hero-photo" src="https://cdn.shopify.com/s/files/1/0766/0335/9530/files/eve-editorial-conversation-hero.png?v=1789357663" alt="Editorial illustration of mature women enjoying conversation at a cafe table" width="1672" height="941" loading="lazy">\n        {% endif %}',s,count=1)
s=s.replace('data-eve-gather>','data-eve-gather data-gp-story-url="{{ section.settings.story_link | escape }}" data-gp-story-id="{{ section.settings.story_id | escape }}" data-gp-story-headline="{{ section.settings.hero_heading | escape }}" data-gp-story-question="{{ section.settings.story_question | escape }}" data-gp-story-scripture="{{ section.settings.story_scripture | escape }}">')
s=s.replace('<h3>THE EVE FIVE</h3>','<h3 id="eve-five-title">THE EVE FIVE</h3>')
s=s.replace('<button class="eve-save"','{% if section.settings.story_link != blank %}<button class="eve-save"').replace('<span>♡</span> Save</button>','<span>♡</span> Save</button>{% endif %}')
s=s.replace('<button class="eve-gather-link"','<p data-eve-status role="status" aria-live="polite"></p><button class="eve-gather-link"')
start=s.index('<script>');end=s.index('</script>',start)+len('</script>')
s=s[:start]+'''<script>(function(){const r=document.getElementById({{ sid | json }});if(!r)return;const note=r.querySelector('[data-eve-status]');const sh=r.querySelector('[data-eve-share]');if(sh)sh.addEventListener('click',async()=>{const d={title:'The EVE Report — Women of Color',text:'Something from The EVE Report worth sharing.',url:new URL(sh.dataset.shareUrl,location.origin).href};try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(d.url);note.textContent='Link copied. Paste it into a message to your sister.';}}catch(e){if(e.name!=='AbortError')note.textContent='Share this page by copying its address from your browser.';}});const s=r.querySelector('[data-eve-save]');if(s)s.addEventListener('click',()=>{try{const url=new URL(sh.dataset.shareUrl,location.origin).href;const existing=JSON.parse(localStorage.getItem('woc-eve-saved')||'[]');const saved=Array.isArray(existing)?existing:[];if(!saved.includes(url))saved.push(url);localStorage.setItem('woc-eve-saved',JSON.stringify(saved.slice(-50)));note.replaceChildren(document.createTextNode('Saved in this browser. '));const a=document.createElement('a');a.href=url;a.textContent='Open saved story';a.style.color='inherit';note.append(a);s.setAttribute('aria-pressed','true');s.querySelector('span').textContent='♥';}catch(e){note.textContent='Browser saving is unavailable. Bookmark this story to keep it.';}})})();</script>'''+s[end:]
schema_match=re.search(r'{% schema %}(.*?){% endschema %}',s,re.S);schema=json.loads(schema_match.group(1))
schema['settings'] += [{'type':'text','id':'story_id','label':'Story identifier'}, {'type':'textarea','id':'story_question','label':'Garden Party conversation question'}, {'type':'text','id':'story_scripture','label':'Optional story Scripture reference'}]
s=s[:schema_match.start(1)]+json.dumps(schema)+s[schema_match.end(1):]
s+='\n<style>#{{ sid }} .eve-five{background:#080d0a}#{{ sid }} .eve-hero-photo{object-position:65% center}#{{ sid }} [data-eve-status]:empty{display:none}</style>\n'
p.write_text(s)
