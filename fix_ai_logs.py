import os

filepath = r'C:\Users\DELL\OneDrive\Máy tính\NMCNPM\FOZ\ai-logs\thomasmarc25.md'

with open(filepath, 'rb') as f:
    content = f.read()

# Remove all NUL bytes
clean_content = content.replace(b'\x00', b'')

with open(filepath, 'wb') as f:
    f.write(clean_content)

print("Removed NUL bytes from ai-logs/thomasmarc25.md")
