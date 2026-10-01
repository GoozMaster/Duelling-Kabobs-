"""
Narration: one clip per line of narration.json, voiced locally with Kokoro.

The site's explainer uses Microsoft's neural voices; this one runs offline so
it builds anywhere. Each clip is trimmed to the speech (plus 40ms of air) so
the timeline can lay lines end to end from the measured lengths.

  python3 tools/voice.py            every line
  python3 tools/voice.py l05 l07    just these

Needs:  pip install kokoro-onnx soundfile
and KOKORO_DIR pointing at kokoro-v1.0.onnx + voices-v1.0.bin
(github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).
"""
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get("KOKORO_DIR", ".")
VOICE, SPEED = "am_michael", 1.08

lines = json.load(open(os.path.join(ROOT, "narration.json")))
only = set(sys.argv[1:])
timing_path = os.path.join(ROOT, "narration-timing.json")
timing = json.load(open(timing_path)) if os.path.exists(timing_path) else {}
k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))

def trim(x, sr):
    win = int(sr * 0.005)
    thresh = 10 ** (-50 / 20)
    loud = [np.abs(x[i:i + win]).max() > thresh for i in range(0, len(x) - win, win)]
    first = loud.index(True) * win
    last = (len(loud) - 1 - loud[::-1].index(True)) * win + win
    pad = int(sr * 0.04)
    y = x[max(0, first - pad):min(len(x), last + pad)].copy()
    f = int(sr * 0.008)
    ramp = np.linspace(0, 1, f)
    y[:f] *= ramp
    y[-f:] *= ramp[::-1]
    return y

for line in lines:
    if only and line["id"] not in only:
        continue
    samples, sr = k.create(line["text"], voice=VOICE, speed=SPEED, lang="en-us")
    clip = trim(np.asarray(samples, dtype=np.float32), sr)
    sf.write(os.path.join(ROOT, "assets/vo", line["id"] + ".wav"), clip, sr, subtype="PCM_16")
    timing[line["id"]] = round(len(clip) / sr, 3)
    print(line["id"], f'{timing[line["id"]]:.2f}s', line["text"])

json.dump(timing, open(timing_path, "w"), indent=2)
