# Mandatory task workflow

1. State goal, scope, requirements and uncertainties.
2. Read relevant `product/` documents.
3. Read relevant `specs/` documents.
4. Resolve all applicable standards through `standards/index.yml`, then read their
   authoritative sources and the nearest `AGENTS.md`.
5. Check rule conflicts and dependencies; report unresolved conflicts.
6. Plan focused changes using the repository's worktree and artifact conventions.
7. Implement as coder; inspect the diff as reviewer.
8. Verify as tester using the required checks. Record failures and unrun checks.
9. Report results, open decisions and every deviation from standards.

Use `agents/architect/role.md`, `agents/coder/role.md`, `agents/reviewer/role.md`,
and `agents/tester/role.md` as responsibility checklists. The same session can
perform all roles sequentially. Additional agents are optional and require an
explicit task instruction. Roles grant no extra filesystem or network authority.
