import os
import json
import subprocess
from PIL import Image, ImageDraw, ImageFont

FFMPEG_BIN = r"C:\Users\HP\AppData\Local\Programs\Python\Python310\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v9.0.2.exe"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CAPTURES_DIR = os.path.join(BASE_DIR, "captures")
AUDIO_DIR = os.path.join(BASE_DIR, "audio")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
TEMP_DIR = os.path.join(OUTPUT_DIR, "temp")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Select latest raw capture
raw_candidates = [
    os.path.join(CAPTURES_DIR, f)
    for f in os.listdir(CAPTURES_DIR)
    if f.endswith(".webm") and not f.startswith("test")
]
raw_candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
RAW_VIDEO = raw_candidates[0] if raw_candidates else None
print(f"[Build] Selected raw capture: {RAW_VIDEO}")

# 8 Segments totaling ~25.8 seconds
TIMELINE = [
    {
        "id": "seg1_intro_mochi",
        "start": 3.6,
        "end": 7.5,
        "zoom": 1.0,
        "tag": "DESKTOP PET",
        "tag_color": "#FFC53D",
        "caption": "Meet Mochi, your new desktop companion!",
        "subcaption": "Click to pet and watch the cute heart particles float 💖",
        "sfx": [
            {"file": "pop.wav", "offset": 1.0},
            {"file": "pop.wav", "offset": 2.2}
        ]
    },
    {
        "id": "seg2_adopt_neko",
        "start": 7.5,
        "end": 11.2,
        "zoom": 1.0,
        "tag": "ROOMMATE SYSTEM",
        "tag_color": "#73D13D",
        "caption": "Need a cat roommate instead? Meet Neko! 🐱",
        "subcaption": "Switch companions anytime with distinct personalities",
        "sfx": [
            {"file": "meow.wav", "offset": 0.5}
        ]
    },
    {
        "id": "seg3_adopt_boo",
        "start": 11.2,
        "end": 15.0,
        "zoom": 1.0,
        "tag": "GHOST BUDDY",
        "tag_color": "#B37FEB",
        "caption": "Or a spooky floating ghost? Meet Boo! 👻",
        "subcaption": "Adoption cards let you collect the whole crew",
        "sfx": [
            {"file": "spooky.wav", "offset": 0.4}
        ]
    },
    {
        "id": "seg4_desktop_drag",
        "start": 19.5,
        "end": 21.8,
        "zoom": 1.0,
        "tag": "PHYSICS & DRAG",
        "tag_color": "#4096FF",
        "caption": "Drag your pet anywhere on your screen...",
        "subcaption": "They live alongside your apps while you work or game!",
        "sfx": [
            {"file": "pop.wav", "offset": 0.2}
        ]
    },
    {
        "id": "seg5_shake_confused",
        "start": 21.8,
        "end": 24.0,
        "zoom": 1.35, # Punch-in zoom
        "tag": "SHAKE REACTION",
        "tag_color": "#FAAD14",
        "caption": "WAIT... DON'T SHAKE THEM TOO HARD!! 💫",
        "subcaption": "Confused wobble + orbiting pixel stars trigger!",
        "sfx": [
            {"file": "dizzy.wav", "offset": 0.1}
        ]
    },
    {
        "id": "seg6_shake_angry",
        "start": 24.0,
        "end": 25.5,
        "zoom": 1.45, # Dramatic punch-in zoom
        "tag": "WARNING: ANGY",
        "tag_color": "#FF4D4F",
        "caption": "HE IS VERY ANGY. DO NOT DISTURB! 💢",
        "subcaption": "Three red exclamation marks pop up to the left!",
        "sfx": [
            {"file": "angry.wav", "offset": 0.05}
        ]
    },
    {
        "id": "seg7_feed_treat",
        "start": 25.5,
        "end": 28.5,
        "zoom": 1.15,
        "tag": "APOLOGY TIME",
        "tag_color": "#36CFC9",
        "caption": "A quick snack fixes everything! 🍩✨",
        "subcaption": "Feeding treats restores happiness immediately",
        "sfx": [
            {"file": "chomp.wav", "offset": 0.5},
            {"file": "happy.wav", "offset": 1.4}
        ]
    },
    {
        "id": "seg8_cozy_nap",
        "start": 28.5,
        "end": 31.8,
        "zoom": 1.0,
        "tag": "FREE DOWNLOAD",
        "tag_color": "#95DE64",
        "caption": "Now taking a well-deserved nap 💤",
        "subcaption": "Download Pixel Pet for free today! Link in bio 🌟",
        "sfx": [
            {"file": "happy.wav", "offset": 0.6}
        ]
    }
]

def create_overlay_png(seg, out_path):
    # Canvas size: 1080 x 1920 transparent PNG
    im = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    # Fonts
    font_header_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 38)
    font_header_sub = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 24)
    font_tag = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 26)
    font_caption = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 36)
    font_subcaption = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 28)
    font_footer = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 26)

    # Top Header Card (Y: 80 to 220)
    # Background pill
    hx0, hy0, hx1, hy1 = 60, 90, 1020, 230
    d.rounded_rectangle([hx0, hy0, hx1, hy1], radius=24, fill=(22, 23, 31, 235), outline=(78, 85, 112, 255), width=3)
    
    # Header badge icon & text
    d.text((100, 115), "👾  PIXEL PET COMPANION", font=font_header_title, fill=(255, 215, 0, 255))
    d.text((100, 172), "Your interactive retro desktop friend • Free download", font=font_header_sub, fill=(200, 205, 220, 240))

    # Center Framing border around the 1080x1080 video (Y: 420 to 1500)
    d.rectangle([0, 417, 1080, 420], fill=(255, 215, 0, 180)) # top gold highlight
    d.rectangle([0, 1500, 1080, 1503], fill=(255, 215, 0, 180)) # bottom gold highlight

    # Lower Third Caption Area (Y: 1530 to 1750)
    cx0, cy0, cx1, cy1 = 50, 1530, 1030, 1740
    d.rounded_rectangle([cx0, cy0, cx1, cy1], radius=24, fill=(18, 19, 25, 240), outline=(50, 55, 75, 255), width=3)

    # Tag badge
    tag_text = f"  ● {seg['tag']}  "
    bbox = d.textbbox((0, 0), tag_text, font=font_tag)
    tag_w = bbox[2] - bbox[0]
    tag_h = bbox[3] - bbox[1] + 12
    tx0 = cx0 + 35
    ty0 = cy0 + 22
    d.rounded_rectangle([tx0, ty0, tx0 + tag_w + 14, ty0 + tag_h], radius=10, fill=(35, 38, 52, 255), outline=seg["tag_color"], width=2)
    d.text((tx0 + 8, ty0 + 4), tag_text, font=font_tag, fill=seg["tag_color"])

    # Main caption (White / high-contrast bold)
    d.text((cx0 + 35, cy0 + 82), seg["caption"], font=font_caption, fill=(255, 255, 255, 255))
    
    # Subcaption
    d.text((cx0 + 35, cy0 + 140), seg["subcaption"], font=font_subcaption, fill=(180, 190, 210, 255))

    # Bottom Call-To-Action (Y: 1780 to 1840)
    fx0, fy0, fx1, fy1 = 120, 1775, 960, 1845
    d.rounded_rectangle([fx0, fy0, fx1, fy1], radius=20, fill=(40, 45, 65, 220), outline=(255, 215, 0, 200), width=2)
    d.text((150, 1793), "💖 Double-tap & follow for more Pixel Pet features!", font=font_footer, fill=(255, 240, 180, 255))

    im.save(out_path)
    return out_path

def render_segment(seg, idx):
    out_clip = os.path.join(TEMP_DIR, f"clip_{idx:02d}.mp4")
    overlay_png = os.path.join(TEMP_DIR, f"overlay_{idx:02d}.png")
    create_overlay_png(seg, overlay_png)

    duration = seg["end"] - seg["start"]
    zoom = seg.get("zoom", 1.0)

    # Video filter chain:
    # 1. Trim input [0:v] from seg['start'] for duration
    # 2. Main cropped/zoomed video:
    #    If zoom > 1.0, crop centered around (540, 540) and scale up to 1080x1080 with neighbor interpolation (sharp pixels!)
    # 3. Background video:
    #    Scale to fill 1080x1920, boxblur heavily, darken
    # 4. Composite:
    #    Background at (0, 0)
    #    Main gameplay video at (0, 420)
    #    Overlay PNG at (0, 0)

    if zoom > 1.0:
        crop_size = int(1080 / zoom)
        x_off = int((1080 - crop_size) / 2)
        y_off = int((1080 - crop_size) / 2)
        fg_filter = f"crop={crop_size}:{crop_size}:{x_off}:{y_off},scale=1080:1080:flags=neighbor"
    else:
        fg_filter = "scale=1080:1080:flags=neighbor"

    # Overlay path for FFmpeg on Windows (replace backslashes with forward slashes)
    overlay_path_escaped = overlay_png.replace("\\", "/")

    filter_complex = (
        f"[0:v]setpts=PTS-STARTPTS,fps=30[v_raw];"
        f"[v_raw]split=2[v_bg_in][v_fg_in];"
        f"[v_bg_in]scale=180:320:force_original_aspect_ratio=increase,crop=180:320,"
        f"boxblur=8:2,colorchannelmixer=aa=1.0:rr=0.35:gg=0.35:bb=0.45,scale=1080:1920:flags=bilinear[v_bg];"
        f"[v_fg_in]{fg_filter}[v_fg];"
        f"[v_bg][v_fg]overlay=0:420[v_comp];"
        f"[1:v]scale=1080:1920[v_over];"
        f"[v_comp][v_over]overlay=0:0[v_out]"
    )

    cmd = [
        FFMPEG_BIN, "-y",
        "-ss", str(seg["start"]),
        "-i", RAW_VIDEO,
        "-i", overlay_png,
        "-filter_complex", filter_complex,
        "-map", "[v_out]",
        "-t", str(duration),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        out_clip
    ]

    print(f"[Render] Rendering segment {idx+1}/{len(TIMELINE)} ({duration:.2f}s, zoom={zoom}x)...")
    subprocess.run(cmd, check=True)
    return out_clip

def concatenate_clips(clip_files, concat_out):
    list_file = os.path.join(TEMP_DIR, "concat_list.txt")
    with open(list_file, "w") as f:
        for clip in clip_files:
            f.write(f"file '{clip.replace(chr(92), '/')}'\n")

    cmd = [
        FFMPEG_BIN, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", list_file,
        "-c", "copy",
        concat_out
    ]
    print("[Render] Concatenating all visual segments...")
    subprocess.run(cmd, check=True)

def build_audio_track(total_duration, audio_out):
    # Assemble all sound effects at their exact cumulative timestamps
    # and mix with background music ducked under SFX
    bg_music = os.path.join(AUDIO_DIR, "bg_music.wav")

    inputs = ["-i", bg_music]
    filter_inputs = ["[0:a]volume=0.32[bg];"]
    mix_labels = ["[bg]"]

    current_t = 0.0
    input_idx = 1

    for seg in TIMELINE:
        dur = seg["end"] - seg["start"]
        for sfx_info in seg.get("sfx", []):
            sfx_file = os.path.join(AUDIO_DIR, sfx_info["file"])
            if os.path.exists(sfx_file):
                sfx_time_ms = int((current_t + sfx_info["offset"]) * 1000)
                inputs.extend(["-i", sfx_file])
                lbl = f"sfx{input_idx}"
                filter_inputs.append(f"[{input_idx}:a]adelay={sfx_time_ms}|{sfx_time_ms},volume=0.95[{lbl}];")
                mix_labels.append(f"[{lbl}]")
                input_idx += 1
        current_t += dur

    amix_filter = "".join(filter_inputs) + "".join(mix_labels) + f"amix=inputs={len(mix_labels)}:duration=first:dropout_transition=2[a_out]"

    cmd = [
        FFMPEG_BIN, "-y",
        *inputs,
        "-filter_complex", amix_filter,
        "-map", "[a_out]",
        "-t", str(total_duration),
        "-c:a", "aac",
        "-b:a", "192k",
        audio_out
    ]
    print(f"[Render] Mixing audio track ({len(mix_labels)} channels, {total_duration:.2f}s)...")
    subprocess.run(cmd, check=True)

def assemble_final_reel():
    print("=== STARTING INSTAGRAM REEL PRODUCTION ===")
    clip_files = []
    for idx, seg in enumerate(TIMELINE):
        clip = render_segment(seg, idx)
        clip_files.append(clip)

    concat_video = os.path.join(TEMP_DIR, "video_combined.mp4")
    concatenate_clips(clip_files, concat_video)

    total_duration = sum(s["end"] - s["start"] for s in TIMELINE)
    mixed_audio = os.path.join(TEMP_DIR, "audio_combined.aac")
    build_audio_track(total_duration, mixed_audio)

    final_mp4 = os.path.join(OUTPUT_DIR, "pixel-pet-instagram-reel.mp4")
    cmd = [
        FFMPEG_BIN, "-y",
        "-i", concat_video,
        "-i", mixed_audio,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        final_mp4
    ]
    print(f"[Render] Muxing final video and audio into {final_mp4}...")
    subprocess.run(cmd, check=True)

    # Save timeline metadata
    timeline_metadata = {
        "title": "Pixel Pet - The Perfect Desktop Companion (Instagram Reel)",
        "resolution": "1080x1920 (9:16 Vertical)",
        "duration_seconds": round(total_duration, 2),
        "fps": 30,
        "format": "MP4 (H.264 / AAC)",
        "raw_source": RAW_VIDEO,
        "output_path": final_mp4,
        "segments": TIMELINE
    }
    with open(os.path.join(OUTPUT_DIR, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(timeline_metadata, f, indent=2)

    print("=== INSTAGRAM REEL GENERATION COMPLETE! ===")
    print(f"Final Deliverable: {final_mp4}")
    return final_mp4

if __name__ == "__main__":
    assemble_final_reel()
