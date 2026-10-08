# Prompt Optimization

The method for improving the master prompt: **Prompt → Test → Evaluate → Refine → Test Again → Final Prompt**.

## What has been done

1. **Prompt:** the master prompt (see [prompt-library.md](prompt-library.md)), written around six outputs, rules against inventing requirements, and a Prompt Engineering Mode.
2. **Test:** run on two requirements: "Admin users need to reset user passwords securely" ([output](examples/admin-password-reset.md)) and "Employees should be able to apply for leave online" ([output](examples/leave-application.md)).
3. **Evaluate:** against the checklist below.

### Evaluation of the recorded outputs

#### Test 1: password reset

| Check | Result | Evidence |
| --- | --- | --- |
| Assumptions are labelled | Met | Assumptions are marked "AI Assumption" |
| Unknown rules are marked "Requires clarification" | Met | AC 2 marks the reset method that way |
| Missing information is named | Met | Reset method, admin hierarchy and forced password change are listed |
| Clarification questions are relevant | Met | Mechanism, password policy, sessions and MFA |
| No invented requirements | Partly | AC 4 specifies a "403 Forbidden" error and AC 5 lists audit-log fields. Neither was in the requirement. |
| Test cases trace to acceptance criteria | Partly | TC-02 (non-existent user) has no matching acceptance criterion |
| Output structure matches the master prompt | Partly | The tool merges "Missing Information / Risks" into other sections and combines the quality check with the BA review notes |

The "Partly" rows are the starting points for refinement.

#### Test 2: leave application

| Check | Result | Evidence |
| --- | --- | --- |
| Does not assume the things the master prompt lists (leave types, approvers, balances, notifications, mandatory fields) | Mostly met | Each is listed under missing information and asked about in the clarification questions. AC 3, AC 4 and TC03 are marked "Requires clarification". |
| Assumptions are labelled | Partly | The employee-database and approval-process assumptions are labelled. "Transition from a manual/offline process" and "reduce paper usage" are stated as the business need and objectives, but the requirement says neither. |
| No invented requirements | Partly | TC01 assumes a leave balance check and an "Annual Leave" type, which the master prompt names as things not to assume. The user story adds "track the status", which the requirement does not mention. AC 1 and AC 2 fix specific messages and behaviour ("Submission Successful", highlight missing fields). |
| Test cases trace to acceptance criteria | Partly | TC03 (past dates) and TC04 (not logged in) have no acceptance criterion. AC 3 and AC 4 have no test case. |
| Output structure matches the master prompt | Partly | Same as test 1: "Missing Information / Risks" is folded into the analysis and the quality check is combined with the review notes. |
| Quality check avoids a numerical score | Met | Yes/No/Partially per attribute. |

#### What both tests show

- The assistant is reliable at the main job: it names the gaps and asks the right questions.
- The same three weaknesses appear in both outputs: specifics added to acceptance criteria and test cases, test cases that do not trace to acceptance criteria, and merged output sections. These are the targets for refinement.

## What is still to do

These steps need real test runs. Results should be added only after the prompt has actually been run.

4. **Refine:** tighten the master prompt where the evaluation found a gap. Candidates:
   - Say that acceptance criteria and test cases must not contain specific error codes, field lists or behaviours unless the requirement states them, or must mark them "Requires clarification."
   - Say that every test case must name the acceptance criterion it covers.
   - Fix the output headings so the tool always returns the seven sections listed in the master prompt.
5. **Test again:** run the original and refined prompts on the same requirements (the same two requirements, so the results are comparable) and score both with the checklist above.
6. **Final prompt:** keep the version that scores better and record the changes.

## Comparison template

| Check | Version 1 (master prompt) | Version 2 (refined) |
| --- | --- | --- |
| Assumptions labelled | | |
| Unknown rules marked "Requires clarification" | | |
| No invented specifics | | |
| Test cases traced to acceptance criteria | | |
| Seven sections returned | | |
| Notes | | |
