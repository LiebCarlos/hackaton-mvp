**Subject:** Execute Backoffice Migration to ShadCN

**Instructions:**
1.  **Strictly adhere** to all guidelines and technical specifications found in:
    * `00_project-guidelines.md`
    * `00_techonology-stack.md`
    * `01_shadcn-vite-tutorial.md` (for project scaffolding and setup)
2.  **Execute the migration** tasks in order, as defined in `02_execution-steps.md`.
3.  **Mandatory Progress Tracking:** For every task completed in `02_execution-steps.md`, update the file immediately by changing the corresponding item from `[ ]` to `[x]`. This file must accurately reflect the current progress state.
4.  **Project Location:** The new frontend project must be created in a new `/backoffice` directory at the repository root.
5.  **Build Configuration:** Enhance the **root** `package.json` file to integrate the new `yarn` scripts (`install:backoffice`, `build:backoffice`, `dev:backoffice`).
6.  **Server Update:** Update the Fastify server configuration to remove the old HTML handler and serve the built static assets from `/backoffice/dist` at the `/backoffice` route.
7.  **Tool Call:** Include the `task_progress` parameter in the next tool call, providing the current state of `02_execution-steps.md`.