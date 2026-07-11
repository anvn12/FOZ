# Spec Kit & Spec-Driven Development (SDD) Self Training

*Performed by: Phạm Đinh Gia Khánh | Reviewed by: Nguyễn Hải Nam*

# 1. What is Spec Kit / SDD?

Spec Kit is an open-source toolkit created by GitHub/Microsoft that helps teams practice **Spec-Driven Development (SDD)**.

It helps structure and guide AI coding agents (like GitHub Copilot, Claude Code, etc.) to produce better results.

It prevents the chaos of **"vibe coding"**—where AI is allowed to code freely, often resulting in buggy or messy outputs—by forcing the AI to follow strict, pre-defined specifications before writing any code.

---

# 2. Spec Kit's Workflow

## `/constitution` (The Rules)

Set the project's permanent ground rules (e.g., tech stack, coding style).

## `/spec` (The "What")

Define exactly what you want to build and why (business logic and user experience).

## `/plan` (The "How")

Design the technical architecture and decide how to build it.

## `/tasks` (The Steps)

Break the technical plan down into a step-by-step coding checklist.

## `/implement` (The Code)

The AI writes the actual code by strictly following the checklist, plan, and rules.

---

# 3. Key Things I Have Learned

* Constitution is utmost important, setting bad constitution probably lead to bad result.
* Always review what AI have generated to avoid wrong outputs.
* If requirements change later, update the Spec or Plan file first, then have the AI regenerate the code. Don't bypass the system.
