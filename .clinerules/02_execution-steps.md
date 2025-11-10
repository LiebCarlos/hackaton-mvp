---
title: Backoffice
description: Migration steps for the backoffice tool
---

<Steps>

# Backoffice Migration Plan (Yarn/Fastify v5 Stack)

This plan details the migration of the backoffice tool to a Vite + React + TypeScript frontend, adhering to the specified project versions.

## Phase 1: Project Scaffolding and Setup (Yarn)

-   [ ] Create a new directory named `backoffice` at the repository root.
-   [ ] Initialize a new Vite project with the `react-ts` template inside the `/backoffice` directory.
-   [ ] Run `yarn install` within the `/backoffice` directory to install dependencies using `yarn@1.22.22`.
-   [ ] Initialize TailwindCSS for the Vite project.
-   [ ] Initialize ShadCN:
    -   [ ] `yarn dlx shadcn-ui@latest init`
-   [ ] Add the required ShadCN components:
    -   [ ] `yarn dlx shadcn-ui@latest add tabs`
    -   [ ] `yarn dlx shadcn-ui@latest add textarea`
    -   [ ] `yarn dlx shadcn-ui@latest add button`
    -   [ ] `yarn dlx shadcn-ui@latest add label`
-   [ ] **Verification Step:** Open `backoffice/package.json` and manually verify that the installed dependency versions match the required stack (e.g., `tailwindcss: "4.1.16"`). Adjust versions and run `yarn install` again if needed.

## Phase 2: UI Structure and Component Migration

(This phase is stack-agnostic and remains unchanged.)

-   [ ] Clean up the default `App.tsx` file (which will be compiled by `typescript@5.8.3`).
-   [ ] Implement the main layout using the ShadCN `<Tabs>` component (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).
-   [ ] Create two `<TabsTrigger>` elements for "X12 270 Generator" and "X12 271 Parser".
-   [ ] Populate the "X12 270 Generator" `<TabsContent>`:
    -   [ ] Add three `<Textarea>` components (API Input, Intermediate Data, X12 270 Output).
    -   [ ] Add `<Label>` components for each textarea.
    -   [ ] Add `<Button>` for "Generate X12 270".
    -   [ ] Add `<Button>` (e.g., `variant="outline"`) for "Load Sample".
    -   [ ] Add `<Button>` (e.g., `variant="ghost"`) for "Copy to Clipboard".
-   [ ] Populate the "X12 271 Parser" `<TabsContent>`:
    -   [ ] Add three `<Textarea>` components (X12 271 Response, Parsed Data, API Output JSON).
    -   [ ] Add `<Label>` components for each textarea.
    -   [ ] Add `<Button>` for "Parse X12 271".
    -   [ ] Add `<Button>` (e.g., `variant="outline"`) for "Load Sample".
    -   [ ] Add `<Button>` (e.g., `variant="ghost"`) for "Copy to Clipboard".

## Phase 3: Client-Side Logic Re-implementation

(This phase is stack-agnostic and remains unchanged.)

-   [ ] In `App.tsx`, use React `useState` hooks to manage the state for all six text areas.
-   [ ] Implement the `handleGenerate270` async function using `fetch` to `POST` to `/api/backoffice/generate-270` and update state from the response.
-   [ ] Implement the `handleParse271` async function using `fetch` to `POST` to `/api/backoffice/parse-271` and update state from the response.
-   [ ] Implement "Load Sample" button logic.
-   [ ] Implement "Copy to Clipboard" button logic.

## Phase 4: Build and Server Integration (Yarn / Fastify v5)

-   [ ] Update `backoffice/vite.config.ts` to set the `base` property to `'/backoffice/'` for correct sub-route asset pathing.
-   [ ] Open the **root** `package.json` file.
-   [ ] Enhance the `scripts` section to use `yarn`:
    -   [ ] `"install:backoffice": "cd backoffice && yarn install"`
    -   [ ] `"build:backoffice": "cd backoffice && yarn build"`
    -   [ ] `"dev:backoffice": "cd backoffice && yarn dev"`
-   [ ] Update the main `Fastify v5.4.0` server file (e.g., `server.ts`):
    -   [ ] Remove the old route handler that served the static `backoffice.html` file.
    -   [ ] Ensure `@fastify/static` is registered.
    -   [ ] Configure `@fastify/static` to serve the built frontend assets:
        -   `root`: `path.join(__dirname, '..', 'backoffice', 'dist')`
        -   `prefix`: `'/backoffice/'`
        -   `wildcard`: `false`
    -   [ ] Add a fallback route handler for `GET /backoffice` and `GET /backoffice/*` to serve `backoffice/dist/index.html` (for client-side routing).
-   [ ] Verify that the Joi-validated API routes (`/api/backoffice/*`) are registered *before* the static file fallback.

## Phase 5: Cleanup

-   [ ] Delete the original `backoffice.html` file.
-   [ ] Run the server (e.g., `yarn start:local`) and test all functionality at `http://localhost:3001/backoffice`.

</Steps>