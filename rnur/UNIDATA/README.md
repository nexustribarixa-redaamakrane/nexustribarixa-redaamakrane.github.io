# RNUR UNIDATA (Mirror)

This folder is a **mirror** of the `UNIDATA` folder from the
[RNUR repository](https://github.com/rnur-consortium/rnur).

It provides a Unicode Character Database of the scripts in RNUR (and shared
registries). Still under construction.

Only the data files (`Blocks.txt`, `CaseFolding.txt`, `NamesList.txt`,
`Sources.txt`, `UnicodeData.txt`, ...) are mirrored. The `index.html` pages and
this `README.md` are website-specific and are never overwritten.

## Keeping this mirror in sync

Two mechanisms keep this mirror up to date:

1. **Local script** — `scripts/sync-unidata.ps1` watches the local rnur repo
   at `%USERPROFILE%\Documents\rnur` (any user / any PC) and copies changes
   here. If that local repo is not present, it falls back to cloning
   `github.com/rnur-consortium/rnur`. Run it manually, or in watch mode:

   ```pwsh
   ./scripts/sync-unidata.ps1 -DryRun          # preview what would change
   ./scripts/sync-unidata.ps1                  # sync from local repo or GitHub
   ./scripts/sync-unidata.ps1 -FromGitHub      # always use GitHub
   ./scripts/sync-unidata.ps1 -Watch           # poll every 5 minutes
   ```

2. **GitHub Actions** — `.github/workflows/sync-unidata.yml` runs weekly (and
   on manual `workflow_dispatch`), clones the rnur repo, and opens a pull
   request with any UNIDATA changes.
