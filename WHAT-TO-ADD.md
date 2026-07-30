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
| **Tier B** | Provisional Territory (BMP `EE00–EFFF` & Plane 15 Gaps) | Dynamic database migration down to Set 2 base sandbox rows upon upstream collision, glyph metric refactoring, and Set 1 slot clearance. |

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
| `EE00–EE0F` | Franklin Phonetic Alphabet | Registered | Benjamin Franklin | Provisional lease; also at SPUCE embassy range (`F9000–F900F`) |
| `EE10–EE5F` | Loopiform | Registered | Filipe Dos Reis | Provisional lease; also at SPUCE embassy range (`F9010–F905F`) |
| `EE60–EE8F` | Open Slot / Provisional | Reserved | — | Provisional RNUR defensive zoning macro-allocation |
| `EE90–EEDF` | Sulat Hiligaynon | Registered | Julius Dalum | Also at SPUCE embassy range (`F9090–F90DF`) |
| `EEE0–EF2F` | Western Script | Registered | Julius Dalum | Companion script for foreign names; SPUCE embassy (`F90E0–F912F`) |
| `EF30–EF6F` | Zurjon | Registered | Nikita Varfalameev | Also at SPUCE embassy range (`F9130–F916F`) |
| `EF70–EFAF` | Foldian | Registered | Nikita Varfalameev | Also at SPUCE embassy range (`F9170–F91AF`) |
| `EFB0–EFFF` | Reserved | Reserved | — | Open BMP PUA Sector |
| `F5C0–F7FF` | Reserved | Reserved | — | Tier A BMP Gap / Defensive Zone |
| `F820–F87F` | Reserved | Reserved | — | Tier A BMP Gap / Structural Reservation |

---

### Plane 15 (U+F0000–U+FFFFF)

| Code Range | Script | Status | Creator | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `F1D00–F1EFF`, `F26B0–F26FF`, `F28E0–F28FF`, `F2960–F29FF`, `F3400–F4FFF`, `F50F0–F7FFF`, `F81B0–F8FFF`, `FA000–FAFFF`, `FC000–FDFFF`, `FF200–FF27F`, `FF2A0–FF2BF`, `FF700–FF9FF`, `FFE00–FFEFF` | Provisional Gaps | Reserved | — | Tier B defensive zones under active upstream vacuum |

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
| `E820–F8FF` | Open Sandbox | Reserved | — | Parallel BMP Private Use Area sandbox layer |

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
