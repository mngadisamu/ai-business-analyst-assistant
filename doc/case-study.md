# Case Study: AI Business Analyst Assistant

Week 2 project, CAPACITI x Clickatell AI Bootcamp (April 2026).

## Problem

Business analysts spend a lot of time turning short, vague requirements into user stories, acceptance criteria, test cases and stakeholder questions. An AI model can draft these quickly, but left alone it tends to fill gaps with plausible-sounding rules. For a BA, an invented rule that looks real is worse than a gap that is flagged.

## Approach

The project is built around a prompt, not a model. A master prompt sets the assistant's role (an assistant, not a replacement for the analyst), its six outputs, a fixed output structure, and rules such as: do not fabricate requirements, do not hide assumptions, prioritise clarification over assumptions, keep documentation traceable to the original requirement. A Prompt Engineering Mode lets the analyst improve and compare prompts using Prompt → Test → Evaluate → Refine → Test Again → Final Prompt.

## Build

I described what I wanted to Gemini in Google AI Studio and iterated on the result:

1. The first attempt only echoed the master prompt back. I clarified that I wanted a working chatbot, and it generated a web app.
2. The chatbot did not respond. The fix was an API key settings dialog in the sidebar, with errors shown inside the chat.
3. A `marked is not defined` error followed. The fix was to replace the external markdown library with an internal markdown formatter.

The result is BA Assistant Studio (React, TypeScript, Vite, Gemini API). It returns the six outputs, saves sessions, supports quick templates, has a dark mode and exports any analysis as Markdown.

## Example

For "Admin users need to reset user passwords securely", the assistant returned a requirement analysis, a user story, five acceptance criteria, four test cases and five clarification questions. It flagged "securely" as undefined and marked the reset method "Requires clarification". Full output: [examples/admin-password-reset.md](examples/admin-password-reset.md). I also ran the leave-application example from the master prompt: [examples/leave-application.md](examples/leave-application.md). There it correctly listed leave types, approvers, balances and notifications as unknowns instead of assuming them.

## What I found when reviewing the output

- The assistant handled ambiguity well: it asked about the reset method, session handling and MFA instead of choosing for me.
- It still added specifics the requirement did not contain (a 403 error and audit-log fields for the password reset; a leave balance check and an "Annual Leave" type in the leave test cases) and test cases with no matching acceptance criterion in both runs.
- The tool's output headings are not identical to the master prompt's, so the structure rule is not fully enforced.

These are the gaps the next prompt revision targets. See [prompt-optimization.md](prompt-optimization.md).

## Limits

- Output depends on the model and can differ between runs. Two recorded examples are not a test of reliability.
- The assistant drafts; the Business Analyst validates. Nothing it produces is final documentation.
- Prompt refinement and the version comparison are planned, not yet run.

## What I learned

- Writing "do not invent" into a prompt helps but does not remove invention, so the output must be reviewed.
- Explicit rules (mark unknowns "Requires clarification") make gaps visible, which is what a BA needs.
- A prompt can be evaluated like a requirement: against a checklist, on the same inputs, before and after a change.
