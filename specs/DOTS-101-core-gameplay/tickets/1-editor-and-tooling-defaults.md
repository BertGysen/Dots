# Add shared editor and tooling settings to the repository

**Came up in:** verify (`specs/DOTS-101-core-gameplay/verify.md`, changed files not linked to an AC: `.editorconfig`, `.prettierrc`, `.vscode/extensions.json`, `.vscode/launch.json`, `.vscode/mcp.json`, `.vscode/tasks.json`, `README.md`)

<!-- Drafted by the IE Kit because the request is outside the current spec. A human files it; the kit never does. -->

## Request (in the user's words)

The Angular CLI (`ng new`) generated editor and tooling defaults together with the app: an
EditorConfig, a Prettier config, VS Code workspace files (recommended extensions, debug launch,
build/test tasks, the Angular CLI MCP server) and the CLI's default README. None of them is
needed for the DOTS-101 gameplay. Decide whether the project wants these as shared settings.

## Suggested acceptance criteria

- The repository has an `.editorconfig` and a Prettier config that match the team's formatting conventions.
- Opening the repo in VS Code recommends the Angular extensions, and `F5` starts the app with the debugger attached.
- `README.md` explains how to install, run (`npm start`) and test (`npm test`) the game.
