# Feature module template (kudya-client)

```
features/<name>/
  api/           # v1 API via shared/api/v1Client
  components/
  hooks/
  screens/       # optional screen fragments
  index.ts
```

Import shared code from `shared/` only — not from other features.
