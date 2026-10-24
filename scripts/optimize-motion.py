from pathlib import Path
from PIL import Image, ImageSequence
import json
folder=Path('public/assets/motion')
before=after=0
for path in folder.glob('*.gif'):
    target=path.with_suffix('.webp')
    with Image.open(path) as source:
        frames=[]
        durations=[]
        for frame in ImageSequence.Iterator(source):
            image=frame.convert('RGBA')
            image.thumbnail((1000,1000), Image.Resampling.LANCZOS)
            frames.append(image)
            durations.append(frame.info.get('duration',100))
        frames[0].save(target,'WEBP',save_all=True,append_images=frames[1:],duration=durations,loop=0,quality=82,method=4)
        with Image.open(target) as result:
            assert result.n_frames == len(frames), (path, result.n_frames, len(frames))
        frames.clear()
    before+=path.stat().st_size
    after+=target.stat().st_size
    print(path.name,path.stat().st_size,target.stat().st_size,flush=True)
print(json.dumps({'beforeBytes':before,'afterBytes':after}),flush=True)
