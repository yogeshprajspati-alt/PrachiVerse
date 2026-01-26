import re

# Read the file
with open(r'x:\Deepak\PERSONAL\Just Prachi\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match cards that don't have card-content wrapper
# Match from <a href...class="card"> to </a>
pattern = r'(<a href="[^"]*" class="card">)\s*(<span class="card-icon">.*?</a>)'

def add_wrapper(match):
    opening = match.group(1)
    card_body = match.group(2)
    
    # Check if already has card-content
    if '<div class="card-content">' in card_body:
        return match.group(0)
    
    # Extract the closing </a>
    card_body_without_closing = card_body.rsplit('</a>', 1)[0]
    
    # Add proper indentation
    lines = card_body_without_closing.split('\n')
    indented_lines = []
    for line in lines:
        if line.strip():
            indented_lines.append('    ' + line)
        else:
            indented_lines.append(line)
    
    indented_body = '\n'.join(indented_lines)
    
    return f'''{opening}
                    <div class="card-content">
{indented_body}
                    </div>
                </a>'''

# Replace all matches
content = re.sub(pattern, add_wrapper, content, flags=re.DOTALL)

# Write back
with open(r'x:\Deepak\PERSONAL\Just Prachi\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! All cards now have card-content wrapper.")
