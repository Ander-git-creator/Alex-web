from pathlib import Path
from PIL import Image
import json

source = Path(r'D:\作品整理\G1EX\新版本\主图A+')
output = Path('public/assets/ecommerce/g1ex')
output.mkdir(parents=True, exist_ok=True)
groups = {'square': [], 'wide': []}
manifest = []

def save(image, kind, original, region=None):
    filename = f'{kind}-{len(groups[kind]) + 1:02}.webp'
    image.save(output / filename, 'WEBP', quality=92, method=6)
    groups[kind].append({'src': f'/assets/ecommerce/g1ex/{filename}', 'alt': f'G1EX头盔蓝牙耳机 · {original.stem}' + (f' · {region}' if region else ''), 'aspectRatio': image.width / image.height})
    manifest.append({'source': str(original), 'output': filename, 'size': image.size, 'region': region})

for name in ['2.png', '3.png', '4.png', '5.png', '6.png', '7.png', 'A+1-2.png', 'A+3.png', 'A+4-5.png', 'A+6.png', '应用场景.png']:
    original = source / name
    with Image.open(original) as image:
        ratio = image.width / image.height
        if abs(ratio - 1) < .02:
            save(image, 'square', original)
        elif abs(ratio - 2.44) < .02:
            save(image, 'wide', original)
        elif name in ['A+1-2.png', 'A+4-5.png']:
            save(image, 'wide', original)
        else:
            raise ValueError(f'Unexpected image dimensions: {original}: {image.size}')

Path('src/data/ecommerceG1EX.js').write_text('// G1EX combined A+ panels are kept as complete images.\nexport const g1exImages = ' + json.dumps(groups, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
Path('artifacts/g1ex-import-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print({key: len(value) for key, value in groups.items()})
