from pathlib import Path
import sys, subprocess, json
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'.tools/media'))
import imageio_ffmpeg
from fontTools import subset
from fontTools.ttLib import TTFont
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
report={}
for name in ('hero-video-1','hero-video-2'):
    source=root/'public/assets'/f'{name}.mp4'
    for suffix,height,crf in [('mobile-hq',900,23),('web',1080,24)]:
        target=source.with_name(f'{name}-{suffix}.mp4')
        subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(source),'-map','0:v:0','-an','-vf',f'scale=-2:{height}','-c:v','libx264','-preset','medium','-crf',str(crf),'-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
        report[target.name]=target.stat().st_size
    if name=='hero-video-1':
        subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(source),'-frames:v','1','-vf','scale=1280:-2',str(root/'artifacts/hero-poster.png')],check=True)
        from PIL import Image
        with Image.open(root/'artifacts/hero-poster.png') as im:
            im.save(root/'public/assets/hero-poster.webp',quality=90,method=6)
chars=set(chr(i) for i in range(32,127))
for path in (root/'src').rglob('*'):
    if path.suffix in ('.jsx','.js','.css'): chars.update(path.read_text(encoding='utf-8'))
font=TTFont(root/'public/fonts/HarmonyOS_SansSC_Regular.ttf')
options=subset.Options(); options.flavor='woff2'
subsetter=subset.Subsetter(options=options); subsetter.populate(unicodes=[ord(c) for c in chars]); subsetter.subset(font)
font.flavor='woff2'; target=root/'public/fonts/HarmonyOS-SansSC-site.woff2'; font.save(target)
report[target.name]=target.stat().st_size
report['hero-poster.webp']=(root/'public/assets/hero-poster.webp').stat().st_size
(root/'artifacts/mobile-loading-assets.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report),flush=True)
