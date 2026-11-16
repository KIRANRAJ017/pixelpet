import numpy as np
import wave
import struct
import os

SAMPLE_RATE = 44100

def save_wav(filename, samples, sample_rate=SAMPLE_RATE):
    # Ensure float in [-1.0, 1.0] and convert to 16-bit PCM
    samples = np.clip(samples, -1.0, 1.0)
    int_samples = (samples * 32767).astype(np.int16)
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(int_samples.tobytes())
    print(f"[Audio] Created {filename} ({len(samples)/sample_rate:.2f}s)")

def make_pop():
    # Crisp bubbly pop sound (0.15s)
    dur = 0.15
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    freq = np.linspace(400, 1200, len(t))
    env = np.exp(-t * 30)
    sig = np.sin(2 * np.pi * freq * t) * env
    return sig

def make_meow():
    # Cute retro kitty chirp (0.35s)
    dur = 0.35
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    # Pitch rises then falls: 550 -> 880 -> 660
    f = 600 + 350 * np.sin(np.pi * (t / dur))
    phase = np.cumsum(f) / SAMPLE_RATE
    # Soft square/triangle wave hybrid
    sig = np.sin(2 * np.pi * phase) + 0.3 * np.sin(6 * np.pi * phase)
    env = np.sin(np.pi * (t / dur)) ** 0.8
    return sig * env * 0.7

def make_spooky():
    # Boo ghost wobble (0.4s)
    dur = 0.4
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    vib = np.sin(2 * np.pi * 12 * t) * 40
    f = 440 + vib + np.linspace(0, 150, len(t))
    phase = np.cumsum(f) / SAMPLE_RATE
    env = np.sin(np.pi * (t / dur))
    return np.sin(2 * np.pi * phase) * env * 0.6

def make_dizzy():
    # Playful cartoon dizzy twirl / star chimes (1.8s)
    dur = 1.8
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    sig = np.zeros_like(t)
    # Sparkly ascending/descending arpeggio
    notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1046.50, 783.99, 659.25]
    step = dur / len(notes)
    for i, n in enumerate(notes):
        t_start = i * step
        idx = (t >= t_start) & (t < t_start + step * 1.5)
        sub_t = t[idx] - t_start
        env = np.exp(-sub_t * 6)
        sig[idx] += np.sin(2 * np.pi * n * sub_t) * env * 0.4
    # Add whirling undertone
    whirl = np.sin(2 * np.pi * (300 + 120 * np.sin(2 * np.pi * 4 * t)) * t) * 0.25 * (1 - t/dur)
    return (sig + whirl) * 0.85

def make_angry():
    # Punchy retro comedic "!?" vine boom / bass hit (0.7s)
    dur = 0.7
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    # Sub bass drop 180Hz -> 45Hz
    f_sub = 180 * np.exp(-t * 6) + 45
    phase_sub = np.cumsum(f_sub) / SAMPLE_RATE
    bass = np.sin(2 * np.pi * phase_sub) * np.exp(-t * 4.5)
    
    # Sharp metallic impact transient (first 80ms)
    f_high = np.linspace(1400, 200, len(t))
    impact = np.sin(2 * np.pi * f_high * t) * np.exp(-t * 40)
    
    # 3 quick exclamation beeps (pop pop pop)
    beeps = np.zeros_like(t)
    for b in range(3):
        t0 = 0.05 + b * 0.09
        idx = (t >= t0) & (t < t0 + 0.06)
        sub_t = t[idx] - t0
        beeps[idx] += np.sign(np.sin(2 * np.pi * 880 * sub_t)) * np.exp(-sub_t * 30) * 0.35
        
    combo = (bass * 0.8 + impact * 0.4 + beeps * 0.6)
    return combo * 0.9

def make_chomp():
    # Cute bite / munch crunch sound (0.35s)
    dur = 0.35
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    noise = np.random.uniform(-1, 1, len(t))
    env1 = np.exp(-t * 18)
    crunch = noise * env1 * 0.5
    tone = np.sin(2 * np.pi * 320 * t) * env1 * 0.5
    return (crunch + tone) * 0.8

def make_happy_chime():
    # Sparkle / level-up chime (0.6s)
    dur = 0.6
    t = np.linspace(0, dur, int(SAMPLE_RATE * dur), False)
    sig = np.zeros_like(t)
    notes = [523.25, 659.25, 783.99, 1046.50]
    for i, n in enumerate(notes):
        t0 = i * 0.1
        idx = t >= t0
        sub_t = t[idx] - t0
        sig[idx] += np.sin(2 * np.pi * n * sub_t) * np.exp(-sub_t * 8) * 0.3
    return sig

def make_bg_music(duration=30.0):
    # Upbeat retro 8-bit lofi chiptune groove (30s)
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), False)
    sig = np.zeros_like(t)
    
    bpm = 124
    beat_dur = 60.0 / bpm
    sixteenth = beat_dur / 4.0
    
    # Bassline notes (C minor / Eb / Ab / Bb cute groove)
    bass_freqs = [130.81, 130.81, 155.56, 174.61, 207.65, 207.65, 233.08, 261.63]
    melody_scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]
    
    # Generate rhythmic 16th-note patterns
    total_steps = int(duration / sixteenth)
    for step in range(total_steps):
        t0 = step * sixteenth
        idx = (t >= t0) & (t < t0 + sixteenth)
        sub_t = t[idx] - t0
        
        # Bass on every 8th note
        if step % 2 == 0:
            note_idx = (step // 4) % len(bass_freqs)
            bf = bass_freqs[note_idx]
            sig[idx] += 0.28 * np.sign(np.sin(2 * np.pi * bf * sub_t)) * np.exp(-sub_t * 6)
            
        # Percussive hi-hat on every 16th note
        noise = np.random.uniform(-0.15, 0.15, len(sub_t))
        sig[idx] += noise * np.exp(-sub_t * 50)
        
        # Snare on 2 and 4 (step 4, 12 in 16-step bar)
        if step % 16 in [4, 12]:
            sig[idx] += np.random.uniform(-0.4, 0.4, len(sub_t)) * np.exp(-sub_t * 18)
            
        # Kick on 1 and 3 (step 0, 8)
        if step % 16 in [0, 8]:
            kick_f = np.linspace(150, 40, len(sub_t))
            sig[idx] += 0.45 * np.sin(2 * np.pi * kick_f * sub_t) * np.exp(-sub_t * 15)
            
        # Playful melody arpeggios
        if step % 2 == 1:
            m_idx = (step * 3 + (step // 8)) % len(melody_scale)
            mf = melody_scale[m_idx]
            sig[idx] += 0.22 * np.sin(2 * np.pi * mf * sub_t) * np.exp(-sub_t * 10)
            
    # Apply warm master filter / compression
    sig = sig * 0.75
    return sig

def main():
    audio_dir = os.path.join(os.path.dirname(__file__), 'audio')
    save_wav(os.path.join(audio_dir, 'pop.wav'), make_pop())
    save_wav(os.path.join(audio_dir, 'meow.wav'), make_meow())
    save_wav(os.path.join(audio_dir, 'spooky.wav'), make_spooky())
    save_wav(os.path.join(audio_dir, 'dizzy.wav'), make_dizzy())
    save_wav(os.path.join(audio_dir, 'angry.wav'), make_angry())
    save_wav(os.path.join(audio_dir, 'chomp.wav'), make_chomp())
    save_wav(os.path.join(audio_dir, 'happy.wav'), make_happy_chime())
    save_wav(os.path.join(audio_dir, 'bg_music.wav'), make_bg_music(32.0))
    print("[Audio] All sound effects & background music successfully generated!")

if __name__ == '__main__':
    main()
