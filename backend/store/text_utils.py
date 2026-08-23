import re

# Matches real CR/LF control chars and the literal escaped text "\r\n"/"\r"/"\n".
_ARTIFACT_RE = re.compile(r'(?:\\r\\n|\\r|\\n|\r\n|\r|\n)')
_WHITESPACE_RE = re.compile(r'\s+')


def clean_spec_text(value):
    """Strip stray CR/LF artifacts from a single label/key/value fragment."""
    if not value:
        return ''
    cleaned = _ARTIFACT_RE.sub(' ', str(value))
    cleaned = _WHITESPACE_RE.sub(' ', cleaned)
    return cleaned.strip()


def clean_config_string(raw_config):
    """Clean every fragment of a raw Product.config mini-syntax string
    ("- Label + Key: Value + ...") and rebuild it in the same format."""
    if not raw_config:
        return ''

    segments_out = []
    for segment in raw_config.split('- '):
        segment = segment.strip()
        if not segment:
            continue
        parts = [p.strip() for p in segment.split(' + ')]
        if len(parts) < 2:
            continue
        label = clean_spec_text(parts[0])
        kv_out = []
        for kv in parts[1:]:
            if ': ' in kv:
                k, v = kv.split(': ', 1)
                kv_out.append(f"{clean_spec_text(k)}: {clean_spec_text(v)}")
            else:
                cleaned_kv = clean_spec_text(kv)
                if cleaned_kv:
                    kv_out.append(cleaned_kv)
        if label and kv_out:
            segments_out.append(f"{label} + {' + '.join(kv_out)}")

    return '\n'.join(f"- {seg}" for seg in segments_out)


def parse_config_items(raw_config):
    """Parse a raw Product.config string into [{'label', 'specs': [{'key','value'}]}]."""
    if not raw_config:
        return []

    config_items = []
    for segment in raw_config.split('- '):
        segment = segment.strip()
        if not segment:
            continue
        parts = [p.strip() for p in segment.split(' + ')]
        if len(parts) >= 2:
            label = clean_spec_text(parts[0])
            specs = []
            for kv in parts[1:]:
                if ': ' in kv:
                    k, v = kv.split(': ', 1)
                    specs.append({'key': clean_spec_text(k), 'value': clean_spec_text(v)})
                else:
                    specs.append({'key': clean_spec_text(kv), 'value': ''})
            config_items.append({'label': label, 'specs': specs})
    return config_items
