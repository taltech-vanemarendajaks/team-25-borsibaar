# HANDIN.md

This document is created according to **Homework: Team Workflow with Git & GitHub**.

---

## Pull Requests

Below are links to all pull requests created in the team repository, together with a short explanation of what was done in each.

### PR #29 – docs: Add Börsibaar 2.0 SoW (draft)
https://github.com/taltech-vanemarendajaks/team-25-borsibaar/pull/29

**Author:** tomimarkus991  
**Description:**  
Added a Statement of Work (SoW) document defining Börsibaar 2.0 as a SaaS product. The document describes the project vision, business value, context, scope, team roles, and future development steps.

---

### PR #27 – feat: adjust drink price manually (draft)
https://github.com/taltech-vanemarendajaks/team-25-borsibaar/pull/27

**Author:** hannesverlis  
**Description:**  
Implemented a feature allowing bar managers to manually adjust drink prices.  
Changes include backend API logic, frontend UI elements, validation rules, and logging of price change transactions. The pull request is marked as draft because final integration and testing are still ongoing.

---

### PR #25 – feat: input validation
https://github.com/taltech-vanemarendajaks/team-25-borsibaar/pull/25

**Author:** taavitaht  
**Description:**  
Improved frontend input validation for inventory management. Prevents invalid numeric inputs, enforces correct min/max price logic, disables submission when inputs are invalid, and provides visual feedback to the user.

---

### PR #24 – feat: add OpenAPI-generated TypeScript API
https://github.com/taltech-vanemarendajaks/team-25-borsibaar/pull/24

**Author:** jsidla  
**Description:**  
Added OpenAPI-based TypeScript code generation to the frontend. Generated API clients and DTOs ensure frontend-backend type consistency and reduce manual duplication. README documentation was updated to describe the workflow.

---

### PR #20 – docs: add team workflow documentation
https://github.com/taltech-vanemarendajaks/team-25-borsibaar/pull/20

**Author:** hannesverlis  
**Description:**  
Created `TEAM.md`, describing the team structure, responsibilities, and Git workflow. The pull request went through review and revision to align with homework requirements.

---

## Conflict Explanation and Resolution

As required by the homework, a conflict situation occurred when **multiple contributors modified overlapping parts of frontend files** during parallel development.


### Conflict Resolution

- Created 2 branches that modified this line in this text document. 
- Pushed both versions, resulting in a merge conflict. Resolved conflict.

---

## Team Member Contributions

### Tomi (tomimarkus991)
- Created the Statement of Work documentation (PR #29)
- Actively reviewed pull requests and provided technical feedback
- Guided commit structure, styling conventions, and documentation practices

### Hannes (hannesverlis)
- Implemented the manual drink price adjustment feature (PR #27)
- Created team workflow documentation (PR #20)
- Participated in code reviews and discussions

### Taavi (taavitaht)
- Implemented frontend input validation and user feedback (PR #25)
- Improved form robustness and prevented invalid data submission

### Ingrid (IngridLepik)
- Participated in reviews and coordination
- Contributed to testing, planning, and feedback during development

### Johanna-Stina (jsidla)
- Implemented OpenAPI-based TypeScript API generation (PR #24)
- Improved frontend-backend integration workflow
- Reduced long-term maintenance effort by removing manual DTO duplication

