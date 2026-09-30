# Windows: use the prepared integration

This branch prepares repository rules. It has not changed your running installation.
Review and merge the fork change before bringing it into your Windows checkout.
Keep local uncommitted work and existing Claude settings intact.

From the repository directory in PowerShell:

```powershell
node scripts/dev/agent-os-inventory.mjs
```

The script reads `config/agent-os.json` and queries the local model catalog only.
It uses `ANTHROPIC_AUTH_TOKEN` from the current process when authentication is
required. Use your existing local credential handling; do not paste tokens into
chat, Git or the configuration file. A failed query changes no settings.

Inspect your enabled models and their account-specific free quotas in OmniRoute.
Only after verification, put their exact IDs in `verifiedFreeModels` and assign
IDs under `roles` in `config/agent-os.json`. A model listed by the catalog can still
fail authentication, quotas or tool calls. Test these locally before relying on it.
Do not publish account-specific model inventory if it contains private identifiers.

Open Claude Code in the project using your existing working launch configuration.
Give it this first task:

> Read AGENTS.md and run the Agent OS workflow. Inspect the local catalog, verify
> free eligibility from my configured provider accounts, and propose a role mapping.
> Preserve my current Claude configuration. Do not enable paid fallback or install
> another agent runtime. Report evidence and anything you cannot verify.

For later changes, Claude follows `skills/agent-os/workflow.md` and the role
checklists. Model-role assignments are declarative planning data; this integration
neither launches four agents nor automatically changes Claude's active model.
See `docs/guides/CLAUDE-CODE-CONFIGURATION.md` for existing model profiles.
