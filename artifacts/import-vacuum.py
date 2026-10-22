from pathlib import Path
from PIL import Image
import json
import re

source = Path(r'D:\作品整理\吸尘器\主图A+')
output = Path('public/assets/ecommerce/vacuum')
output.mkdir(parents=True, exist_ok=True)
groups = {'square': [], 'wide': []}
manifest = []

def natural_key(path):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r'(\d+)', path.name)]

for original in sorted(source.glob('*.png'), key=natural_key):
    with Image.open(original) as image:
        kind = 'square' if image.width < image.height else 'wide'
        filename = f'{kind}-{len(groups[kind]) + 1:02}.webp'
        image.save(output / filename, 'WEBP', quality=92, method=6)
        groups[kind].append({'src': f'/assets/ecommerce/vacuum/{filename}', 'alt': f'多功能吸尘器 · {original.stem}', 'aspectRatio': image.width / image.height})
        manifest.append({'source': str(original), 'output': filename, 'size': image.size})

Path('src/data/ecommerceVacuum.js').write_text('// Vacuum main images and complete A+ panels, in natural filename order.\nexport const vacuumImages = ' + json.dumps(groups, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
Path('artifacts/vacuum-import-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print({kind: len(images) for kind, images in groups.items()})
