"""Generate mobile animation assets without changing desktop originals."""
from pathlib import Path
from PIL import Image, ImageSequence
import json

folder = Path(__file__).resolve().parents[1] / 'public/assets/motion'
report = []
for source in sorted(folder.glob('*.webp')):
    if '-mobile' in source.stem:
        continue
    target = source.with_stem(source.stem + '-mobile')
    frames, durations = [], []
    with Image.open(source) as animation:
        for frame in ImageSequence.Iterator(animation):
            image = frame.convert('RGBA')
            image.thumbnail((560, 560), Image.Resampling.LANCZOS)
            frames.append(image)
            durations.append(frame.info.get('duration', 40))
    frames[0].save(target, save_all=True, append_images=frames[1:],
                   duration=durations, loop=0, quality=78, method=4)
    with Image.open(target) as result:
        assert result.n_frames == len(frames)
    report.append({'file': source.name, 'original': source.stat().st_size,
                   'mobile': target.stat().st_size, 'frames': len(frames)})
print(json.dumps(report, indent=2))
