# TypeScript TypeCheck Guide

## Quick Start

Run the typecheck script to verify all web examples:

```bash
npm run typecheck
# or
./typecheck-web-examples.sh
```

## What It Does

The script will:

- 🔍 Find all TypeScript projects in the `web/` directory
- ✅ Run `tsc --noEmit` on each project
- 📊 Provide a comprehensive summary with pass/fail counts
- 🎨 Show color-coded output for easy reading

## Example Output

```
========================================
🔍 TypeChecking All Web Examples
========================================

📦 Checking: web/annotation/comment-annotations
✅ PASSED

📦 Checking: web/signing/signing-demo-complete
✅ PASSED

========================================
📊 TypeCheck Summary
========================================
Total projects checked: 17
Passed: 17
Failed: 0

🎉 All projects passed TypeCheck!
```

## Projects Checked

The script automatically checks all projects with `tsconfig.json`:

### Annotation Examples

- comment-annotations
- comments-status
- create-annotation-from-clipboard
- customise-annotation-sidebar
- get-all-annotations-boundingBox
- redact-one-by-one
- snipping-annotation
- speech-2-text
- text-2-speech

### Document Editor

- save-selected-page-from-document-editor

### Document Generator

- document-generator-vanillajs

### Miscellaneous

- mixpanel-web-analytics

### Signing

- clientside-digital-sigature
- sign-here-upgraded
- signing-demo-complete

### Viewer

- multi-tab

## Troubleshooting

If a project fails:

1. **Navigate to the failing project:**

   ```bash
   cd web/path/to/failing/project
   ```

2. **Run typecheck manually to see detailed errors:**

   ```bash
   npx tsc --noEmit
   ```

3. **Common issues:**
   - Missing type definitions: Install `@types/*` packages
   - Incorrect imports: Check import paths and module resolution
   - `any` types: Replace with proper types
   - Strict mode issues: Update `tsconfig.json` or fix type errors

## TypeScript Configuration

All projects use strict TypeScript configurations with:

- `strict: true` - All strict type checking options enabled
- `noImplicitAny: true` - No implicit `any` types
- `strictNullChecks: true` - Strict null checking
- `esModuleInterop: true` - Better ES module compatibility

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: TypeCheck Web Examples
  run: npm run typecheck
```

## Development Workflow

### Before Committing

```bash
# Check all projects
npm run typecheck

# Or check a specific project
cd web/annotation/comment-annotations
npx tsc --noEmit
```

### Adding New Examples

When creating a new TypeScript example:

1. ✅ Add a `tsconfig.json`
2. ✅ Use proper types (no `any`)
3. ✅ Run `npm run typecheck` to verify
4. ✅ The script will automatically find and check it

## Performance

The script checks all projects in **parallel-like fashion** and typically completes in:

- **~30-60 seconds** for all 17 projects
- Depends on project size and complexity

## Exit Codes

- `0` - All projects passed ✅
- `1` - One or more projects failed ❌
