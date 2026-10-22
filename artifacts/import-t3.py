from pathlib import Path
from PIL import Image
import json
source = Path(r'D:\作品整理\T3\新版本\主图A+')
out = Path('public/assets/ecommerce/t3')
out.mkdir(parents=True, exist_ok=True)
groups = {'square': [], 'wide': []}
manifest = []
for f in sorted(source.glob('*.png')):
    with Image.open(f) as im:
        ratio = im.width / im.height
        kind = 'square' if abs(ratio - 1) < .02 else 'wide' if abs(ratio - 2.4) < .08 or f.name == '01功能板.png' else None
        if kind is None:
            manifest.append({'source': str(f), 'status': 'unmatched', 'size': im.size})
            continue
        filename = 'wide-feature.webp' if f.name == '01功能板.png' else f'{kind}-{sum(1 for image in groups[kind] if not image["src"].endswith("wide-feature.webp")) + 1:02}.webp'
        im.save(out / filename, 'WEBP', quality=92, method=6)
        groups[kind].append({'src': f'/assets/ecommerce/t3/{filename}', 'alt': f'T3头盔蓝牙耳机 · {f.stem}', 'aspectRatio': ratio})
        if f.name == '01功能板.png':
            groups[kind][-1]['cardAspectRatio'] = 2.4 / 2
        manifest.append({'source': str(f), 'output': filename, 'size': im.size})
Path('src/data/ecommerceT3.js').write_text('// T3 case images grouped by their original aspect ratio.\nexport const t3Images = ' + json.dumps(groups, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
Path('artifacts/t3-import-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print({k: len(v) for k,v in groups.items()})
