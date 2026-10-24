from pathlib import Path
import sys, subprocess, json
sys.path.insert(0,str(Path('.tools/media').resolve()))
import imageio_ffmpeg
from fontTools import subset
from fontTools.ttLib import TTFont
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
for name in ('hero-video-1','hero-video-2'):
    r=subprocess.run([ffmpeg,'-hide_banner','-i',str(Path('public/assets')/(name+'.mp4'))],capture_output=True,text=True)
    print(r.stderr[-2500:])
print(ffmpeg)
