# Example output: Employees should be able to apply for leave online

**Requirement entered:** Employees should be able to apply for leave online.

This is the example requirement from the master prompt. The output below is the assistant's response, unedited apart from Markdown formatting (headings, bullets and a table). It is a draft for the Business Analyst to validate. An evaluation against the checklist is in [../prompt-optimization.md](../prompt-optimization.md).

---

This is a high-level, "epic-level" requirement. It provides a general goal but lacks the detail necessary for technical implementation or testing.

Here is the analysis and structured documentation based on the information provided, along with the critical gaps that need to be addressed.

## 1. Requirement Analysis

- **Main Business Need:** Transition from a manual/offline leave application process to a digital, online system.
- **Likely User/Stakeholder:** Employees (Applicants), Line Managers (Approvers), HR Department (Process Owners).
- **Requested Functionality:** A digital interface for submitting leave requests.
- **Business Objectives:** Increase efficiency, reduce paper usage, and improve tracking of employee absences.
- **Missing Information:**
  - Leave types (Annual, Sick, Maternity, etc.).
  - Approval workflow (Who approves? How many levels?).
  - Business rules (Minimum notice periods, maximum duration, balance checks).
  - Required data fields (Start/End dates, reasons, attachments).
- **Ambiguities:** "Online" could mean a web portal, a mobile app, or an internal intranet.
- **Assumptions Requiring Validation:**
  - Assumption: The system will integrate with an existing employee database to identify the user.
  - Assumption: There is an approval process required after submission.
- **Potential Risks or Dependencies:**
  - Dependency: Access to a centralized HRIS or database for leave balances.
  - Risk: Data privacy concerns regarding medical/sick leave information.

## 2. User Story

As an Employee,
I want to submit my leave requests through an online portal,
so that I can request time off efficiently and track the status of my application without manual paperwork.

## 3. Acceptance Criteria

**AC 1: Successful Leave Submission (Positive)**
- Given I am a logged-in employee on the leave portal
- When I enter a valid start date, end date, and leave type
- And I click "Submit"
- Then the system should save the request and display a "Submission Successful" message.

**AC 2: Validation of Required Fields (Negative)**
- Given I am on the leave application page
- When I attempt to submit a request without selecting a leave type or date range
- Then the system should prevent submission and highlight the missing fields.

**AC 3: Workflow Trigger (Rule-based)**
- Given a successfully submitted leave request
- When the request is saved in the system
- Then a notification should be sent to the designated approver (Requires clarification on who the approver is).

**AC 4: Overlapping Requests (Negative)**
- Given I have an existing pending or approved leave request for a specific date range
- When I try to apply for new leave on those same dates
- Then [Requires clarification: Should the system block this or allow it?]

## 4. Test Cases

| Test Case ID | Test Scenario | Preconditions | Test Steps | Expected Result | Type |
| --- | --- | --- | --- | --- | --- |
| TC01 | Submit valid leave request | User is logged in; has sufficient leave balance. | 1. Select 'Annual Leave'. 2. Select future dates. 3. Click Submit. | Request is stored; success message displayed. | Positive |
| TC02 | Submit with missing dates | User is on the application form. | 1. Select leave type. 2. Leave date fields empty. 3. Click Submit. | System displays validation error; request not sent. | Negative |
| TC03 | Past date application | User is on the application form. | 1. Select a date in the past. 2. Click Submit. | [Requires clarification: Is back-dating allowed?] | Negative |
| TC04 | Unauthorized Access | User is not logged in. | 1. Attempt to access the leave application URL directly. | User is redirected to login page. | Negative |

## 5. Clarification Questions

1. **Leave Types:** What specific types of leave are supported (e.g., Annual, Sick, Study, Unpaid)?
2. **Approval Workflow:** Who needs to approve the leave? Is it a single manager, or does it require HR oversight?
3. **Balance Constraints:** Should the system check if the employee has enough "Leave Balance" before allowing a submission?
4. **Attachments:** Is a medical certificate required for sick leave? If so, after how many days?
5. **Notifications:** Should the employee receive an email confirmation? Should the manager receive an email notification?
6. **Cancellations:** Should employees be able to edit or cancel a request after it has been submitted?
7. **Deadlines:** Are there rules about how far in advance a request must be made?

## 6. Requirement Quality Check & BA Review Notes

- **Clear:** No. The term "apply for leave online" is too broad.
- **Complete:** No. It lacks all business rules, data requirements, and workflow logic.
- **Specific:** No. It doesn't define the platform or the data needed.
- **Testable:** Partially. While we can test "submitting," we cannot test the validity of the submission without rules.
- **Unambiguous:** No. "Online" and "Leave" need further definition.
- **Feasible:** Yes, technically feasible.

**BA Review Notes:**
This requirement is currently a User Goal rather than a functional specification. To move this to "Ready for Development," we need to conduct a stakeholder interview to define the Leave Policy. The most critical missing piece is the Validation Logic (what makes a leave request valid or invalid?). I recommend creating a Process Map to visualize the approval flow.
