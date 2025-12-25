# Independent Developer Workflow

## Guiding Principles (Minimalist & Agile)

1.  **Thinking over Process:** Plan first in `plan.md`, then code.
2.  **Atomic Commits:** Commit often. Each task in `plan.md` = one commit.
3.  **No-Nonsense Testing:** Write tests only for complex logic (e.g., date calculation, recurrence rules). UI testing is manual.
4.  **User Experience First:** If it feels slow or ugly, it's a bug.

## Task Workflow

### Standard Task Workflow

1.  **Select Task:** Choose the next task from `plan.md`.
2.  **Mark In Progress:** Update `plan.md`: `[ ]` -> `[/]`.
3.  **Implement:** Write the code.
    *   *Self-Correction:* If the task is harder than expected, break it down in `plan.md`.
4.  **Verify (Manual/Auto):**
    *   **Logic:** Run unit tests if applicable.
    *   **UI:** Check in browser. Ensure it looks "Ethereal" and "Glassy".
5.  **Refactor (Optional):** Clean up before committing.
6.  **Commit Code Changes:**
    *   `git add .`
    *   `git commit -m "feat: <description>"`
7.  **Attach Task Summary (Git Notes):**
    *   *Why*: Keeps commit messages clean but preserves context.
    *   `git notes add -m "Task: <name>. Changes: <summary>."`
8.  **Update Plan:**
    *   Update `plan.md`: `[/]` -> `[x] <commit_hash>`.
    *   `git add conductor/tracks/`
    *   `git commit -m "conductor(plan): Complete task <name>"`

### Quality Gates (Simplified)

Before marking a task complete:
- [ ] Feature works as intended.
- [ ] No console errors.
- [ ] **Mobile Check**: Looks good on narrow screens.
- [ ] Code is clean and readable.

## Commit Guidelines

### Message Format
```
<type>(<scope>): <description>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `style`: Design/CSS changes
- `refactor`: Code cleanup
- `docs`: Documentation
- `chore`: Config/Deps

### Examples
- `feat(calendar): Add monthly view grid`
- `style(glass): Adjust backdrop-filter blur`
- `fix(date): Fix leap year calculation`

## Emergency Procedures
1.  **Backup**: Commit everything.
2.  **Rollback**: `git checkout <previous_hash>` if needed.
