(modify the rnur page to add this)

# Reddit Neographical Unicode Registry

The ConScript Unicode Registry (CSUR) is a project led by John Cowan and Michael Everson to coordinate the assignment of blocks out of the Unicode Private Use Area (E000–F8FF and F0000–10FFFF) to constructed and artificial scripts, including those for conlangs. However, Mr. Everson is very busy saving the world's minority scripts, leaving little time to update the CSUR. Because several submitted scripts remain unlisted, Rebecca G. Bettencourt created the Under-ConScript Unicode Registry (Under-CSUR or UCSUR) to hold these scripts' place in the registry and ensure nobody steps on each other's toes until they can be added to the original registry.

Similarly, the SPUCE (Shared Private Use Character Encoding) Project—created by FontStruct user erictom333—is a collaborative effort hosted on Miraheze that coordinates character allocations within Unicode's Private Use Areas across Planes 0, 15, and 16. Unlike standard Unicode, SPUCE covers a much broader scope by encoding constructed scripts, user-created conlangs, specialized terminal or computer semigraphics, and custom inline symbols that official registries typically reject. It also maintains compatibility with legacy registries like the (U)CSUR by housing well-known constructed scripts like Tolkien's Tengwar and Cirth, whose official Unicode proposals have remained stalled for decades. To keep the PUA organized and prevent codepoint collisions, SPUCE operates on a structured reservation roadmap where contributors secure specific blocks for fully developed scripts, while strictly banning redundant encodings of real-world scripts already slated for standard Unicode roadmap inclusion.

However, traditional PUA registries suffer from a major structural limitation: they rely on a flat, single-layer Private Use Area. Because space is finite, block allocations risk overlapping and clashing with upstream additions, and once the PUA planes are exhausted, no further expansion is possible.

To solve this, the **Reddit Neographical Unicode Registry (RNUR)** was created for the [r/neography](https://www.reddit.com/r/neography/) community. Managed by the RNUR Consortium, RNUR is an open-source architecture designed to archive original scripts and conlangs without codepoint collisions or OpenType engine limitations.

## Multi-Dimensional Set Architecture & Virtual Layering

Rather than relying on a single flat PUA layer, RNUR uses a **Coordinate-Pair System** mapping characters as `(Set_Number, Code_Point)`:

| Set Layer | Layer Name | Target Scope | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Set 1** | Global Stability Layer | BMP PUA (`U+E000–U+F8FF`), Plane 15 (`U+F0000–U+FFFFF`), Plane 16 (`U+100000–U+10FFFF`) | Synchronized baseline for finalized community scripts, active conlangs, and verified historical additions. |
| **Set 2** | Sandbox Layer | All PUA Planes | Isolated environment for experimental scripts, application tokens, local rendering, and eviction landing zone. |
| **Sets 3+** | Expansion Stack | Virtual Paging Layers | Virtual sandbox layers that expand dynamically via virtual paging whenever contiguous space runs out. |

## Upstream Conflict Handling & Eviction Policies

Because RNUR shares physical PUA space with upstream registries ((U)CSUR and SPUCE), collisions are handled automatically by the RNUR pipeline based on slot classification:

| Tier | Classification & Territory | Conflict Resolution & Eviction Mechanism |
| :--- | :--- | :--- |
| **Tier A** | Hardened Slots & Structural Gaps | 1:1 Parallel Addressing Mirror into Set 2 (e.g. Set 1 `U+100580` $\rightarrow$ Set 2 `U+100580`), `UPSTREAM_COLLISION` flag deployment, and runtime font layer overrides. |
| **Tier B** | Provisional Territory (BMP `F720–F7FF`, `F820–F87F` & Plane 15 Gaps) | Dynamic database migration down to Set 2 base sandbox rows upon upstream collision, glyph metric refactoring, and Set 1 slot clearance. Applied to BMP `EE00–EFFF`: the six RNUR scripts formerly leased there now live at Set 2 `E820–E99F`, and the dissolved `???` reservations were not recreated. |

'njoy browsing this page!

---

# Withdrawn from (U)CSUR

| Code Range | Script | Status |
| :--- | :--- | :--- |
| `E6D0−E6FF` | PHAISTOS DISC | Withdrawn. Use `U+101D0–U+101DF`. |
| `E700−E72F` | SHAVIAN | Withdrawn. Use `U+10450–U+1047F`. |
| `E830−E88F` | DESERET | Withdrawn. Use `U+10400–U+1044F`. |

# Withdrawn from SPUCE

According to the SPUCE Project website on Miraheze, any script that has not yet been migrated from the deprecated Fandom wiki is no longer part of SPUCE (neither is it part of RNUR). For more information, check the Compatibility page at [spuceproject.miraheze.org/wiki/Compatibility](https://spuceproject.miraheze.org/wiki/Compatibility).

---

# RNUR Allocations

A summary Roadmap to the Reddit Neographical Unicode Registry is available in the official [RNUR Repository](https://github.com/rnur-consortium/rnur).

## SET 1 (Shared PUA)

### BMP PUA (U+E000–U+F8FF)

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `EE00–EE2F` | Vulcan | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EE30–EE5F` | Gallifreyan | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EE60–EE8F` | Atlantean | SPUCE Allocation | SPUCE | Covers a former RNUR `???` reservation, dissolved into permanent space |
| `EE90–EEBF` | Valyrian | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EEC0–EEEF` | Dovahzul | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EEF0–EF0F` | Utopian | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EF10–EF3F` | Global Alphabet | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EF40–EF6F` | Ditema | SPUCE Allocation | SPUCE | Part of the nine-script SPUCE allocation map covering `EE00–EFFF` |
| `EF70–EFFF` | Quốc âm tân tự | SPUCE Allocation | SPUCE | Covers the former RNUR `???` reservation `EFB0–EFFF`, dissolved into permanent space |
| `F5C0–F71F` | Placeholder | Provisional Lease | — | Named RNUR Set 1 allocation (English cipher script, not a `???` reservation); mirrored in RNUR embassy space at `F92C0–F941F` |
| `F720–F7FF` | Reserved | Reserved | — | Tier B provisional `???` gap / Defensive Zone |
| `F820–F87F` | Reserved | Reserved | — | Tier B provisional `???` gap / Structural Reservation |

The `EE00–EFFF` interval was previously held by six provisional RNUR scripts; under the **Set 1 → Set 2 migration** they were evicted and relocated to `E820–E99F` in Set 2 (see below), while the interval is now fully allocated to the nine-script SPUCE map. SPUCE supplies those allocation definitions; RNUR represents them in its own Set 1 layer, since SPUCE does not use RNUR's Set 1 / Set 2 architecture. The former `???` reservations at `EE60–EE8F` and `EFB0–EFFF` were dissolved into permanent space rather than migrated.

---

### Plane 15 (U+F0000–U+FFFFF)

SPUCE tentatively maps Plane 15 out into thirteen zones. Two of them (`F9000–F9FFF` and `FB000–FBFFF`) are carved out and reserved for RNUR, and `FE000–FEFFF` is reserved for erictom333. Wherever SPUCE has allocated a script, those codepoints are SPUCE's; whatever space is left empty inside a zone is still held by RNUR as a Tier B defensive zone. The full zone map is reproduced in the [RNUR Roadmap](rnur/roadmap.html).

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `F9000–F9FFF` | Constructed Scripts for Existing Languages | RNUR Embassy | RNUR Consortium | Zone 6 — carved out of SPUCE zoning and reserved for RNUR; SPUCE-overseen. Holds the relocated RNUR scripts formerly leased at BMP `EE00–EF2F`. |
| `FB000–FBFFF` | Constructed Scripts for Constructed Languages | RNUR Embassy | RNUR Consortium | Zone 8 — carved out of SPUCE zoning and reserved for RNUR; SPUCE-overseen. Holds the relocated RNUR scripts formerly leased at BMP `EF30–EFAF` (Zurjon, Foldian). |
| `F4E00–F4FFF` | Halfwidth and Fullwidth Forms Extended-I | SPUCE-Listed | SPUCE | Zone 2 — SPUCE codepoints. |
| `F50F0–F514F` | Enochian, Litterae Ignotae, Theban | SPUCE-Listed | SPUCE | Zone 3 (notation, ciphers, undeciphered & pseudohistorical scripts) — SPUCE codepoints. |
| `FF700–FF9FF` | Control Pictures Extended-II | SPUCE-Listed | SPUCE | Zone 11 — SPUCE codepoints. Soon going to be encoded in Plane 16. |
| `F1D00–F1EFF`, `F26B0–F26FF`, `F28E0–F28FF`, `F2960–F29FF`, `F3400–F4DFF`, `F5150–F7FFF`, `F81B0–F8FFF`, `FA000–FAFFF`, `FC000–FDFFF`, `FF200–FF27F`, `FF2A0–FF2BF`, `FFE00–FFEFF` | Provisional Gaps | Reserved | — | Tier B defensive zones under active upstream vacuum — the empty space still left after SPUCE's allocations. |

---

### Plane 16 (U+100000–U+10FFFF)

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `100000–10FFEF` | Structural Slots | Reserved | — | Tier A permanent structural tracking slots |

---

## SET 2 (Native Sandbox Scripts)

### BMP PUA (U+E000–U+F8FF)

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `E000–E81F` | Constantscript | Registered | u/Constant_Ad_5890 (_4olhos) & Discord Server | Issue initiated by u/Fyteria (Abytherus) |
| `E820–E82F` | Benjamin Franklin's Phonetic Additions | Provisional Lease | Benjamin Franklin | Set 2 relocation of former Set 1 `EE00–EE0F` (16 code points); RNUR embassy space at SPUCE `F9000–F900F` |
| `E830–E87F` | Loopiform | Provisional Lease | Filipe Dos Reis | Set 2 relocation of former Set 1 `EE10–EE5F` (80 code points); RNUR embassy space at SPUCE `F9010–F905F` |
| `E880–E8CF` | Sulat Hiligaynon | Provisional Lease | Julius Dalum | Set 2 relocation of former Set 1 `EE90–EEDF` (80 code points); RNUR embassy space at SPUCE `F9090–F90DF` |
| `E8D0–E91F` | Western Script | Provisional Lease | Julius Dalum | Set 2 relocation of former Set 1 `EEE0–EF2F` (80 code points); RNUR embassy space at SPUCE `F90E0–F912F` |
| `E920–E95F` | Zurjon | Provisional Lease | u/Willing_Squirrel_741 | Set 2 relocation of former Set 1 `EF30–EF6F` (64 code points); RNUR embassy space at SPUCE `FB130–FB16F` |
| `E960–E99F` | Foldian | Provisional Lease | u/Willing_Squirrel_741 | Set 2 relocation of former Set 1 `EF70–EFAF` (64 code points); RNUR embassy space at SPUCE `FB170–FB1AF` |
| `E9A0–F8FF` | Open Sandbox | Reserved | — | Parallel BMP Private Use Area sandbox layer |

The six named RNUR scripts at `E820–E99F` are Set 2 relocations of the former Set 1 allocations in `EE00–EFFF`, evicted when the SPUCE allocation map took over that interval. Inclusive sizes and relative order are preserved, and ConstantScript (`E000–E81F`) is unchanged. `E9A0–F8FF` remains open sandbox space.

---

### Plane 15 (U+F0000–U+FFFFF)

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `F0000–FFFFF` | Reserved Sandbox | Reserved | — | Sandbox Plane 15 allocation layer |

---

### Plane 16 (U+100000–U+10FFFF)

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `100000–10FFFF` | Reserved Sandbox | Reserved | — | Sandbox Plane 16 allocation layer |

---

Further information about the CSUR is available from: John Cowan or Michael Everson. Updated 2008-04-14 (original), 2026 (reddit). I WILL COMPLY WITH ANY REQUEST FROM JOHN COWAN OR MICHAEL EVERSON CONCERNING THIS PAGE.

Further information about SPUCE is available from: erictom333. [Website](https://spuceproject.miraheze.org/). Updated 2026 (reddit). I WILL COMPLY WITH ANY REQUEST FROM ERICTOM333 CONCERNING THIS PAGE.
