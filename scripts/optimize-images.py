from pathlib import Path
from PIL import Image
import json
root = Path.cwd()
mapping = {}
before = after = 0
files = list((root/'public/assets').glob('*.png')) + list((root/'public/assets/hero-gallery').glob('*.png'))
for path in files:
    if path.stat().st_size < 400_000 or path.name.startswith('reference'): continue
    target = path.with_suffix('.webp')
    with Image.open(path) as im:
        im.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
        im.save(target, 'WEBP', quality=88, method=6)
    if target.stat().st_size >= path.stat().st_size: continue
    mapping[path.name] = target.name
    before += path.stat().st_size
    after += target.stat().st_size
for path in (root/'src').rglob('*'):
    if path.suffix not in ('.js', '.jsx', '.css'): continue
    content = path.read_text(encoding='utf-8')
    updated = content
    for old,new in mapping.items(): updated = updated.replace(old,new)
    if updated != content: path.write_text(updated,encoding='utf-8')
print(json.dumps({'images':len(mapping),'beforeBytes':before,'afterBytes':after}))
