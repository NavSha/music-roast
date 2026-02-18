import json
import anthropic

SYSTEM_PROMPT = """You are the world's most brutally funny music critic. You roast song LYRICS only — never attack the artist personally, their appearance, or anything outside the lyrics themselves.

Your roasts are:
- Hilarious and clever, not mean-spirited or offensive
- Full of creative metaphors, pop culture references, and wordplay
- Specific to actual lines and themes in the lyrics (quote them!)
- Safe for a live audience at a community event

You must respond with ONLY valid JSON (no markdown, no code fences, no extra text). Use this exact structure:
{
  "overall_score": <integer 1-10, where 1 = dumpster fire and 10 = Shakespeare>,
  "overall_score_comment": "<one-liner about the score>",
  "the_roast": "<3-5 paragraphs of hilarious lyrical critique, reference specific lines>",
  "cliche_counter": [{"cliche": "<overused trope>", "quip": "<funny comment>"}],
  "lyrical_crime_highlights": [{"line": "<actual lyric>", "crime": "<what crime it commits>", "sentence": "<humorous punishment>"}],
  "hidden_meanings": "<funny satirical over-analysis, 2-3 sentences>",
  "final_verdict": "<punchy 1-2 sentence final verdict>"
}

Include 3-6 items in cliche_counter and 3-5 items in lyrical_crime_highlights."""

SEVERITY_INSTRUCTIONS = {
    "mild": "Be playful and lighthearted. Think gentle teasing from a friend who still likes the song. Use humor that makes people smile and nod. Keep it fun.",
    "medium": "Be pointed and witty. Think a comedian doing a bit about the song — sharp observations, clever burns, but still good-natured. The audience should laugh out loud.",
    "savage": "Be absolutely merciless. Think a roast battle where the song's lyrics are your opponent. No mercy, no holding back. Creative destruction. The audience should be gasping between laughs. Still keep it about the lyrics only.",
}

ROAST_SCHEMA = {
    "type": "object",
    "properties": {
        "overall_score": {
            "type": "integer",
            "description": "Lyrical quality score from 1-10 (1 = dumpster fire, 10 = Shakespeare)",
        },
        "overall_score_comment": {
            "type": "string",
            "description": "A one-liner comment about the score, e.g. 'Technically words were used'",
        },
        "the_roast": {
            "type": "string",
            "description": "The main roast — 3-5 paragraphs of hilarious lyrical critique. Reference specific lines. Be creative and funny.",
        },
        "cliche_counter": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "cliche": {
                        "type": "string",
                        "description": "The cliche or overused trope found",
                    },
                    "quip": {
                        "type": "string",
                        "description": "A short funny comment about this cliche",
                    },
                },
                "required": ["cliche", "quip"],
            },
            "description": "List of 3-6 cliches or overused tropes found in the lyrics, each with a funny quip",
        },
        "lyrical_crime_highlights": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "line": {
                        "type": "string",
                        "description": "The actual lyric line being roasted",
                    },
                    "crime": {
                        "type": "string",
                        "description": "What lyrical crime this line commits",
                    },
                    "sentence": {
                        "type": "string",
                        "description": "The humorous punishment/sentence for this crime",
                    },
                },
                "required": ["line", "crime", "sentence"],
            },
            "description": "3-5 specific lines from the lyrics that are particularly roast-worthy",
        },
        "hidden_meanings": {
            "type": "string",
            "description": "A funny 'deep dive' into what the lyrics REALLY mean (satirical over-analysis, 2-3 sentences)",
        },
        "final_verdict": {
            "type": "string",
            "description": "A punchy 1-2 sentence final verdict, like a judge passing sentence",
        },
    },
    "required": [
        "overall_score",
        "overall_score_comment",
        "the_roast",
        "cliche_counter",
        "lyrical_crime_highlights",
        "hidden_meanings",
        "final_verdict",
    ],
}


def generate_roast(artist, title, lyrics, severity="medium"):
    """Generate a structured roast using Claude API."""
    client = anthropic.Anthropic()

    severity_instruction = SEVERITY_INSTRUCTIONS.get(severity, SEVERITY_INSTRUCTIONS["medium"])

    user_message = f"""Roast the lyrics of "{title}" by {artist}.

Severity level: {severity.upper()}
{severity_instruction}

Here are the lyrics:

{lyrics}"""

    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": "{"},
        ],
    )

    text = "{" + response.content[0].text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text[:-3].strip()
    # Extract JSON object in case of trailing text
    depth = 0
    end = 0
    for i, ch in enumerate(text):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end:
        text = text[:end]
    return json.loads(text)


def generate_roast_stream(artist, title, lyrics, severity="medium"):
    """Stream roast tokens as SSE events, then yield the final parsed JSON."""
    client = anthropic.Anthropic()

    severity_instruction = SEVERITY_INSTRUCTIONS.get(severity, SEVERITY_INSTRUCTIONS["medium"])

    user_message = f"""Roast the lyrics of "{title}" by {artist}.

Severity level: {severity.upper()}
{severity_instruction}

Here are the lyrics:

{lyrics}"""

    try:
        with client.messages.stream(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": "{"},
            ],
        ) as stream:
            full_text = "{"
            for text in stream.text_stream:
                full_text += text
                yield f"event: token\ndata: {json.dumps(text)}\n\n"

        # Clean up and parse the full response
        text = full_text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3].strip()
        depth = 0
        end = 0
        for i, ch in enumerate(text):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end:
            text = text[:end]

        result = json.loads(text)
        result["artist"] = artist
        result["title"] = title
        result["severity"] = severity
        yield f"event: done\ndata: {json.dumps(result)}\n\n"
    except Exception as e:
        yield f"event: error\ndata: {json.dumps(str(e))}\n\n"
