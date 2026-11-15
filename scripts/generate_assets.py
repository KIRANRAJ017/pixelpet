import os
import math
from PIL import Image, ImageDraw

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))

# 32x32 logical canvas per frame
FRAME_W = 32
FRAME_H = 32
NUM_FRAMES = 4

PALETTES = {
    "mint": {
        "outline": (26, 46, 35, 255),
        "primary": (74, 222, 128, 255),
        "highlight": (134, 239, 172, 255),
        "shadow": (22, 163, 74, 255),
        "accent": (244, 114, 182, 255), # blush
        "eye": (20, 30, 25, 255),
        "extra": (34, 197, 94, 255),
        "leaf": (22, 101, 52, 255)
    },
    "lavender": {
        "outline": (35, 25, 55, 255),
        "primary": (192, 132, 252, 255),
        "highlight": (233, 213, 255, 255),
        "shadow": (147, 51, 234, 255),
        "accent": (244, 114, 182, 255),
        "eye": (30, 20, 45, 255),
        "extra": (168, 85, 247, 255),
        "leaf": (107, 33, 168, 255)
    },
    "peach": {
        "outline": (50, 30, 20, 255),
        "primary": (253, 186, 116, 255),
        "highlight": (255, 237, 213, 255),
        "shadow": (249, 115, 22, 255),
        "accent": (251, 113, 133, 255),
        "eye": (40, 25, 20, 255),
        "extra": (251, 146, 60, 255),
        "leaf": (154, 52, 18, 255)
    }
}

STATES = [
    "idle", "blink", "curious", "happy", "walk",
    "eat", "sleep", "wake", "surprised", "dragged", "land"
]

def create_transparent_image(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))

def draw_pixel_rect(draw, x1, y1, x2, y2, fill, outline=None):
    # inclusive pixel coords
    draw.rectangle([x1, y1, x2, y2], fill=fill, outline=outline)

# ----------------- MOCHI DRAWING -----------------
def draw_mochi_frame(draw, state, frame_idx, p):
    # Base Mochi: round cute blob with top sprout and stubby feet
    # Frame-specific offsets
    y_off = 0
    squash_x = 0
    squash_y = 0
    blink = False
    happy_eyes = False
    surprised_eyes = False
    sleeping = False
    mouth_open = False
    tilt = 0
    feet_anim = 0

    if state == "idle":
        # 0, 1, 2, 3 subtle breath
        y_off = [0, -1, -1, 0][frame_idx]
    elif state == "blink":
        y_off = 0
        blink = (frame_idx in [1, 2])
    elif state == "curious":
        y_off = -1 if frame_idx in [1, 2] else 0
        tilt = [-1, 0, 1, 0][frame_idx]
    elif state == "happy":
        y_off = [-1, -3, -2, 0][frame_idx]
        squash_y = [0, 1, 0, -1][frame_idx]
        happy_eyes = True
        mouth_open = (frame_idx in [1, 2])
    elif state == "walk":
        feet_anim = [-1, 0, 1, 0][frame_idx]
        tilt = [-1, 0, 1, 0][frame_idx]
        y_off = [-1, 0, -1, 0][frame_idx]
    elif state == "eat":
        y_off = [0, -1, 0, 0][frame_idx]
        mouth_open = (frame_idx in [0, 2])
        squash_x = 1 if frame_idx in [1, 2] else 0
    elif state == "sleep":
        y_off = 1
        squash_y = -1
        sleeping = True
    elif state == "wake":
        y_off = [1, -2, -1, 0][frame_idx]
        squash_y = [-1, 2, 0, 0][frame_idx]
        blink = (frame_idx == 0)
        mouth_open = (frame_idx == 1)
    elif state == "surprised":
        y_off = [-1, -4, -3, 0][frame_idx]
        surprised_eyes = True
        mouth_open = True
    elif state == "dragged":
        y_off = -3
        squash_y = 2
        tilt = [-1, 0, 1, 0][frame_idx]
    elif state == "land":
        if frame_idx == 0:
            squash_x = 3
            squash_y = -3
            y_off = 2
        elif frame_idx == 1:
            squash_x = -1
            squash_y = 2
            y_off = -2
        elif frame_idx == 2:
            squash_x = 1
            squash_y = -1
            y_off = 0
        else:
            y_off = 0

    # Body coordinates (centered horizontally in 32x32)
    bx = 6 - squash_x // 2 + tilt
    by = 10 + y_off - squash_y
    bw = 20 + squash_x
    bh = 16 + squash_y

    outl = p["outline"]
    prim = p["primary"]
    high = p["highlight"]
    shad = p["shadow"]
    eye_col = p["eye"]
    blush = p["accent"]

    # Sprout / Antenna on head
    sprout_x = 15 + tilt
    sprout_y = by - 5
    draw.rectangle([sprout_x, sprout_y + 1, sprout_x + 1, by], fill=p["leaf"])
    draw.rectangle([sprout_x - 2, sprout_y, sprout_x, sprout_y + 1], fill=high)
    draw.point((sprout_x - 1, sprout_y), fill=outl)

    # Main body background
    draw.rectangle([bx + 3, by, bx + bw - 4, by + bh], fill=prim)
    draw.rectangle([bx + 1, by + 2, bx + bw - 2, by + bh - 2], fill=prim)
    draw.rectangle([bx, by + 4, bx + bw - 1, by + bh - 4], fill=prim)

    # Highlights (top-left gloss)
    draw.rectangle([bx + 4, by + 2, bx + 9, by + 4], fill=high)
    draw.rectangle([bx + 2, by + 4, bx + 5, by + 7], fill=high)

    # Shadows (bottom rim)
    draw.rectangle([bx + 3, by + bh - 1, bx + bw - 4, by + bh], fill=shad)
    draw.rectangle([bx + bw - 3, by + 6, bx + bw - 1, by + bh - 2], fill=shad)

    # Outlines
    draw.line([bx + 4, by - 1, bx + bw - 5, by - 1], fill=outl)
    draw.line([bx + 4, by + bh + 1, bx + bw - 5, by + bh + 1], fill=outl)
    draw.line([bx - 1, by + 4, bx - 1, by + bh - 4], fill=outl)
    draw.line([bx + bw, by + 4, bx + bw, by + bh - 4], fill=outl)
    # rounded corners
    draw.point((bx + 2, by), fill=outl)
    draw.point((bx + 1, by + 1), fill=outl)
    draw.point((bx + bw - 3, by), fill=outl)
    draw.point((bx + bw - 2, by + 1), fill=outl)
    draw.point((bx + 1, by + bh - 1), fill=outl)
    draw.point((bx + 2, by + bh), fill=outl)
    draw.point((bx + bw - 2, by + bh - 1), fill=outl)
    draw.point((bx + bw - 3, by + bh), fill=outl)

    # Feet
    foot_y = by + bh
    left_foot_y = foot_y + (1 if feet_anim == -1 else 0)
    right_foot_y = foot_y + (1 if feet_anim == 1 else 0)
    if state == "dragged":
        left_foot_y += 2
        right_foot_y += 2

    # Left foot
    draw.rectangle([bx + 4, left_foot_y, bx + 6, left_foot_y + 2], fill=outl)
    # Right foot
    draw.rectangle([bx + bw - 7, right_foot_y, bx + bw - 5, right_foot_y + 2], fill=outl)

    # Face details
    eye_y = by + 9
    eye_lx = bx + 4
    eye_rx = bx + bw - 6

    if state == "curious":
        if frame_idx == 0:
            eye_lx -= 1; eye_rx -= 1
        elif frame_idx == 2:
            eye_lx += 1; eye_rx += 1

    if sleeping:
        # sleep eyes `_ _`
        draw.line([eye_lx, eye_y + 1, eye_lx + 2, eye_y + 1], fill=eye_col)
        draw.line([eye_rx, eye_y + 1, eye_rx + 2, eye_y + 1], fill=eye_col)
        # 'z Z' particles
        z_y = by - 3 - (frame_idx * 2)
        z_x = bx + bw + (frame_idx * 1)
        draw.text((z_x, z_y), "z" if frame_idx < 2 else "Z", fill=high)
    elif blink:
        draw.line([eye_lx, eye_y + 1, eye_lx + 2, eye_y + 1], fill=eye_col)
        draw.line([eye_rx, eye_y + 1, eye_rx + 2, eye_y + 1], fill=eye_col)
    elif happy_eyes:
        # `^ ^`
        draw.point((eye_lx + 1, eye_y - 1), fill=eye_col)
        draw.point((eye_lx, eye_y), fill=eye_col)
        draw.point((eye_lx + 2, eye_y), fill=eye_col)

        draw.point((eye_rx + 1, eye_y - 1), fill=eye_col)
        draw.point((eye_rx, eye_y), fill=eye_col)
        draw.point((eye_rx + 2, eye_y), fill=eye_col)
    elif surprised_eyes:
        # large round eyes
        draw.rectangle([eye_lx - 1, eye_y - 1, eye_lx + 2, eye_y + 2], fill=eye_col)
        draw.point((eye_lx, eye_y), fill=(255, 255, 255, 255)) # pupil sparkle
        draw.rectangle([eye_rx - 1, eye_y - 1, eye_rx + 2, eye_y + 2], fill=eye_col)
        draw.point((eye_rx, eye_y), fill=(255, 255, 255, 255))
        # sweat mark
        draw.point((bx + bw + 1, by + 1), fill=(147, 197, 253, 255))
        draw.point((bx + bw + 1, by + 2), fill=(59, 130, 246, 255))
    else:
        # Standard cute eyes (2x2 pixel blocks)
        draw.rectangle([eye_lx, eye_y, eye_lx + 1, eye_y + 2], fill=eye_col)
        draw.rectangle([eye_rx, eye_y, eye_rx + 1, eye_y + 2], fill=eye_col)

    # Cheeks (pink blush)
    draw.rectangle([bx + 3, eye_y + 3, bx + 5, eye_y + 4], fill=blush)
    draw.rectangle([bx + bw - 6, eye_y + 3, bx + bw - 4, eye_y + 4], fill=blush)

    # Mouth
    mouth_x = bx + bw // 2
    if mouth_open:
        draw.rectangle([mouth_x - 1, eye_y + 3, mouth_x + 1, eye_y + 4], fill=outl)
        draw.point((mouth_x, eye_y + 4), fill=(251, 113, 133, 255))
    elif not sleeping:
        draw.point((mouth_x, eye_y + 2), fill=outl)

    # Food item in eat state
    if state == "eat":
        fx = mouth_x - 3
        fy = eye_y + 3
        if frame_idx == 0:
            # Full strawberry/apple
            draw.rectangle([fx - 4, fy - 1, fx - 1, fy + 2], fill=(239, 68, 68, 255))
            draw.point((fx - 3, fy - 2), fill=(34, 197, 94, 255)) # leaf
        elif frame_idx == 1:
            # Half-eaten crumb
            draw.rectangle([fx - 3, fy, fx - 1, fy + 2], fill=(239, 68, 68, 255))
            draw.point((fx + 5, fy + 1), fill=(251, 191, 36, 255)) # crumb
        elif frame_idx == 2:
            # Crumb
            draw.point((mouth_x - 2, eye_y + 5), fill=(251, 191, 36, 255))
            draw.point((mouth_x + 2, eye_y + 5), fill=(251, 191, 36, 255))


# ----------------- NEKO (CAT) DRAWING -----------------
def draw_neko_frame(draw, state, frame_idx, p):
    y_off = 0
    squash_x = 0
    squash_y = 0
    blink = False
    happy_eyes = False
    surprised_eyes = False
    sleeping = False
    mouth_open = False
    tilt = 0
    tail_anim = 0

    if state == "idle":
        y_off = [0, -1, -1, 0][frame_idx]
        tail_anim = [0, 1, 2, 1][frame_idx]
    elif state == "blink":
        blink = (frame_idx in [1, 2])
    elif state == "curious":
        tilt = [-1, 0, 1, 0][frame_idx]
        tail_anim = 2
    elif state == "happy":
        y_off = [-1, -3, -2, 0][frame_idx]
        happy_eyes = True
        mouth_open = True
        tail_anim = 2
    elif state == "walk":
        tilt = [-1, 0, 1, 0][frame_idx]
        y_off = [-1, 0, -1, 0][frame_idx]
        tail_anim = [0, 2, 0, 2][frame_idx]
    elif state == "eat":
        mouth_open = (frame_idx in [0, 2])
        squash_x = 1 if frame_idx in [1, 2] else 0
    elif state == "sleep":
        y_off = 2
        sleeping = True
    elif state == "wake":
        y_off = [2, -2, -1, 0][frame_idx]
        squash_y = [-1, 2, 0, 0][frame_idx]
        blink = (frame_idx == 0)
    elif state == "surprised":
        y_off = [-1, -4, -3, 0][frame_idx]
        surprised_eyes = True
        tail_anim = 3
    elif state == "dragged":
        y_off = -3
        squash_y = 2
        tilt = [-1, 0, 1, 0][frame_idx]
    elif state == "land":
        if frame_idx == 0:
            squash_x = 3
            squash_y = -3
            y_off = 2
        elif frame_idx == 1:
            squash_x = -1
            squash_y = 2
            y_off = -2
        else:
            y_off = 0

    bx = 7 - squash_x // 2 + tilt
    by = 9 + y_off - squash_y
    bw = 18 + squash_x
    bh = 18 + squash_y

    outl = p["outline"]
    prim = p["primary"]
    high = p["highlight"]
    shad = p["shadow"]
    eye_col = p["eye"]
    blush = p["accent"]

    # Tail (behind body)
    tx = bx + bw - 1
    ty = by + bh - 5
    tail_w = 4
    if tail_anim == 0:
        draw.line([tx, ty, tx + 4, ty - 3], fill=outl, width=1)
        draw.point((tx + 4, ty - 4), fill=prim)
    elif tail_anim == 1:
        draw.line([tx, ty, tx + 5, ty - 5], fill=outl, width=1)
        draw.point((tx + 5, ty - 6), fill=prim)
    elif tail_anim == 2:
        draw.line([tx, ty, tx + 4, ty - 7], fill=outl, width=1)
        draw.point((tx + 3, ty - 8), fill=prim)
    else: # poofed / surprised
        draw.rectangle([tx, ty - 8, tx + 3, ty], fill=shad)

    # Ears
    ear_ly = by - 4
    ear_ry = by - 4
    # Left Ear
    draw.polygon([(bx + 1, by + 3), (bx + 3, ear_ly), (bx + 6, by + 1)], fill=prim, outline=outl)
    draw.polygon([(bx + 2, by + 2), (bx + 3, ear_ly + 1), (bx + 5, by + 1)], fill=blush)
    # Right Ear
    draw.polygon([(bx + bw - 2, by + 3), (bx + bw - 4, ear_ly), (bx + bw - 7, by + 1)], fill=prim, outline=outl)
    draw.polygon([(bx + bw - 3, by + 2), (bx + bw - 4, ear_ly + 1), (bx + bw - 6, by + 1)], fill=blush)

    # Body
    draw.rectangle([bx + 2, by, bx + bw - 3, by + bh], fill=prim)
    draw.rectangle([bx + 1, by + 3, bx + bw - 2, by + bh - 2], fill=prim)
    draw.rectangle([bx, by + 6, bx + bw - 1, by + bh - 4], fill=prim)

    # Highlights
    draw.rectangle([bx + 3, by + 2, bx + 7, by + 4], fill=high)
    # Shadows
    draw.rectangle([bx + 2, by + bh - 1, bx + bw - 3, by + bh], fill=shad)

    # Outlines
    draw.line([bx + 6, by - 1, bx + bw - 7, by - 1], fill=outl)
    draw.line([bx + 2, by + bh + 1, bx + bw - 3, by + bh + 1], fill=outl)
    draw.line([bx - 1, by + 6, bx - 1, by + bh - 3], fill=outl)
    draw.line([bx + bw, by + 6, bx + bw, by + bh - 3], fill=outl)
    # Corners
    draw.point((bx, by + 4), fill=outl)
    draw.point((bx, by + 5), fill=outl)
    draw.point((bx + bw - 1, by + 4), fill=outl)
    draw.point((bx + bw - 1, by + 5), fill=outl)

    # Little front paws
    paw_y = by + bh - 1
    draw.rectangle([bx + 4, paw_y, bx + 6, paw_y + 1], fill=high, outline=outl)
    draw.rectangle([bx + bw - 7, paw_y, bx + bw - 5, paw_y + 1], fill=high, outline=outl)

    # Eyes
    eye_y = by + 8
    eye_lx = bx + 4
    eye_rx = bx + bw - 6

    if sleeping:
        draw.line([eye_lx, eye_y + 1, eye_lx + 2, eye_y + 1], fill=eye_col)
        draw.line([eye_rx, eye_y + 1, eye_rx + 2, eye_y + 1], fill=eye_col)
        # Z
        z_y = by - 3 - (frame_idx * 2)
        draw.text((bx + bw + 1, z_y), "z" if frame_idx < 2 else "Z", fill=high)
    elif blink:
        draw.line([eye_lx, eye_y + 1, eye_lx + 2, eye_y + 1], fill=eye_col)
        draw.line([eye_rx, eye_y + 1, eye_rx + 2, eye_y + 1], fill=eye_col)
    elif happy_eyes:
        draw.point((eye_lx + 1, eye_y - 1), fill=eye_col)
        draw.point((eye_lx, eye_y), fill=eye_col)
        draw.point((eye_lx + 2, eye_y), fill=eye_col)
        draw.point((eye_rx + 1, eye_y - 1), fill=eye_col)
        draw.point((eye_rx, eye_y), fill=eye_col)
        draw.point((eye_rx + 2, eye_y), fill=eye_col)
    elif surprised_eyes:
        draw.rectangle([eye_lx - 1, eye_y - 1, eye_lx + 2, eye_y + 2], fill=eye_col)
        draw.point((eye_lx, eye_y), fill=(255, 255, 255, 255))
        draw.rectangle([eye_rx - 1, eye_y - 1, eye_rx + 2, eye_y + 2], fill=eye_col)
        draw.point((eye_rx, eye_y), fill=(255, 255, 255, 255))
    else:
        draw.rectangle([eye_lx, eye_y, eye_lx + 1, eye_y + 2], fill=eye_col)
        draw.rectangle([eye_rx, eye_y, eye_rx + 1, eye_y + 2], fill=eye_col)

    # Cheeks
    draw.rectangle([bx + 2, eye_y + 3, bx + 4, eye_y + 4], fill=blush)
    draw.rectangle([bx + bw - 5, eye_y + 3, bx + bw - 3, eye_y + 4], fill=blush)

    # Cat mouth (cute :3 shape)
    mx = bx + bw // 2
    my = eye_y + 3
    if mouth_open:
        draw.rectangle([mx - 1, my, mx + 1, my + 1], fill=outl)
        draw.point((mx, my + 1), fill=blush)
    elif not sleeping:
        draw.point((mx - 1, my), fill=outl)
        draw.point((mx, my + 1), fill=outl)
        draw.point((mx + 1, my), fill=outl)

    # Whiskers
    draw.point((bx + 1, eye_y + 3), fill=outl)
    draw.point((bx + bw - 2, eye_y + 3), fill=outl)

    if state == "eat":
        fx = mx - 3
        fy = my + 2
        if frame_idx == 0:
            draw.rectangle([fx - 4, fy - 1, fx - 1, fy + 2], fill=(244, 63, 94, 255))
            draw.point((fx - 3, fy - 2), fill=(34, 197, 94, 255))
        elif frame_idx in [1, 2]:
            draw.point((fx + 5, fy + 1), fill=(251, 191, 36, 255))


# ----------------- BOO (GHOST) DRAWING -----------------
def draw_boo_frame(draw, state, frame_idx, p):
    y_off = 0
    squash_x = 0
    squash_y = 0
    blink = False
    happy_eyes = False
    surprised_eyes = False
    sleeping = False
    mouth_open = False
    tilt = 0
    skirt_anim = frame_idx

    # Floating ghost floats naturally
    float_y = int(math.sin(frame_idx * math.pi / 2.0) * 2.0)

    if state == "idle":
        y_off = float_y
    elif state == "blink":
        y_off = float_y
        blink = (frame_idx in [1, 2])
    elif state == "curious":
        y_off = float_y - 1
        tilt = [-1, 0, 1, 0][frame_idx]
    elif state == "happy":
        y_off = float_y - 3
        happy_eyes = True
        mouth_open = True
    elif state == "walk":
        y_off = float_y
        tilt = [-1, 0, 1, 0][frame_idx]
    elif state == "eat":
        y_off = float_y
        mouth_open = (frame_idx in [0, 2])
        squash_x = 1 if frame_idx in [1, 2] else 0
    elif state == "sleep":
        y_off = 3
        sleeping = True
    elif state == "wake":
        y_off = [2, -2, -1, 0][frame_idx]
        squash_y = [-1, 2, 0, 0][frame_idx]
        blink = (frame_idx == 0)
    elif state == "surprised":
        y_off = float_y - 4
        surprised_eyes = True
        mouth_open = True
    elif state == "dragged":
        y_off = -3
        squash_y = 2
        tilt = [-1, 0, 1, 0][frame_idx]
    elif state == "land":
        if frame_idx == 0:
            squash_x = 3
            squash_y = -3
            y_off = 2
        elif frame_idx == 1:
            squash_x = -1
            squash_y = 2
            y_off = -2
        else:
            y_off = 0

    bx = 7 - squash_x // 2 + tilt
    by = 7 + y_off - squash_y
    bw = 18 + squash_x
    bh = 19 + squash_y

    outl = p["outline"]
    prim = p["primary"]
    high = p["highlight"]
    shad = p["shadow"]
    eye_col = p["eye"]
    blush = p["accent"]

    # Sparkle / aura around ghost
    if state in ["idle", "happy"]:
        sparkle_pos = [(bx - 3, by + 4), (bx + bw + 2, by + 2), (bx - 2, by + bh - 4), (bx + bw + 1, by + bh - 2)]
        sp = sparkle_pos[frame_idx]
        draw.point(sp, fill=high)
        draw.point((sp[0] + 1, sp[1]), fill=prim)

    # Dome head
    draw.rectangle([bx + 4, by, bx + bw - 5, by + bh - 4], fill=prim)
    draw.rectangle([bx + 2, by + 2, bx + bw - 3, by + bh - 2], fill=prim)
    draw.rectangle([bx + 1, by + 4, bx + bw - 2, by + bh - 1], fill=prim)

    # Outlines of dome
    draw.line([bx + 4, by - 1, bx + bw - 5, by - 1], fill=outl)
    draw.line([bx, by + 5, bx, by + bh - 2], fill=outl)
    draw.line([bx + bw - 1, by + 5, bx + bw - 1, by + bh - 2], fill=outl)
    # dome corners
    draw.point((bx + 2, by + 1), fill=outl)
    draw.point((bx + 1, by + 2), fill=outl)
    draw.point((bx + 1, by + 3), fill=outl)
    draw.point((bx + bw - 3, by + 1), fill=outl)
    draw.point((bx + bw - 2, by + 2), fill=outl)
    draw.point((bx + bw - 2, by + 3), fill=outl)

    # Skirt / bottom ruffles (3 cute wavy folds)
    bottom_y = by + bh
    fold_w = bw // 3
    for i in range(3):
        fx1 = bx + i * fold_w
        fx2 = bx + (i + 1) * fold_w - 1 if i < 2 else bx + bw - 1
        wave = int(math.sin((frame_idx + i) * 1.5) * 1.5)
        draw.rectangle([fx1 + 1, bottom_y - 2, fx2 - 1, bottom_y + wave], fill=prim)
        draw.line([fx1 + 1, bottom_y + wave + 1, fx2 - 1, bottom_y + wave + 1], fill=outl)
        draw.point((fx1, bottom_y + wave), fill=outl)
        draw.point((fx2, bottom_y + wave), fill=outl)

    # Little stubby floating arms
    arm_y = by + 10
    draw.rectangle([bx - 1, arm_y, bx + 1, arm_y + 2], fill=prim, outline=outl)
    draw.rectangle([bx + bw - 2, arm_y, bx + bw, arm_y + 2], fill=prim, outline=outl)

    # Highlight (top-left)
    draw.rectangle([bx + 4, by + 2, bx + 8, by + 4], fill=high)
    draw.rectangle([bx + 2, by + 4, bx + 4, by + 7], fill=high)
    # Shadow (right rim)
    draw.rectangle([bx + bw - 3, by + 7, bx + bw - 2, by + bh - 3], fill=shad)

    # Eyes
    eye_y = by + 8
    eye_lx = bx + 4
    eye_rx = bx + bw - 6

    if sleeping:
        draw.line([eye_lx, eye_y + 1, eye_lx + 2, eye_y + 1], fill=eye_col)
        draw.line([eye_rx, eye_y + 1, eye_rx + 2, eye_y + 1], fill=eye_col)
        z_y = by - 3 - (frame_idx * 2)
        draw.text((bx + bw + 1, z_y), "z" if frame_idx < 2 else "Z", fill=high)
    elif blink:
        draw.line([eye_lx, eye_y + 1, eye_lx + 2, eye_y + 1], fill=eye_col)
        draw.line([eye_rx, eye_y + 1, eye_rx + 2, eye_y + 1], fill=eye_col)
    elif happy_eyes:
        draw.point((eye_lx + 1, eye_y - 1), fill=eye_col)
        draw.point((eye_lx, eye_y), fill=eye_col)
        draw.point((eye_lx + 2, eye_y), fill=eye_col)
        draw.point((eye_rx + 1, eye_y - 1), fill=eye_col)
        draw.point((eye_rx, eye_y), fill=eye_col)
        draw.point((eye_rx + 2, eye_y), fill=eye_col)
    elif surprised_eyes:
        draw.rectangle([eye_lx - 1, eye_y - 1, eye_lx + 2, eye_y + 2], fill=eye_col)
        draw.point((eye_lx, eye_y), fill=(255, 255, 255, 255))
        draw.rectangle([eye_rx - 1, eye_y - 1, eye_rx + 2, eye_y + 2], fill=eye_col)
        draw.point((eye_rx, eye_y), fill=(255, 255, 255, 255))
    else:
        # Boo reference eyes: round dark eyes
        draw.rectangle([eye_lx, eye_y, eye_lx + 2, eye_y + 2], fill=eye_col)
        draw.rectangle([eye_rx - 1, eye_y, eye_rx + 1, eye_y + 2], fill=eye_col)

    # Cheeks
    draw.rectangle([bx + 2, eye_y + 3, bx + 4, eye_y + 4], fill=blush)
    draw.rectangle([bx + bw - 5, eye_y + 3, bx + bw - 3, eye_y + 4], fill=blush)

    # Cute curved smile
    mx = bx + bw // 2
    my = eye_y + 3
    if mouth_open:
        draw.rectangle([mx - 1, my, mx + 1, my + 1], fill=outl)
        draw.point((mx, my + 1), fill=blush)
    elif not sleeping:
        draw.line([mx - 1, my, mx + 1, my], fill=outl)
        draw.point((mx, my + 1), fill=outl)

    if state == "eat":
        fx = mx - 3
        fy = my + 2
        if frame_idx == 0:
            draw.rectangle([fx - 4, fy - 1, fx - 1, fy + 2], fill=(236, 72, 153, 255))
            draw.point((fx - 3, fy - 2), fill=(255, 255, 255, 255))
        elif frame_idx in [1, 2]:
            draw.point((fx + 5, fy + 1), fill=(251, 191, 36, 255))


# ----------------- ACCESSORIES -----------------
def draw_beanie(draw, character, state, frame_idx):
    # Knit beanie cap tailored for character head shape
    y_off = 0
    if state == "idle":
        y_off = [0, -1, -1, 0][frame_idx]
    elif state in ["happy", "surprised"]:
        y_off = [-1, -3, -2, 0][frame_idx]
    elif state == "sleep":
        y_off = 1
    elif state == "dragged":
        y_off = -3

    cap_red = (220, 38, 38, 255)
    cap_white = (255, 255, 255, 255)
    cap_dark = (153, 27, 27, 255)
    outl = (30, 20, 20, 255)

    bx = 9
    # Place beanie properly on top of the head crown
    if character == "mochi":
        by = 3 + y_off
    elif character == "neko":
        by = 2 + y_off
    elif character == "boo":
        by = 2 + y_off
    else:
        by = 2 + y_off

    by = max(2, by)

    # Pom-pom on top
    draw.rectangle([bx + 6, by - 2, bx + 8, by], fill=cap_white, outline=outl)
    # Dome cap
    draw.rectangle([bx + 2, by + 1, bx + 12, by + 5], fill=cap_red)
    draw.line([bx + 2, by + 1, bx + 12, by + 1], fill=outl)
    draw.line([bx + 1, by + 2, bx + 1, by + 5], fill=outl)
    draw.line([bx + 13, by + 2, bx + 13, by + 5], fill=outl)
    # White knit folded brim sitting comfortably on top of head
    draw.rectangle([bx, by + 5, bx + 14, by + 7], fill=cap_white, outline=outl)
    # Knit ribs
    draw.point((bx + 3, by + 6), fill=(200, 200, 200, 255))
    draw.point((bx + 7, by + 6), fill=(200, 200, 200, 255))
    draw.point((bx + 11, by + 6), fill=(200, 200, 200, 255))


def draw_party_hat(draw, character, state, frame_idx):
    y_off = 0
    if state == "idle":
        y_off = [0, -1, -1, 0][frame_idx]
    elif state in ["happy", "surprised"]:
        y_off = [-1, -3, -2, 0][frame_idx]
    elif state == "sleep":
        y_off = 1
    elif state == "dragged":
        y_off = -3

    hat_yellow = (250, 204, 21, 255)
    hat_cyan = (6, 182, 212, 255)
    hat_pink = (244, 114, 182, 255)
    outl = (40, 30, 20, 255)

    bx = 12
    # Place cone hat resting directly on top of head crown
    if character == "mochi":
        by = 3 + y_off
    elif character == "neko":
        by = 2 + y_off
    elif character == "boo":
        by = 2 + y_off
    else:
        by = 2 + y_off

    by = max(2, by)

    # Pom-pom
    draw.rectangle([bx + 3, by - 2, bx + 5, by], fill=hat_pink)
    # Cone body
    draw.polygon([(bx + 4, by), (bx, by + 7), (bx + 8, by + 7)], fill=hat_yellow, outline=outl)
    # Stripes
    draw.line([bx + 2, by + 3, bx + 6, by + 3], fill=hat_cyan)
    draw.line([bx + 1, by + 5, bx + 7, by + 5], fill=hat_pink)


# ----------------- FOOD ITEMS -----------------
def generate_food_assets():
    food_dir = os.path.join(ASSETS_DIR, "food")
    os.makedirs(food_dir, exist_ok=True)

    # 1. Apple snack (32x32)
    img = create_transparent_image(32, 32)
    d = ImageDraw.Draw(img)
    # Red apple
    d.rectangle([10, 13, 21, 24], fill=(239, 68, 68, 255))
    d.rectangle([12, 11, 19, 25], fill=(239, 68, 68, 255))
    # Outline
    d.rectangle([9, 14, 22, 23], outline=(69, 10, 10, 255))
    d.line([12, 10, 19, 10], fill=(69, 10, 10, 255))
    d.line([12, 26, 19, 26], fill=(69, 10, 10, 255))
    # Highlight gloss
    d.rectangle([12, 13, 14, 16], fill=(254, 202, 202, 255))
    # Stem & Leaf
    d.line([15, 8, 15, 11], fill=(120, 53, 15, 255), width=1)
    d.polygon([(16, 7), (19, 6), (18, 9)], fill=(34, 197, 94, 255))
    img.save(os.path.join(food_dir, "apple.png"))

    # 2. Cake slice (32x32)
    img = create_transparent_image(32, 32)
    d = ImageDraw.Draw(img)
    # Cake triangle
    d.polygon([(8, 24), (24, 24), (20, 14), (12, 14)], fill=(254, 243, 199, 255), outline=(69, 26, 3, 255))
    # Strawberry on top
    d.polygon([(15, 11), (17, 11), (16, 14)], fill=(239, 68, 68, 255))
    # Cream layer
    d.line([10, 19, 22, 19], fill=(255, 255, 255, 255), width=2)
    img.save(os.path.join(food_dir, "cake.png"))


# ----------------- APP ICON -----------------
def generate_app_icon():
    ico_path = os.path.join(ASSETS_DIR, "app-icon.ico")
    sizes = [16, 32, 48, 64, 128, 256]
    images = []

    # Draw hi-res master icon of Mochi with cute face
    master = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    d = ImageDraw.Draw(master)
    # Circular mint badge
    d.ellipse([16, 16, 240, 240], fill=(74, 222, 128, 255), outline=(22, 101, 52, 255), width=8)
    # Highlight
    d.arc([24, 24, 232, 232], start=200, end=300, fill=(134, 239, 172, 255), width=12)
    # Sprout
    d.rectangle([122, 24, 134, 60], fill=(22, 101, 52, 255))
    d.ellipse([100, 20, 130, 44], fill=(134, 239, 172, 255), outline=(22, 101, 52, 255), width=4)
    # Big sparkling eyes
    d.ellipse([64, 110, 96, 150], fill=(20, 30, 25, 255))
    d.ellipse([72, 116, 84, 128], fill=(255, 255, 255, 255)) # sparkle
    d.ellipse([160, 110, 192, 150], fill=(20, 30, 25, 255))
    d.ellipse([168, 116, 180, 128], fill=(255, 255, 255, 255))
    # Cheeks
    d.ellipse([48, 145, 78, 165], fill=(244, 114, 182, 255))
    d.ellipse([178, 145, 208, 165], fill=(244, 114, 182, 255))
    # Smile
    d.arc([110, 140, 146, 170], start=0, end=180, fill=(20, 30, 25, 255), width=6)

    for s in sizes:
        img_s = master.resize((s, s), Image.Resampling.LANCZOS)
        images.append(img_s)

    master.save(ico_path, format="ICO", sizes=[(s, s) for s in sizes])
    # Also save png
    master.save(os.path.join(ASSETS_DIR, "app-icon.png"), format="PNG")

    # Generate crisp high-contrast 32x32 tray icon
    tray_img = create_transparent_image(32, 32)
    td = ImageDraw.Draw(tray_img)
    # Circle badge with dark border
    td.ellipse([2, 4, 29, 31], fill=(74, 222, 128, 255), outline=(15, 30, 20, 255), width=2)
    # Sprout
    td.rectangle([14, 0, 17, 5], fill=(22, 101, 52, 255))
    td.polygon([(15, 0), (19, 1), (17, 4)], fill=(134, 239, 172, 255))
    # Eyes
    td.rectangle([8, 14, 11, 18], fill=(15, 25, 20, 255))
    td.point((9, 15), fill=(255, 255, 255, 255)) # sparkle
    td.rectangle([20, 14, 23, 18], fill=(15, 25, 20, 255))
    td.point((21, 15), fill=(255, 255, 255, 255))
    # Cheeks
    td.rectangle([5, 19, 9, 21], fill=(244, 114, 182, 255))
    td.rectangle([22, 19, 26, 21], fill=(244, 114, 182, 255))
    # Smile
    td.line([13, 21, 18, 21], fill=(15, 25, 20, 255))
    td.point((15, 22), fill=(15, 25, 20, 255))
    td.point((16, 22), fill=(15, 25, 20, 255))

    tray_img.save(os.path.join(ASSETS_DIR, "tray-icon.png"), format="PNG")
    tray_img.save(os.path.join(ASSETS_DIR, "tray-icon.ico"), format="ICO", sizes=[(16, 16), (24, 24), (32, 32)])


# ----------------- MAIN ASSET GENERATOR -----------------
def generate_all():
    print("Generating assets...")
    os.makedirs(ASSETS_DIR, exist_ok=True)

    char_funcs = {
        "mochi": draw_mochi_frame,
        "neko": draw_neko_frame,
        "boo": draw_boo_frame
    }

    # 1. Characters: 3 characters x 3 palettes x 11 states
    for char_name, draw_fn in char_funcs.items():
        for pal_name, pal_data in PALETTES.items():
            out_dir = os.path.join(ASSETS_DIR, "pets", char_name, pal_name)
            os.makedirs(out_dir, exist_ok=True)

            for state in STATES:
                # Spritesheet of 4 horizontal frames (width: 4 * 32 = 128, height: 32)
                sheet = create_transparent_image(FRAME_W * NUM_FRAMES, FRAME_H)
                for f in range(NUM_FRAMES):
                    frame_img = create_transparent_image(FRAME_W, FRAME_H)
                    d = ImageDraw.Draw(frame_img)
                    draw_fn(d, state, f, pal_data)
                    sheet.paste(frame_img, (f * FRAME_W, 0), frame_img)

                sheet_path = os.path.join(out_dir, f"{state}.png")
                sheet.save(sheet_path)

    # 2. Accessories: Beanie, Party Hat
    for acc in ["beanie", "party_hat"]:
        acc_dir = os.path.join(ASSETS_DIR, "accessories", acc)
        os.makedirs(acc_dir, exist_ok=True)
        for char_name in ["mochi", "neko", "boo"]:
            for state in STATES:
                sheet = create_transparent_image(FRAME_W * NUM_FRAMES, FRAME_H)
                for f in range(NUM_FRAMES):
                    frame_img = create_transparent_image(FRAME_W, FRAME_H)
                    d = ImageDraw.Draw(frame_img)
                    if acc == "beanie":
                        draw_beanie(d, char_name, state, f)
                    elif acc == "party_hat":
                        draw_party_hat(d, char_name, state, f)
                    sheet.paste(frame_img, (f * FRAME_W, 0), frame_img)
                sheet.save(os.path.join(acc_dir, f"{char_name}_{state}.png"))

    # 3. Food assets
    generate_food_assets()

    # 4. App icon
    generate_app_icon()

    print("All assets generated successfully!")

if __name__ == "__main__":
    generate_all()
