# Engineering Spec: Design System & Workflow Modernization

## Technical Overview

This spec covers the implementation of automated design quality checks in CI, component auditing tools, and designer workflow enablement for AskElephant's design system modernization.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     CI/CD PIPELINE                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PR Opened → [Code Quality] → [Design Quality] → [Build] → ✅   │
│                    │                │                           │
│                    │                │                           │
│              ┌─────▼─────┐    ┌────▼────┐                      │
│              │  ESLint   │    │ Design  │                      │
│              │ Prettier  │    │ Checker │                      │
│              │ TypeScript│    │ Agent   │                      │
│              └───────────┘    └─────────┘                      │
│                                    │                           │
│                              ┌─────▼─────┐                     │
│                              │Red/Yellow/│                     │
│                              │  Green    │                     │
│                              └───────────┘                     │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Design Quality Check (CI Workflow)

**Purpose:** Automatically detect design violations in PRs

**Location:** `.github/workflows/design-quality.yml`

**Trigger:** PRs touching `web/src/components/**`

**Implementation:**

```yaml
name: Design Quality Check

on:
  pull_request:
    paths:
      - 'web/src/components/**'
      - 'web/src/app/**'
      - 'web/src/styles/**'

jobs:
  design-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run Design Quality Check
        run: npm run design:check -w web
        
      - name: Post Results
        uses: actions/github-script@v7
        with:
          script: |
            // Read results, post comment with Red/Yellow/Green status
```

### 2. Design Checker Script

**Purpose:** Analyze changed files for design violations

**Location:** `web/scripts/design-check.ts`

**Implementation:**

```typescript
// web/scripts/design-check.ts

import { glob } from 'glob';
import * as ts from 'typescript';
import * as fs from 'fs';

interface Violation {
  file: string;
  line: number;
  severity: 'red' | 'yellow' | 'green';
  rule: string;
  message: string;
  suggestion?: string;
}

const RULES = {
  // Red (blocking) violations
  hardcodedColors: {
    pattern: /(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/,
    severity: 'red' as const,
    message: 'Hardcoded color value detected',
    suggestion: 'Use semantic token (e.g., bg-primary, text-foreground)',
  },
  
  customButton: {
    pattern: /<button\s(?!.*Button)/,
    severity: 'red' as const,
    message: 'Raw <button> element detected',
    suggestion: 'Import and use <Button> from @/components/ui/button',
  },
  
  arbitrarySpacing: {
    pattern: /\[(\d+)px\]/,
    severity: 'red' as const,
    message: 'Arbitrary pixel value in className',
    suggestion: 'Use Tailwind spacing scale (p-4, m-2, gap-6)',
  },
  
  inlineStyles: {
    pattern: /style\s*=\s*\{\{/,
    severity: 'red' as const,
    message: 'Inline style object detected',
    suggestion: 'Use Tailwind classes or CSS variables',
  },
  
  // Yellow (warning) violations
  newComponent: {
    pattern: /export (const|function) [A-Z]/,
    severity: 'yellow' as const,
    message: 'New component detected - ensure it follows design system',
    suggestion: 'Consider if this should be added to ui/ library',
  },
  
  customShadow: {
    pattern: /shadow-\[/,
    severity: 'yellow' as const,
    message: 'Custom shadow value detected',
    suggestion: 'Use token shadow (shadow-sm, shadow-md, shadow-lg)',
  },
};

async function analyzeFile(filePath: string): Promise<Violation[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations: Violation[] = [];
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    Object.entries(RULES).forEach(([ruleName, rule]) => {
      if (rule.pattern.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          severity: rule.severity,
          rule: ruleName,
          message: rule.message,
          suggestion: rule.suggestion,
        });
      }
    });
  });
  
  return violations;
}

async function main() {
  const files = await glob('web/src/**/*.{tsx,ts}', {
    ignore: ['**/*.test.*', '**/*.stories.*', '**/node_modules/**'],
  });
  
  const allViolations: Violation[] = [];
  
  for (const file of files) {
    const violations = await analyzeFile(file);
    allViolations.push(...violations);
  }
  
  // Categorize results
  const red = allViolations.filter(v => v.severity === 'red');
  const yellow = allViolations.filter(v => v.severity === 'yellow');
  
  // Output results
  console.log(JSON.stringify({
    summary: {
      red: red.length,
      yellow: yellow.length,
      status: red.length > 0 ? 'failed' : yellow.length > 0 ? 'warning' : 'passed',
    },
    violations: allViolations,
  }, null, 2));
  
  // Exit with error if blocking violations
  if (red.length > 0) {
    process.exit(1);
  }
}

main();
```

### 3. Component Audit Tool

**Purpose:** Scan entire codebase and report design system compliance

**Location:** `web/scripts/component-audit.ts`

**Output:** `web/design-tokens/audit-report.json`

**Implementation:**

```typescript
// web/scripts/component-audit.ts

interface AuditResult {
  timestamp: string;
  summary: {
    totalComponents: number;
    compliant: number;
    nonCompliant: number;
    complianceRate: number;
  };
  byCategory: {
    colors: { compliant: number; violations: string[] };
    spacing: { compliant: number; violations: string[] };
    components: { compliant: number; violations: string[] };
    typography: { compliant: number; violations: string[] };
  };
  priorityFixes: Array<{
    file: string;
    severity: string;
    violations: number;
    impact: string;
  }>;
}

// Full audit implementation
async function runAudit(): Promise<AuditResult> {
  // Scan all component files
  // Analyze for compliance
  // Generate report
}
```

### 4. ESLint Custom Rules

**Purpose:** Catch violations at development time, not just CI

**Location:** `web/eslint-rules/design-system.js`

**Rules to implement:**
- `no-hardcoded-colors` — Disallow hex/rgb values in className
- `use-design-tokens` — Require token usage for spacing/colors
- `prefer-ui-components` — Warn when using raw HTML elements

**Example rule:**

```javascript
// web/eslint-rules/no-hardcoded-colors.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values in className',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name === 'className') {
          const value = node.value?.value || '';
          if (/#[0-9a-fA-F]{3,8}/.test(value)) {
            context.report({
              node,
              message: 'Use semantic color token instead of hardcoded value',
            });
          }
        }
      },
    };
  },
};
```

---

## Data Model Changes

### New: Audit Report Schema

**File:** `web/design-tokens/audit-report.json`

```json
{
  "timestamp": "2026-01-22T00:00:00Z",
  "summary": {
    "totalFiles": 450,
    "compliantFiles": 315,
    "complianceRate": 0.70
  },
  "violations": [
    {
      "file": "src/components/billing/BillingPage.tsx",
      "line": 45,
      "rule": "hardcodedColors",
      "severity": "red",
      "value": "#5B5FC7",
      "suggestion": "bg-primary"
    }
  ],
  "trends": [
    { "date": "2026-01-15", "complianceRate": 0.65 },
    { "date": "2026-01-22", "complianceRate": 0.70 }
  ]
}
```

---

## API Changes

None — this is tooling infrastructure, not user-facing APIs.

---

## Frontend Components

### Design Checker Output Component

**Purpose:** Display design check results in PR comments

**Format:**

```markdown
## 🎨 Design Quality Check

### Summary
- 🔴 **2 blocking issues** (must fix)
- 🟡 **3 warnings** (review recommended)

### Blocking Issues

| File | Line | Issue | Suggestion |
|------|------|-------|------------|
| `BillingPage.tsx` | 45 | Hardcoded color `#5B5FC7` | Use `bg-primary` |
| `CustomButton.tsx` | 12 | Raw `<button>` element | Use `<Button>` from ui/ |

### Warnings

| File | Line | Issue |
|------|------|-------|
| `NewWidget.tsx` | 1 | New component - review with design |

---
*Fix blocking issues to merge. Warnings require design review.*
```

---

## Backend Services

None — this is frontend tooling only.

---

## Dependencies

### New Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `typescript` | AST parsing | (existing) |
| `glob` | File pattern matching | (existing) |
| `@actions/github` | PR commenting | CI only |

### Existing Dependencies (leveraged)

- `eslint` — Custom rule infrastructure
- `@typescript-eslint/parser` — TypeScript AST
- `tailwindcss` — Class validation

---

## Migration Strategy

### Phase 1: Audit & Baseline (Week 1-2)

1. Run full audit script on current codebase
2. Generate baseline compliance report
3. Identify top 10 files for remediation
4. Share report with team

### Phase 2: Warnings Only (Week 3-4)

1. Deploy CI workflow with warnings only (non-blocking)
2. Engineers see violations but PRs aren't blocked
3. Gather feedback on false positives
4. Tune rules based on real-world usage

### Phase 3: Enforcement (Week 5+)

1. Enable blocking for red violations
2. Require design review for yellow violations
3. Track compliance trend over time
4. Begin legacy remediation sprints

### Rollback Plan

- Remove workflow file to disable checks
- ESLint rules can be set to "warn" instead of "error"
- No database changes to rollback

---

## Testing Strategy

### Unit Tests

```typescript
// web/scripts/__tests__/design-check.test.ts

describe('Design Checker', () => {
  it('detects hardcoded color in className', () => {
    const code = `<div className="bg-[#5B5FC7]">`;
    const violations = analyze(code);
    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: 'hardcodedColors',
        severity: 'red',
      })
    );
  });
  
  it('allows semantic color tokens', () => {
    const code = `<div className="bg-primary">`;
    const violations = analyze(code);
    expect(violations).toHaveLength(0);
  });
  
  it('detects raw button elements', () => {
    const code = `<button onClick={handleClick}>Submit</button>`;
    const violations = analyze(code);
    expect(violations).toContainEqual(
      expect.objectContaining({
        rule: 'customButton',
        severity: 'red',
      })
    );
  });
});
```

### Integration Tests

- Run checker on known-good files → should pass
- Run checker on known-bad files → should fail
- Verify CI workflow posts comments correctly

### Manual Testing

- Create PR with intentional violations
- Verify check catches them
- Verify suggestions are helpful

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **False positives** | High | Engineer frustration | Start with warnings, tune before blocking |
| **Check too slow** | Medium | CI bottleneck | Only check changed files |
| **Overly strict** | Medium | Legitimate exceptions blocked | Allow `// design-check-ignore` comments |
| **Under-maintained** | Low | Rules become stale | Owner (Tyler) reviews monthly |

### Exception Handling

Allow engineers to bypass specific checks with documented rationale:

```typescript
// design-check-ignore: Using custom color for brand logo
<img className="bg-[#FF5500]" src="..." />
```

CI will log ignores for later review.

---

## Monitoring & Observability

### Metrics to Track

1. **Compliance rate over time** — Trending up?
2. **Violations per PR** — Decreasing?
3. **Check duration** — Under 2 minutes?
4. **False positive rate** — Under 5%?

### Dashboard (Future)

Potential Storybook addon or standalone page showing:
- Current compliance rate
- Trend chart
- Top violating files
- Recent remediation wins

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `web/scripts/design-check.ts`
- [ ] Create `web/scripts/component-audit.ts`
- [ ] Add npm scripts to package.json
- [ ] Write unit tests

### Phase 2: CI Integration
- [ ] Create `.github/workflows/design-quality.yml`
- [ ] Configure PR comment action
- [ ] Test on feature branch
- [ ] Enable warnings-only mode

### Phase 3: ESLint Rules
- [ ] Create `web/eslint-rules/` directory
- [ ] Implement `no-hardcoded-colors` rule
- [ ] Implement `prefer-ui-components` rule
- [ ] Add to eslint config

### Phase 4: Enforcement
- [ ] Enable blocking mode
- [ ] Configure CODEOWNERS for design review
- [ ] Document exception process
- [ ] Train team on new workflow

---

## Open Technical Questions

1. **AST vs Regex?** — Should we use full TypeScript AST parsing or regex patterns?
   - AST: More accurate, slower, complex
   - Regex: Faster, simpler, more false positives

2. **Changed files only vs full scan?** — CI should check only changed files, but audit should be full

3. **Storybook integration?** — Should violations show in Storybook? (probably yes, later)

4. **Chromatic integration?** — Can we use visual diff to catch styling issues? (research needed)

---

## References

- Existing token system: `web/design-tokens/README.md`
- shadcn/ui components: `web/src/components/ui/`
- ESLint plugin docs: https://eslint.org/docs/latest/extend/plugins
- GitHub Actions: https://docs.github.com/en/actions
