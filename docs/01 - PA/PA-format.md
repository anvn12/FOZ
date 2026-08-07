<div style="text-align: center; margin: 0 auto; padding: 40px 20px; min-height: 85vh; display: flex; flex-direction: column;">
  <div style="text-transform: uppercase; line-height: 1.8;">
    <div>VNUHCM - University of Science</div>
    <div>Faculty of Information Technology</div>
  </div>

  <div style="border-top: 2px solid black; margin: 30px 0;"></div>

  <div style="margin: 20px 0;">
    <h1 style="margin: 0; padding: 0 0 10px 0; font-size: 2.2em; border: none;">PAxxx Report</h1>
    <div style="font-size: 1.2em; font-weight: bold;">Group 6: PDF</div>
  </div>

  <div style="border-top: 2px solid black; margin: 30px 0;"></div>

  <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 40px;">
    CSC13002 - Introduction to Software Engineering
  </div>

  <div style="display: flex; justify-content: space-between; margin: 0 5%; text-align: left; line-height: 1.8;">
    <div style="width: 50%;">
      <div style="font-style: italic;">Author:</div>
      <div>Nguyễn Tuấn An - 24127011</div>
      <div>Nguyễn Hải Nam - 24127088</div>
      <div>Nguyễn Hải Trọng - 24127311</div>
      <div>Phạm Đinh Gia Khánh - 24127420</div>
      <div>Võ An Phú - 24127494</div>
    </div>
    <div style="width: 45%;">
      <div style="font-style: italic;">Lecturer:</div>
      <div>Ms. Nguyễn Thị Minh Tuyền</div>
      <div>Mr. Hồ Tuấn Thanh</div>
      <div>Mr. Mai Anh Tuấn</div>
    </div>
  </div>

  <div style="margin-top: auto; padding-top: 60px;">
    MONTH DAY, YEAR
  </div>
</div>

<div style="page-break-after: always;"></div>

# Table of Contents

1. [A - How to add Table of Contents](#a---how-to-add-table-of-contents)
	1. [1. Requirements](#1-requirements)
		1. [1.1. How to export to PDF](#11-how-to-export-to-pdf)
2. [B - Export to PDF](#b---export-to-pdf)
	1. [1. Requirements](#1-requirements)
		1. [1.1 How to export to PDF](#11-how-to-export-to-pdf)
3. [C - Diagram example](#c---diagram-example)
	1. [1. Diagram rules](#1-diagram-rules)
4. [D - Image example](#d---image-example)
	1. [1. Insert image rule](#1-insert-image-rule)

<div style="page-break-after: always;"></div>

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