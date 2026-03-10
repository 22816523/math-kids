"""
批量生成英语启蒙MVP所需的全部MP3音频文件
使用 Edge-TTS (微软 Azure 神经语音引擎，免费)
"""
import asyncio
import edge_tts
import os

# 输出目录
OUTPUT_DIR = r"D:\文档\JTY\AI项目文档\888-自定义产品\2-英语启蒙\mvp_web\audio"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 选择一个温柔自然的美式女声（适合儿童教育）
VOICE = "en-US-AnaNeural"  # Ana: 微软专为儿童设计的活泼女声

# ===== 40个核心单词 =====
WORDS = [
    "apple", "red", "banana", "yellow", "orange", "big", "grape", "small",
    "watermelon", "green", "cat", "dog", "bird", "fish", "rabbit", "duck",
    "bear", "monkey", "elephant", "lion", "blue", "white", "black", "pink",
    "purple", "brown", "star", "sun", "moon", "rainbow", "eye", "ear",
    "nose", "mouth", "hand", "foot", "head", "face", "arm", "leg"
]

# ===== 10个核心短句 =====
SENTENCES = {
    "s01": "This is an apple.",
    "s02": "I like bananas.",
    "s03": "The cat is small.",
    "s04": "I see a dog.",
    "s05": "The bird can fly.",
    "s06": "I like red.",
    "s07": "My eyes can see.",
    "s08": "I have two hands.",
    "s09": "The sun is yellow.",
    "s10": "Hello, how are you?"
}

async def generate_audio(text, filename):
    """生成单个音频文件"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    communicate = edge_tts.Communicate(text, VOICE, rate="-10%")  # 稍慢语速，适合儿童
    await communicate.save(filepath)
    print(f"  [OK] {filename}")

async def main():
    print("=" * 50)
    print("[Audio Generator] English Learning MVP")
    print(f"Voice: {VOICE}")
    print("=" * 50)
    
    # 生成单词音频
    print(f"\n[Words] Generating {len(WORDS)} word audio files...")
    for word in WORDS:
        await generate_audio(word, f"{word}.mp3")
    
    # 生成短句音频
    print(f"\n[Sentences] Generating {len(SENTENCES)} sentence audio files...")
    for sid, sentence in SENTENCES.items():
        await generate_audio(sentence, f"{sid}.mp3")
    
    print(f"\nDone! Total: {len(WORDS) + len(SENTENCES)} audio files")
    print(f"Output: {OUTPUT_DIR}")

asyncio.run(main())
