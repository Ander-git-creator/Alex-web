from pathlib import Path
from PIL import Image,ImageOps
import json
folder=Path(r'D:\作品整理\渲染单品and动效\渲染')
manifest=json.loads(Path('artifacts/render-import-manifest.json').read_text(encoding='utf-8'))
p=Path('src/data/renderWorks.js');groups=json.loads(p.read_text(encoding='utf-8').split(' = ',1)[1].rstrip().removesuffix(';'))
sourceByNumber={e['number']:folder/e['name'] for e in manifest}
current={f.name for f in folder.iterdir() if f.suffix.lower() in ('.jpg','.jpeg','.png','.webp')}
assert current <= {e['name'] for e in manifest},'New images need inspection'
count=0
for group in groups:
 kept=[]
 for item in group['items']:
  if '/render-works/' not in item['src']: continue
  n=int(Path(item['src']).stem.split('-')[-1]); source=sourceByNumber[n]
  if not source.exists(): continue
  with Image.open(source) as im:
   im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((2400,2400),Image.Resampling.LANCZOS);im.save('public'+item['src'],'WEBP',quality=90,method=4)
  kept.append(item);count+=1
 group['items']=kept
 print(group['id'],len(kept),flush=True)
groups=[g for g in groups if g['items']]
assert count==len(current)
p.write_text('// Current source folder images, ordered by product type.\nconst renderWorkGroups = '+json.dumps(groups,ensure_ascii=False,indent=2)+';\n\nexport const renderWorks = renderWorkGroups.flatMap(group => group.items);\n',encoding='utf-8')
print('Current folder images:',count,flush=True)
