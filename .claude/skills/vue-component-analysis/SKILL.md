---
name: vue-component-analysis
description: Analyze the structure of a Vue 3 component in this project and suggest optimizations for performance and code reuse. Use this skill when asked to review, audit, optimize or refactor a .vue file in client/src.
---

# Vue Component Analysis

Analyze one or more Vue components in `client/src` and report concrete, prioritized
improvements for performance and code reuse. This skill only analyzes and suggests:
it never edits files unless the user asks for the fixes afterwards.

The reference for what "good" means in this project is `client/CLAUDE.md`. Read it first.

## Workflow

1. **Locate the target.** If the user names a file, use it. Otherwise ask which
   component or view to analyze. For a whole directory, start with the largest files.
2. **Read the component fully**, then read how it is used: its parent, its props and
   emitted events, and the composables it imports (`client/src/composables`).
3. **Compare with a healthy sibling.** Pick one comparable view or component
   (for example `views/Orders.vue` or `views/Dashboard.vue`) and note where the target
   deviates from the shared patterns.
4. **Run the checklist below** and collect findings. Only report what you actually
   found in the code, with file and line numbers.
5. **Report** in the format at the end. Rank by impact, not by order of discovery.

## Checklist

### Structure
- Composition API with `setup()` and `ref`/`computed`/`watch`/`onMounted`. Flag Options API
  or mixing both styles.
- Template longer than about 100 lines or logic longer than about 150 lines: suggest
  extracting a component. Name the exact block to extract and the props it would need.
- Props declared with types and defaults. Props never mutated, events emitted instead.
- Everything used in the template is returned from `setup()`; nothing returned is unused.

### Performance
- Derived data in `computed`, not in methods or in `watch` that assigns a ref.
- Expensive work inside methods called from the template (runs on every render).
- `v-for` keys: unique ids (`sku`, `id`, `month`), never the array index.
- `v-if` on frequently toggled content: `v-show` is cheaper. Rarely shown content: `v-if`.
- Several sequential `await`s that could run in parallel with `Promise.all`.
- Watchers that reload on every change without need (consider only the relevant refs).
- Large static lists or heavy components that could be lazy loaded.
- Dates parsed without validation (`new Date(x).getMonth()` on possibly invalid input).

### Code reuse
- Logic duplicated in other views: candidate for a composable. Search with grep for the
  same function names or the same fetch pattern before claiming duplication.
- Formatting done inline (`toLocaleString()` without a locale): check `utils/currency`
  and use the shared helper. Output must not depend on the system locale.
- Filter handling that bypasses `useFilters`.
- API calls made directly with axios instead of through `client/src/api.js`.
- Hardcoded user-visible strings instead of `t()` from `useI18n`, with both
  `locales/en.js` and `locales/ja.js` updated.
- Repeated inline styles or markup that already exists as a shared class in `App.vue`.

### Project rules
- No emojis in the UI.
- Loading and error states shown for every async load.
- No leftover `console.log`.
- Non-obvious logic carries a comment.

## Report format

```
## <ComponentName> (path)

Summary: one or two sentences, including size (template/script lines).

### High impact
1. <finding> (path:line)
   Why it matters: ...
   Suggested change: ... (small code sketch if useful)

### Medium impact
...

### Low impact / style
...

### Looks good
- short list of things checked that need no change

Not verified: anything that needs running the app (measured render time, runtime behaviour).
```

Rules for the report:
- Every finding cites a file and line. No generic advice.
- Say clearly when something is a guess, for example a suspected duplication you did not
  confirm with a search.
- Do not claim a performance gain you did not measure. Describe the mechanism instead.
- End with the single change you would make first.
