# AI Business Analyst Assistant

## 1. Project Overview

The AI Business Analyst Assistant is an AI-powered content generation tool designed to assist Business Analysts with common requirements and documentation activities.

Business Analysts often work with information gathered from stakeholders, meetings, emails, and business processes. This information must be transformed into structured documentation such as user stories, acceptance criteria, test cases, and stakeholder clarification questions.

The purpose of this project is to explore how generative AI and prompt engineering can assist with this process while keeping the Business Analyst responsible for reviewing, validating, and refining the generated outputs.

---

## 2. Problem Statement

Business analysis involves transforming business needs and stakeholder requirements into clear and structured documentation.

However, requirements are not always presented in a structured format. A stakeholder may provide a short statement such as:

> "We need employees to be able to apply for leave online."

A Business Analyst may need to determine:

* Who is the user?
* What exactly should the system allow the user to do?
* What information is required?
* What happens after submission?
* Who approves the request?
* What happens if information is missing?
* What are the possible negative scenarios?

These questions must then be translated into appropriate BA documentation.

The repetitive nature of creating this documentation provides an opportunity to investigate how generative AI can assist Business Analysts.

---

## 3. Project Objective

The objective of this project is to develop an AI-assisted workflow that can transform raw requirements into structured Business Analysis outputs.

The project will investigate whether carefully designed prompts can produce more consistent and useful outputs than simple, general instructions.

The main question guiding the project is:

**"How can prompt engineering be used to create an AI assistant that helps Business Analysts transform raw requirements into structured documentation?"**

---

## 4. Proposed Solution

The proposed solution is an AI Business Analyst Assistant that accepts a business requirement as input and generates different types of BA content.

The assistant will provide several functions:

### User Story Generator

Transforms a requirement into a structured user story using:

**As a [user], I want [function], so that [benefit].**

### Acceptance Criteria Generator

Converts a user story into acceptance criteria using a structured format such as:

**Given → When → Then**

Both positive and negative scenarios can be considered.

### Test Case Generator

Uses the requirement and acceptance criteria to generate structured test cases.

### Requirement Analysis

Analyses a requirement and identifies potential:

* Missing information
* Ambiguities
* Assumptions
* Areas requiring clarification

### Stakeholder Question Generator

Generates questions that a Business Analyst can ask stakeholders to clarify incomplete requirements.

---

## 5. Target Users

The primary target user is a Business Analyst.

The concept could also be useful for:

* Junior Business Analysts
* Business Analysis interns
* Product owners
* Project teams
* QA/test teams
* Developers who need clearer requirements

The tool is intended to support these users rather than replace their decision-making or validation responsibilities.

---

## 6. Prompt Engineering Approach

Prompt engineering is a central part of this project.

Instead of creating one generic prompt, the assistant will use a library of specialized prompts for different BA activities.

Each prompt will be tested and refined based on the quality and consistency of its output.

The prompts will consider elements such as:

* Role
* Context
* Task
* Constraints
* Output format
* Required information
* Instructions for handling missing information

For example, an initial prompt might be:

> "Convert this requirement into a user story."

The output can then be evaluated.

If the AI produces a vague user story or makes assumptions, the prompt can be refined to provide additional instructions.

A more detailed prompt could instruct the AI to:

* Act as a Business Analyst
* Use a specific user-story format
* Avoid unsupported assumptions
* Identify missing information
* Produce structured output
* Ask clarification questions where necessary

The process therefore becomes:

**Prompt → Test → Evaluate → Refine → Test Again → Final Prompt**

---

## 7. Prompt Library

The project will contain a reusable prompt library.

Example categories include:

### Requirements

* Requirement analysis prompt
* Requirement clarification prompt
* Ambiguity detection prompt

### User Stories

* User story generation prompt
* User story refinement prompt

### Acceptance Criteria

* Acceptance criteria generation prompt
* Positive and negative scenario prompt

### Testing

* Test case generation prompt
* Negative test scenario prompt

### Stakeholder Communication

* Requirement clarification email prompt
* Stakeholder question generation prompt
* Meeting summary prompt

The prompt library will allow the same workflows to be reused rather than creating a new prompt from scratch each time.

---

## 8. Example Use Case

A stakeholder provides the following requirement:

> "Employees should be able to apply for leave online."

The Business Analyst enters the requirement into the AI Assistant.

The assistant could generate:

### User Story

**As an employee, I want to submit a leave application online so that I can request leave digitally.**

### Acceptance Criteria

**Scenario 1 — Successful submission**

Given an employee is logged into the system
When the employee submits a valid leave request
Then the system should record the leave request.

**Scenario 2 — Missing information**

Given an employee has not provided all required information
When the employee submits the request
Then the system should display a validation message.

### Stakeholder Questions

The assistant could also identify questions such as:

1. What types of leave should employees be able to request?
2. Who approves the leave request?
3. What information is required?
4. Can employees cancel submitted requests?
5. What happens when an employee has insufficient leave balance?

The Business Analyst would then review these outputs and determine which are appropriate for the actual project.

---

## 9. Testing and Prompt Optimization

The project will demonstrate prompt optimization by comparing different versions of prompts.

### Version 1

A simple prompt is used to generate a user story.

The output is evaluated for:

* Structure
* Relevance
* Completeness
* Accuracy
* Unnecessary assumptions

### Version 2

Additional context and formatting requirements are introduced.

The output is tested again.

### Version 3

Further constraints are introduced based on the previous results.

The final prompt is then documented in the prompt library.

This creates a clear record of how the prompt evolved.

The case study will therefore demonstrate not only the final AI output but also the **reasoning and experimentation behind the prompt design**.

---

## 10. Human Validation

The AI-generated content will not automatically become final project documentation.

The proposed workflow is:

**Requirement → AI Assistant → Generated Output → BA Review → Validation → Final Documentation**

The Business Analyst remains responsible for determining whether the generated information accurately represents the business requirement.

This is important because AI may generate information that is incomplete, incorrect, or based on assumptions that were not provided.

---

## 11. Expected Benefits

The proposed assistant could help:

* Reduce repetitive documentation work
* Provide structured starting points for BA deliverables
* Generate clarification questions
* Improve consistency across documentation
* Provide reusable prompt templates
* Support junior Business Analysts during documentation activities
* Demonstrate practical use of generative AI in Business Analysis

The project will focus on **assistance and productivity**, rather than treating AI-generated content as automatically correct.

---

## 12. Project Deliverables

The project will produce:

1. **AI Business Analyst Assistant**
2. **Prompt Library**
3. **Example generated BA outputs**
4. **Prompt optimization experiments**
5. **Prompt Engineering Case Study**
6. **Project documentation**
7. **GitHub repository**
8. **Portfolio project page**

These deliverables align with the Week 2 requirement for an individual content-generation project, a prompt library, demonstrated prompt optimization, and a published individual project.

---

## 13. Conclusion

The AI Business Analyst Assistant explores how generative AI can be applied to a practical Business Analysis problem: transforming unstructured requirements into structured documentation.

The project combines existing Business Analysis practices with prompt engineering to create a reusable AI-assisted workflow.

Rather than focusing only on the final AI-generated content, the project documents the process of designing, testing, evaluating, and refining prompts.

The final result will demonstrate how AI can be incorporated into a Business Analyst's workflow while maintaining human review and validation.
