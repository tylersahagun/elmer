# Tech Stack

> **⚠️ TEMPLATE** - Update this to reflect your product's tech stack.
>
> This helps the AI understand your codebase conventions for prototyping and placement decisions.

---

## Frontend

### Framework
- **Primary:** [React / Vue / Angular / etc.]
- **Version:** [Version number]
- **Rendering:** [CSR / SSR / SSG]

### Language
- **Primary:** [TypeScript / JavaScript]
- **Strict Mode:** [Yes / No]

### Styling
- **Approach:** [Tailwind CSS / CSS Modules / Styled Components / etc.]
- **Design System:** [shadcn/ui / Material UI / Custom / etc.]

### State Management
- **Client State:** [React Query / Zustand / Redux / etc.]
- **Server State:** [Apollo / React Query / SWR / etc.]

### Build & Bundling
- **Bundler:** [Vite / Webpack / etc.]
- **Package Manager:** [npm / pnpm / yarn]

---

## Backend (if applicable)

### Runtime
- **Primary:** [Node.js / Python / Go / etc.]
- **Framework:** [Express / FastAPI / etc.]

### Database
- **Primary:** [PostgreSQL / MongoDB / etc.]
- **ORM:** [Prisma / Drizzle / etc.]

### API
- **Style:** [REST / GraphQL / tRPC]
- **Documentation:** [OpenAPI / GraphQL Schema]

---

## Infrastructure (if applicable)

### Hosting
- **Frontend:** [Vercel / Netlify / etc.]
- **Backend:** [AWS / GCP / etc.]
- **Database:** [Managed / Self-hosted]

### CI/CD
- **Platform:** [GitHub Actions / GitLab CI / etc.]
- **Deploy Strategy:** [Preview deploys / Staging / etc.]

---

## Development Tools

### Code Quality
- **Linter:** [ESLint / Biome / etc.]
- **Formatter:** [Prettier / Biome / etc.]
- **Type Checking:** [TypeScript / Flow / none]

### Testing
- **Unit:** [Jest / Vitest / etc.]
- **E2E:** [Playwright / Cypress / etc.]
- **Visual:** [Chromatic / Percy / etc.]

### Documentation
- **Components:** [Storybook]
- **API:** [Swagger / GraphQL Playground]

---

## Prototyping Conventions

When building prototypes, follow these conventions:

### Component Structure
```
[ComponentName]/
├── [ComponentName].tsx
├── [ComponentName].stories.tsx
├── types.ts
└── index.ts
```

### Imports
```typescript
// UI Components
import { Button } from '@/components/ui/button';

// Types
import type { ComponentProps } from './types';

// Utils
import { cn } from '@/lib/utils';
```

### Naming
- **Components:** PascalCase (`UserProfile.tsx`)
- **Files:** kebab-case or PascalCase (match repo convention)
- **Props:** camelCase (`isLoading`, `onSubmit`)

---

## Key Dependencies

| Category | Package | Version | Purpose |
|----------|---------|---------|---------|
| UI | [package] | [version] | [purpose] |
| Forms | [package] | [version] | [purpose] |
| Data | [package] | [version] | [purpose] |
| Utils | [package] | [version] | [purpose] |

---

## Repository Structure

```
[repo-name]/
├── src/
│   ├── components/       # UI Components
│   │   ├── ui/          # Primitives
│   │   └── [domain]/    # Feature components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   ├── pages/           # Page components (if applicable)
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json
```

---

## Notes for Prototyping

<!--
Add any specific conventions or gotchas for your codebase
-->

- [Convention 1]
- [Convention 2]
- [Gotcha to avoid]
