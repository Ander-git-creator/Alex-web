from pathlib import Path
from PIL import Image
import json
import re

source = Path(r'D:\作品整理\JX09 PRO\PSD-EN 新版本')
output = Path('public/assets/ecommerce/jx09')
output.mkdir(parents=True, exist_ok=True)
groups = {'square': [], 'wide': []}
manifest = []

def natural_key(path):
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r'(\d+)', path.name)]

for kind, folder in [('square', source / '主图/主图'), ('wide', source / 'A+/A+')]:
    for index, original in enumerate(sorted(folder.glob('*.png'), key=natural_key), 1):
        with Image.open(original) as image:
            filename = f'{kind}-{index:02}.webp'
            image.save(output / filename, 'WEBP', quality=92, method=6)
            groups[kind].append({'src': f'/assets/ecommerce/jx09/{filename}', 'alt': f'JX09 PRO头盔蓝牙耳机 · {original.stem}', 'aspectRatio': image.width / image.height})
            manifest.append({'source': str(original), 'output': filename, 'size': image.size})

# Keep the compatibility panel last without changing the asset filenames.
groups['wide'].sort(key=lambda image: image['alt'].endswith(' · 9-UNIVE'))

Path('src/data/ecommerceJX09.js').write_text('// JX09 PRO main images and complete A+ panels.\nexport const jx09Images = ' + json.dumps(groups, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
Path('artifacts/jx09-import-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print({kind: len(images) for kind, images in groups.items()})
