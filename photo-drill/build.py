#!/usr/bin/env python3
"""写真ドリルのビルド。

使い方:  python3 build.py
  - src/content/*.js の版ごとに dist/<版>/ を作る（公開用）
  - dist/preview/<版>.html も作る（見本写真の場所が見える確認用・1ファイル）
  - 購入コードは codes.json（Git管理外）から読む。なければ自動で作る
"""
import hashlib, json, re, secrets, shutil, string
from pathlib import Path

ROOT = Path(__file__).parent
SRC, DIST, PHOTOS = ROOT / "src", ROOT / "dist", ROOT / "photos"
CODES = ROOT / "codes.json"


def field(js, name):
    m = re.search(rf'\b{name}:\s*"([^"]*)"', js)
    if not m:
        raise SystemExit(f"{name} が見つかりません")
    return m.group(1)


def new_code(prefix):
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    part = lambda: "".join(secrets.choice(alphabet) for _ in range(4))
    return f"{prefix.upper()}-{part()}-{part()}"


def icon_svg(accent):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="112" fill="{accent}"/>
<path d="M150 190v-40h40M322 150h40v40M362 322v40h-40M190 362h-40v-40" fill="none" stroke="#ffcc00" stroke-width="24" stroke-linecap="square"/>
<circle cx="256" cy="256" r="58" fill="none" stroke="#fff" stroke-width="22"/>
</svg>'''


def icon_png(accent, path, size=180):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return False
    s = size / 512
    img = Image.new("RGB", (size, size), accent)
    d = ImageDraw.Draw(img)
    w = max(2, round(24 * s))
    for pts in [((150, 190), (150, 150), (190, 150)), ((322, 150), (362, 150), (362, 190)),
                ((362, 322), (362, 362), (322, 362)), ((190, 362), (150, 362), (150, 322))]:
        d.line([(x * s, y * s) for x, y in pts], fill="#ffcc00", width=w)
    r = 58 * s
    d.ellipse([256 * s - r, 256 * s - r, 256 * s + r, 256 * s + r], outline="#ffffff", width=max(2, round(22 * s)))
    img.save(path)
    return True


def main():
    codes = json.loads(CODES.read_text(encoding="utf-8")) if CODES.exists() else {}
    template = (SRC / "template.html").read_text(encoding="utf-8")
    head_t, body_t = template.split("<!--BODY-->")
    style = (SRC / "style.css").read_text(encoding="utf-8")
    engine = (SRC / "engine.js").read_text(encoding="utf-8")
    (DIST / "preview").mkdir(parents=True, exist_ok=True)

    for content_file in sorted((SRC / "content").glob("*.js")):
        js = content_file.read_text(encoding="utf-8")
        vid, name, short, sub = field(js, "id"), field(js, "name"), field(js, "short"), field(js, "sub")
        accent, accent_dark = field(js, "accent"), field(js, "accentDark")

        if not codes.get(vid):
            codes[vid] = [new_code(vid)]
        hashes = [hashlib.sha256(f"{vid}:{c.upper()}".encode()).hexdigest() for c in codes[vid]]
        js = re.sub(r"codeHashes:\s*\[[^\]]*\]", "codeHashes: " + json.dumps(hashes), js)

        def fill(t, preview, pwa):
            return (t.replace("{{TITLE}}", name).replace("{{SHORT}}", short).replace("{{SUB}}", sub)
                     .replace("{{ACCENT}}", accent).replace("{{ACCENT_DARK}}", accent_dark)
                     .replace("{{PWA_LINKS}}", pwa).replace("{{STYLE}}", style)
                     .replace("{{CONTENT}}", js).replace("{{ENGINE}}", engine)
                     .replace("{{PREVIEW}}", "true" if preview else "false"))

        # 公開用
        out = DIST / vid
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)
        pwa = ('<link rel="manifest" href="manifest.webmanifest">\n'
               '<link rel="icon" href="icon.svg" type="image/svg+xml">\n'
               '<link rel="apple-touch-icon" href="icon-180.png">')
        html = ('<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
                '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
                + fill(head_t, False, pwa) + "\n</head>\n<body>\n" + fill(body_t, False, pwa) + "\n</body>\n</html>\n")
        (out / "index.html").write_text(html, encoding="utf-8")
        (out / "icon.svg").write_text(icon_svg(accent), encoding="utf-8")
        icon_png(accent, out / "icon-180.png", 180)
        icon_png(accent, out / "icon-512.png", 512)

        photos = []
        if (PHOTOS / vid).exists():
            shutil.copytree(PHOTOS / vid, out / "photos")
            photos = sorted("photos/" + p.name for p in (out / "photos").glob("*.jpg"))

        (out / "manifest.webmanifest").write_text(json.dumps({
            "name": name, "short_name": short, "description": sub, "lang": "ja",
            "start_url": "./", "scope": "./", "display": "standalone",
            "background_color": "#f6f4f2", "theme_color": accent,
            "icons": [{"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
                      {"src": "icon.svg", "sizes": "any", "type": "image/svg+xml"}],
        }, ensure_ascii=False, indent=2), encoding="utf-8")

        version = hashlib.sha256(html.encode()).hexdigest()[:10]
        files = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-512.png"] + photos
        (out / "sw.js").write_text(
            f"const C='{vid}-{version}';const F={json.dumps(files)};\n"
            "self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});\n"
            "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});\n"
            "self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});\n",
            encoding="utf-8")

        # 確認用（1ファイル・見本写真の置き場所を表示）
        (DIST / "preview" / f"{vid}.html").write_text(fill(head_t, True, "") + fill(body_t, True, ""), encoding="utf-8")
        print(f"{name}: dist/{vid}/  ミッション {js.count('{id:')} 個 / 見本写真 {len(photos)} 枚 / 購入コード {', '.join(codes[vid])}")

    CODES.write_text(json.dumps(codes, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
