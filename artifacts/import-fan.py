from pathlib import Path
from PIL import Image
import json

source = Path(r'D:\作品整理\手持风扇\主图A+')
output = Path('public/assets/ecommerce/fan')
output.mkdir(parents=True, exist_ok=True)
groups = {'square': [], 'wide': []}
manifest = []

for name in ['1-首图.png', '2-20000rpm.png', '100.png', '风力.png', '续航.png', 'size.png', '1464 A+.png']:
    original = source / name
    with Image.open(original) as image:
        kind = 'wide' if 'A+' in name else 'square'
        filename = f'{kind}-{len(groups[kind]) + 1:02}.webp'
        image.save(output / filename, 'WEBP', quality=92, method=6)
        groups[kind].append({'src': f'/assets/ecommerce/fan/{filename}', 'alt': f'MINI手持风扇 · {original.stem}', 'aspectRatio': image.width / image.height})
        manifest.append({'source': str(original), 'output': filename, 'size': image.size})

Path('src/data/ecommerceFan.js').write_text('// Fan main images and one complete A+ image, without splitting.\nexport const fanImages = ' + json.dumps(groups, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
Path('artifacts/fan-import-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print({kind: len(images) for kind, images in groups.items()})
