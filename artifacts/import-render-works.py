from PIL import Image, ImageOps
from pathlib import Path
import json
folder=Path(r'D:\作品整理\渲染单品and动效\渲染'); output=Path('public/assets/render-works'); output.mkdir(exist_ok=True)
manifest=json.loads(Path('artifacts/render-import-manifest.json').read_text(encoding='utf-8'))
categories=[('handheld-fans','手持风扇',[1,5,26,27,32,36,37,38,39,44,46,47,55]),('neck-fans','挂脖风扇',[2,4,19,25,28,29,40,51,52,53,56]),('chargers','充电器',[6,7,8,9,10,11,18,20,21,30]),('power-banks','充电宝',[12,13,14,15,16,17,23,50]),('audio','耳机与音响',[22,24,33,41,54]),('car-chargers','车载充电器',[48,49]),('cleaning','清洁电器',[3,31]),('outdoor-power','户外电源',[45]),('other','其他',[34,35,42,43])]
nums=[n for _,_,numbers in categories for n in numbers]; assert sorted(nums)==list(range(1,57))
for entry in manifest:
 with Image.open(folder/entry['name']) as source:
  im=ImageOps.exif_transpose(source).convert('RGB'); im.thumbnail((2400,2400),Image.Resampling.LANCZOS)
  im.save(output/f'render-{entry["number"]:02}.webp','WEBP',quality=90,method=4)
 print(f'Imported {entry["number"]}/56',flush=True)
groups=[]
for id,label,numbers in categories:
 items=[]
 for n in numbers:
  title=Path(manifest[n-1]['name']).stem
  if title=='1' or title.startswith('ComfyUI_'): title=f'{label}场景 {n:02}'
  items.append(dict(src=f'/assets/render-works/render-{n:02}.webp',alt=f'{label} · {title}',title=title))
 if id=='cleaning': items.append(dict(src='/assets/work-ai-custom.png',alt='扫地机器人空间视觉',title='产品场景'))
 if id=='other': items.extend([dict(src='/assets/work-product-custom.png',alt='文具产品三维渲染',title='产品阵列'),dict(src='/assets/work-motion-custom.png',alt='登山扣材质光影渲染',title='材质与光影')])
 groups.append(dict(id=id,label=label,items=items))
Path('src/data/renderWorks.js').write_text('// Product groups for the imported 3D renders and existing works.\nexport const renderWorkGroups = '+json.dumps(groups,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print(json.dumps([(g['label'],len(g['items'])) for g in groups],ensure_ascii=False))
print('Total WebP MB:',round(sum(p.stat().st_size for p in output.glob('*.webp'))/1024/1024,2))
