from pathlib import Path
import re,json
root=Path(__file__).resolve().parent.parent
build=root/'garden-build'
js=(build/'plan-generator.cjs').read_text().replace("if(typeof module!=='undefined') module.exports={gpGenerate,gpInvitation,GP_OPTIONS};",'')+'\n'+(build/'builder-ui.js').read_text()
section=(build/'builder.html').read_text()+'\n{% stylesheet %}\n'+(build/'builder.css').read_text()+'\n{% endstylesheet %}\n{% javascript %}\n'+js+'\n{% endjavascript %}\n{% schema %}\n'+json.dumps({'name':'Garden Party Planner','settings':[],'presets':[{'name':'Garden Party Planner'}]})+'\n{% endschema %}\n'
(root/'theme/sections/garden-party-mvp.liquid').write_text(section)
