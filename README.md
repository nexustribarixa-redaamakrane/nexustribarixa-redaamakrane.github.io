# Nexus' Software Wiki

The official software and documentation home of **Nexus Tribarixa** (Reda Amakrane). A static wiki site covering font engineering, Unicode registries, character encodings, bootloaders, and system utilities.

## Contents

- **Font Modding** — fModLoader (FML), a dynamic font glyph editor built in C# and Avalonia UI.
- **Linguistics & Unicode** — SuperUnicode (SUCS / ExtSUCS), a custom character encoding for OpenWindows.
- **RNUR** — Reddit Neographical Unicode Registry, an open-source registry for the r/neography community's conlangs and neographies.
- **Character Encodings** — SUTF custom text formatting and serialization transports for OpenWindows.
- **My Portfolio** — Redaush Portfolio and nVortex tech initiative by Reda Amakrane.
- **OpenWindows & Related** *(in development)* — Modular-Bootloader (x86 MBR/VBE) and OpenWindows-Storage (ow-storage).
- **Nexal Fonts** *(in development)* — Font documentation and repository.
- **LogoTrends** *(in development)* — Design archive and analysis.
- **LT Type** *(in development)* — Type foundry and typography platform.
- **Nexus' Software** *(in development)* — Software suite and tools.
- **RCCR** *(in development)* — Project and specifications.
- **Miscellany** — SocioProgram anti-bloat developer platform.

See [sitemap.html](sitemap.html) for the full index, and [aboutnsw.html](aboutnsw.html) for details on the project.

## Tech Stack

- Plain HTML, CSS, and jQuery — no build step.
- Google Fonts (Noto Sans, Press Start 2P, VT323) for the retro wiki aesthetic.
- Theme-switching wordmarks, logos, and favicons in light/dark modes.

## Running Locally

Just serve the repository root over any static HTTP server:

```sh
python -m http.server 8080
```

Then open <http://localhost:8080>.

## Deployment

The site is deployed to **GitHub Pages**. A [GitHub Actions workflow](.github/workflows/static.yml) publishes the entire repository on every push to `main`.

## License

Unless noted otherwise, all content on this wiki is released under a [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license. Individual pages may explicitly reserve personal or proprietary material under standard copyright.
