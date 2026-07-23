# Table of Contents

1. [A - How to add Table of Contents](#A%20-%20How%20to%20add%20Table%20of%20Contents)
	1. [1. Requirements](#1.%20Requirements)
		1. [1.1. How to export to PDF](#1.1.%20How%20to%20export%20to%20PDF)
2. [B - Export to PDF](#B%20-%20Export%20to%20PDF)
	1. [1. Requirements](#1.%20Requirements)
		1. [1.1 How to export to PDF](#1.1%20How%20to%20export%20to%20PDF)
3. [C - Diagram example](#C%20-%20Diagram%20example)
	1. [1. Diagram rules](#1.%20Diagram%20rules)
4. [D - Image example](#D%20-%20Image%20example)
	1. [1. Insert image rule](#1.%20Insert%20image%20rule)

# A - How to add Table of Contents

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Requirements

Install Obsidian

Install Plugin "Table of Contents"

Plugin settings -> enable "Markdown links"

### 1.1. How to export to PDF

==Delete all Table of Contents (Including title) -> CTRL P -> TABLE OF CONTENTS==

# B - Export to PDF

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Requirements

Install Obsidian

Install Plugin **"Better export PDF"**

Use default format

### 1.1 How to export to PDF

==CTRL P -> Better export PDF: Export current file to PDF==

# C - Diagram example

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Diagram rules

Diagram must be drawn using Mermaid.

Example as below:

**Workflow 1: User Authentication & Post Creation**

```mermaid
flowchart TD
    A[User clicks Create Post] --> B{Is Authenticated?}
    B -- No --> C[Redirect to Login/Signup]
    C --> D[User Authenticates]
    D --> E[Open Post Editor]
    B -- Yes --> E

```

# D - Image example

*Work performed by: [Name] | Reviewed by: [Name] | Edited by: [Name]*

## 1. Insert image rule

Insert as markdown format `![Name](image link)`

Example as below:

![Jira Board 1](./PA2-Group06/images/jira1.png)