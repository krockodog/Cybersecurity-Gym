# Orchestration Workflow — Mandatory Operating Procedure

> **Applies to:** All work on trygit.me
> **Last updated:** 2026-05-26

## 1. Plan Node (Default Mode)

**Trigger:** ANY non-trivial task (3+ steps or architectural decisions)

**Procedure:**
- Write detailed plan to `tasks/todo.md` before touching code
- Include verification steps in the plan, not just build steps
- If something goes sideways during execution: **STOP immediately**, re-plan, then resume
- Reduce ambiguity by writing specs upfront

**Checklist before starting:**
- [ ] Plan written to `tasks/todo.md`
- [ ] Plan reviewed for completeness
- [ ] Verification steps defined
- [ ] User confirmation received (if plan changes scope)

## 2. Subagent Strategy

**Principle:** Keep main context window clean — offload to subagents liberally

**When to use subagents:**
- Research and exploration tasks
- Parallel analysis (e.g., review + fix simultaneously)
- Complex problems that benefit from focused compute
- One tack per subagent for focused execution

**Rules:**
- Main agent: plans, decides, integrates, verifies
- Subagents: execute, research, explore, analyze
- Never do research + writing in the same subagent
- Parallel subagents for independent tasks (zero speed cost)
- Fiction review: always parallel with next writer

## 3. Self-Improvement Loop

**Trigger:** After ANY correction from the user

**Procedure:**
1. Immediately update `tasks/lessons.md` with the pattern
2. Write a rule that prevents the same mistake
3. Ruthlessly iterate on these lessons
4. Review `tasks/lessons.md` at session start

**Format for lessons.md:**
```markdown
## YYYY-MM-DD — [Category]
**Mistake:** What went wrong
**Root cause:** Why it happened
**Rule:** Concrete rule to prevent recurrence
**Affected files:** Which files were involved
```

## 4. Verification Before Done

**Mandatory:** Never mark a task complete without proving it works

**Verification checklist:**
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No TypeScript errors (check `tsc -b`)
- [ ] No runtime errors in console
- [ ] Diff behavior: compare before/after changes
- [ ] Ask: "Would a staff engineer approve this?"
- [ ] Run tests if available, check logs
- [ ] Deploy and verify on live URL

**Staff engineer standard:**
- Is the change minimal and focused?
- Does it follow existing patterns?
- Are edge cases handled?
- Is it maintainable?

## 5. Demand Elegance (Balanced)

**Trigger:** Non-trivial changes

**Procedure:**
- Pause and ask: "Is there a more elegant way?"
- If a fix feels hacky: re-implement with the elegant solution
- Challenge your own work before presenting it

**Exception:** Skip for simple, obvious fixes — don't over-engineer

**Elegance criteria:**
- Minimal code touched
- Follows existing patterns
- No temporary/hacky solutions
- Root cause fixed, not symptom

## 6. Autonomous Bug Fixing

**Principle:** Just fix it. Don't ask for hand-holding.

**Procedure:**
1. Point at logs, errors, failing tests
2. Identify root cause
3. Resolve the issue
4. Verify the fix

**Zero context switching required from user:**
- Go fix failing CI tests without being told how
- Fix TypeScript errors on sight
- Handle build failures autonomously
- Resolve merge conflicts independently

## Task Management Protocol

| Phase | Action | Output |
|-------|--------|--------|
| **Plan** | Write plan to `tasks/todo.md` | Checkable task list |
| **Verify Plan** | Review with user before implementation | Confirmed plan |
| **Execute** | Work through tasks | Code changes |
| **Track** | Mark items complete as you go | Updated todo.md |
| **Explain** | High-level summary at each step | User communication |
| **Document** | Add review section to tasks/todo.md | Post-mortem |
| **Capture** | Update tasks/lessons.md after corrections | Learned patterns |

## Core Principles

### Simplicity First
Make every change as simple as possible. Impact minimal code. Prefer the straightforward solution over the clever one.

### No Laziness
Find root causes. No temporary fixes. No "good enough for now." Senior developer standards always.

### Minimal Impact
Changes should only touch what's necessary. Avoid introducing bugs. One change = one concern.

## Session Start Checklist

At the start of every session working on trygit.me:
1. Read `tasks/lessons.md` — review past mistakes
2. Read `tasks/todo.md` — check current state
3. Read relevant reference files from the skill
4. Load the skill: `trygit-me-skill`
5. Follow this workflow for all subsequent work
