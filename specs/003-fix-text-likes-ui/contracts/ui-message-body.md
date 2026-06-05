# UI Contract: Message Body Text

**Applies to**: Thread and reply content in feed cards

**Date**: 2026-06-04

---

## Requirements

| ID | Rule |
|---|---|
| UI-001 | Preserve user line breaks (newlines in content) |
| UI-002 | Wrap long lines within card content width |
| UI-003 | Break long unbroken strings (URLs, repeated characters) |
| UI-004 | No horizontal scrollbar on the message body element |

---

## Tailwind implementation reference

Shared utility classes on `<p>` (or equivalent) for thread and reply bodies:

- `whitespace-pre-wrap`
- `break-words`
- Parent flex child: `min-w-0` on text column container

---

## Verification content

Test strings:

1. 500-character paragraph with normal spaces
2. Single line of 200+ characters without spaces
3. HTTPS URL 80+ characters
4. Reply with same patterns under a thread
