from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidence"
OUT = ROOT / "assets" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)


def font(size=17):
    candidates = [
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\CascadiaMono.ttf",
        r"C:\Windows\Fonts\cour.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


MONO = font()
TITLE = font(20)


def section(text, heading, next_heading=None):
    start = text.find(heading)
    if start == -1:
        return heading + "\nSection not found."
    if next_heading:
        end = text.find(next_heading, start + len(heading))
        if end != -1:
            return text[start:end].strip()
    following = text.find("\n=== ", start + len(heading))
    if following != -1:
        return text[start:following].strip()
    return text[start:].strip()


def render(name, title, body, max_lines=42, width_chars=96):
    lines = []
    for raw in body.replace("\t", "    ").splitlines():
        if len(raw) <= width_chars:
            lines.append(raw)
        else:
            lines.extend(textwrap.wrap(raw, width=width_chars, replace_whitespace=False, drop_whitespace=False))
    lines = lines[:max_lines]

    line_h = 23
    pad = 26
    header_h = 52
    width = 1320
    height = max(260, header_h + pad + line_h * len(lines) + pad)
    img = Image.new("RGB", (width, height), "#061621")
    draw = ImageDraw.Draw(img)

    draw.rectangle((0, 0, width, header_h), fill="#102027")
    draw.ellipse((22, 19, 36, 33), fill="#ff5f56")
    draw.ellipse((46, 19, 60, 33), fill="#ffbd2e")
    draw.ellipse((70, 19, 84, 33), fill="#27c93f")
    draw.text((104, 16), title, fill="#d8f5e4", font=TITLE)

    y = header_h + 18
    for line in lines:
        color = "#d8f5e4"
        if line.startswith("==="):
            color = "#00ed64"
        elif "Active: active" in line or line.strip() in {"active", "enabled"} or "{ ok: 1 }" in line:
            color = "#7ef7a7"
        elif "failed" in line.lower() or "could not be found" in line.lower():
            color = "#ffd166"
        elif line.strip().startswith("#"):
            color = "#8db3a2"
        draw.text((pad, y), line, fill=color, font=MONO)
        y += line_h

    img.save(OUT / name)


pre = (EVIDENCE / "01-pre-install-check.txt").read_text(encoding="utf-8", errors="replace")
install = (EVIDENCE / "02-install-mongodb.txt").read_text(encoding="utf-8", errors="replace")
verify = (EVIDENCE / "03-verification.txt").read_text(encoding="utf-8", errors="replace")

render("01-pre-install-check.png", "01 - Pre-install host check", pre)
render("02-repository-setup.png", "02 - MongoDB repository setup", section(install, "=== STEP 3: add MongoDB public key ===", "=== STEP 5: apt update after MongoDB repo ==="))
render("03-package-install.png", "03 - MongoDB package installation", section(install, "=== STEP 6: install mongodb-org ===", "=== STEP 7: start and enable mongod ==="))
render("04-start-enable-summary.png", "04 - Start, enable, and version summary", section(install, "=== STEP 7: start and enable mongod ==="))
render("05-service-status.png", "05 - mongod service status", section(verify, "=== SERVICE STATUS ===", "=== ENABLED / ACTIVE ==="))
render("06-port-and-config.png", "06 - Port listener and mongod.conf", section(verify, "=== PORT LISTENER ===", "=== DATA DIRECTORY ==="), max_lines=48)
render("07-data-and-log-files.png", "07 - Data and log files", section(verify, "=== DATA DIRECTORY ===", "=== RECENT LOGS ==="), max_lines=48)
render("08-recent-logs.png", "08 - Recent MongoDB logs", section(verify, "=== RECENT LOGS ===", "=== MONGOSH PING AND CRUD TEST ==="), max_lines=34)
render("09-mongosh-crud.png", "09 - mongosh ping and CRUD test", section(verify, "=== MONGOSH PING AND CRUD TEST ===", "=== DATABASE LIST ==="), max_lines=32)
render("10-database-list.png", "10 - Database list", section(verify, "=== DATABASE LIST ==="), max_lines=28)
