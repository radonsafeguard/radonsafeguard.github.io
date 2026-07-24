"""Regenerate business-card-front (and preview)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent
W, H = 1050, 600
DPI = 300

NAVY = (12, 35, 64)
TEAL = (13, 148, 136)
WHITE = (255, 255, 255)
GRAY = (100, 116, 139)
LIGHT_LINE = (226, 232, 240)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = (
        [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf"]
        if bold
        else [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"]
    )
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_logo(img: Image.Image, x: int, y: int, size: int) -> None:
    mark = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = mark.load()
    radius = max(4, size // 5)
    for j in range(size):
        for i in range(size):
            cx, cy = i + 0.5, j + 0.5
            inside = True
            if cx < radius and cy < radius:
                inside = (cx - radius) ** 2 + (cy - radius) ** 2 <= radius**2
            elif cx >= size - radius and cy < radius:
                inside = (cx - (size - radius)) ** 2 + (cy - radius) ** 2 <= radius**2
            elif cx < radius and cy >= size - radius:
                inside = (cx - radius) ** 2 + (cy - (size - radius)) ** 2 <= radius**2
            elif cx >= size - radius and cy >= size - radius:
                inside = (
                    (cx - (size - radius)) ** 2 + (cy - (size - radius)) ** 2
                    <= radius**2
                )
            if not inside:
                continue
            t = (i + j) / (2 * (size - 1))
            r = int(TEAL[0] + (NAVY[0] - TEAL[0]) * t)
            g = int(TEAL[1] + (NAVY[1] - TEAL[1]) * t)
            b = int(TEAL[2] + (NAVY[2] - TEAL[2]) * t)
            px[i, j] = (r, g, b, 255)

    d = ImageDraw.Draw(mark)
    pad = size * 0.14
    scale = (size - 2 * pad) / 24

    def m(u, v):
        return (pad + u * scale, pad + v * scale)

    shield = [
        m(12, 2), m(4, 5.5), m(4, 11.7), m(5, 15.5), m(7, 18.5), m(9.5, 20.5),
        m(12, 21.5), m(14.5, 20.5), m(17, 18.5), m(19, 15.5), m(20, 11.7), m(20, 5.5),
    ]
    house = [
        m(12, 8.5), m(8.5, 11.2), m(8.5, 15.5), m(10.5, 15.5), m(10.5, 12.7),
        m(13.5, 12.7), m(13.5, 15.5), m(15.5, 15.5), m(15.5, 11.2),
    ]
    d.polygon(shield, fill=WHITE + (255,))
    d.polygon(house, fill=TEAL + (255,))
    img.paste(mark, (x, y), mark)


def main() -> None:
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    # Teal side bars + navy top/bottom
    bar = 18
    draw.rectangle([0, 0, bar - 1, H - 1], fill=TEAL)
    draw.rectangle([W - bar, 0, W - 1, H - 1], fill=TEAL)
    draw.rectangle([bar, 0, W - bar - 1, 14], fill=NAVY)
    draw.rectangle([bar, H - 14, W - bar - 1, H - 1], fill=NAVY)

    # Logo + brand
    logo_size = 72
    logo_x, logo_y = 48, 40
    draw_logo(img, logo_x, logo_y, logo_size)
    draw = ImageDraw.Draw(img)

    f_brand = font(42, bold=True)
    f_sub = font(18, bold=False)
    f_h2 = font(28, bold=True)
    f_services = font(18, bold=False)
    f_contact = font(20, bold=False)
    f_panel = font(22, bold=True)
    f_panel_mid = font(22, bold=True)
    f_panel_small = font(16, bold=False)

    tx = logo_x + logo_size + 16
    ty = logo_y + 8
    draw.text((tx, ty), "Radon", font=f_brand, fill=NAVY)
    rw = draw.textlength("Radon", font=f_brand)
    draw.text((tx + rw, ty), "Safeguard", font=f_brand, fill=TEAL)
    draw.text((tx, ty + 48), "Edmonton, Alberta", font=f_sub, fill=GRAY)

    # Divider under header
    draw.line([(48, 140), (W - 48, 140)], fill=LIGHT_LINE, width=2)

    # Left content
    y = 175
    draw.text((48, y), "Professional Radon Services", font=f_h2, fill=NAVY)
    y += 42
    draw.text((48, y), "Testing  ·  Mitigation  ·  Maintenance", font=f_services, fill=TEAL)
    y += 70
    draw.text((48, y), "(780) 851-5661", font=f_contact, fill=NAVY)
    y += 32
    draw.text((48, y), "info@radonsafeguard.com", font=f_contact, fill=NAVY)
    y += 32
    draw.text((48, y), "radonsafeguard.com", font=f_contact, fill=TEAL)

    # Right navy panel
    panel = [680, 170, 1000, 520]
    draw.rounded_rectangle(panel, radius=28, fill=NAVY)
    px0, py0 = 710, 220
    draw.text((px0, py0), "Breathe easier.", font=f_panel, fill=WHITE)
    draw.text((px0, py0 + 44), "Protecting you", font=f_panel_mid, fill=WHITE)
    draw.text((px0, py0 + 74), "from radon.", font=f_panel_mid, fill=TEAL)
    draw.text((px0, py0 + 130), "Certified. Local.", font=f_panel_small, fill=(148, 163, 184))
    draw.text((px0, py0 + 154), "Dependable.", font=f_panel_small, fill=(148, 163, 184))

    front_path = OUT / "business-card-front.png"
    img.save(front_path, "PNG", dpi=(DPI, DPI), optimize=True)
    print(f"updated {front_path.name}")

    # Preview: front + back stacked
    back = Image.open(OUT / "business-card-back.png").convert("RGB")
    gap = 40
    pad = 40
    prev_w = W + pad * 2
    prev_h = H * 2 + gap + pad * 2
    prev = Image.new("RGB", (prev_w, prev_h), (241, 245, 249))
    prev.paste(img, (pad, pad))
    prev.paste(back, (pad, pad + H + gap))
    prev_path = OUT / "business-card-preview.png"
    prev.save(prev_path, "PNG", dpi=(DPI, DPI), optimize=True)
    print(f"updated {prev_path.name}")


if __name__ == "__main__":
    main()
