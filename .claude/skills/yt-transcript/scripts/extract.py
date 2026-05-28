#!/usr/bin/env python3
"""
yt-transcript extractor — compatible with youtube-transcript-api v1.x
Usage: python3 extract.py <youtube_url> [--timestamps] [--json]
Requires: pip install youtube-transcript-api
"""

import sys
import json
import re
import argparse


def extract_video_id(url: str) -> str:
    patterns = [r'(?:v=|youtu\.be/|shorts/)([a-zA-Z0-9_-]{11})']
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return url
    return None


def get_transcript(video_id: str, lang: str = 'auto'):
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        return None, "youtube-transcript-api not installed. Run: pip install youtube-transcript-api"

    try:
        # v1.x API: instantiate, then call list(video_id)
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)

        entries = None

        # Try preferred language
        if lang != 'auto':
            for t in transcript_list:
                if t.language_code == lang:
                    entries = t.fetch()
                    break

        # Try manually created transcripts first (better quality)
        if entries is None:
            for t in transcript_list:
                if not t.is_generated:
                    entries = t.fetch()
                    break

        # Fall back to any available transcript
        if entries is None:
            for t in transcript_list:
                entries = t.fetch()
                break

        if entries is None:
            return None, "No transcript found for this video"

        # v1.x returns FetchedTranscriptSnippet objects — convert to dicts
        result = []
        for snippet in entries:
            result.append({
                'text': snippet.text,
                'start': snippet.start,
                'duration': snippet.duration
            })
        return result, None

    except Exception as e:
        return None, str(e)


def clean_text(text: str) -> str:
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'♪.*?♪', '', text)
    text = re.sub(r'\b(um|uh|er|ah)\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r' +', ' ', text).strip()
    return text


def format_time(seconds: float) -> str:
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def build_paragraphs(entries, sentences_per_para=5):
    paragraphs = []
    current = []
    sentence_count = 0
    for entry in entries:
        text = clean_text(entry.get('text', ''))
        if not text:
            continue
        current.append(text)
        sentence_count += text.count('.') + text.count('?') + text.count('!')
        if sentence_count >= sentences_per_para:
            paragraphs.append(' '.join(current))
            current = []
            sentence_count = 0
    if current:
        paragraphs.append(' '.join(current))
    return paragraphs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('url', help='YouTube URL or video ID')
    parser.add_argument('--lang', default='auto')
    parser.add_argument('--timestamps', action='store_true')
    parser.add_argument('--json', action='store_true', dest='as_json')
    args = parser.parse_args()

    video_id = extract_video_id(args.url)
    if not video_id:
        print(json.dumps({"error": f"Could not extract video ID from: {args.url}"}))
        sys.exit(1)

    entries, error = get_transcript(video_id, args.lang)
    if error or not entries:
        print(json.dumps({"error": error or "No transcript found", "video_id": video_id}))
        sys.exit(1)

    paragraphs = build_paragraphs(entries)
    full_text = '\n\n'.join(paragraphs)
    word_count = len(full_text.split())

    timestamped = []
    if args.timestamps:
        for entry in entries:
            text = clean_text(entry.get('text', ''))
            if text:
                timestamped.append({
                    "time": format_time(entry.get('start', 0)),
                    "text": text
                })

    if args.as_json:
        print(json.dumps({
            "video_id": video_id,
            "url": args.url,
            "word_count": word_count,
            "full_text": full_text,
            "paragraphs": paragraphs,
            "timestamped": timestamped
        }, ensure_ascii=False, indent=2))
    else:
        print(f"VIDEO_ID: {video_id}")
        print(f"LANGUAGE: {args.lang}")
        print(f"WORD_COUNT: {word_count}")
        print(f"ENTRY_COUNT: {len(entries)}")
        print("---FULL_TEXT---")
        print(full_text)
        if args.timestamps:
            print("---TIMESTAMPS---")
            for t in timestamped:
                print(f"[{t['time']}] {t['text']}")


if __name__ == '__main__':
    main()
