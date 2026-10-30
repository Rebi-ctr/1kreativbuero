"""Optimierte Auslieferungsdateien; Originale bleiben unverändert. Benötigt Pillow."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets'
for name, widths in [('Background.png', [3072]), ('Beni.png', [320, 640, 1028]),
                     ('Rebecca.png', [320, 640, 1026]), ('Mathis.png', [320, 640, 1028]),
                     ('Wiriehorn_Sommer_Test.webp', [800, 1600]),
                     ('Wiriehorn_Winter_Test.webp', [800, 1600])]:
    with Image.open(root / name) as source:
        for width in widths:
            size = (width, round(source.height * width / source.width))
            image = source.resize(size, Image.Resampling.LANCZOS) if size != source.size else source.copy()
            target = root / f'{Path(name).stem}-{width}.webp'
            # PNG-Ableitungen verlustfrei speichern, inklusive freigestellter Porträts.
            image.save(target, 'WEBP', lossless=name.endswith('.png'), quality=90, method=6)
            print(f'{target.name}: {size[0]} x {size[1]}, {target.stat().st_size:,} Bytes')
