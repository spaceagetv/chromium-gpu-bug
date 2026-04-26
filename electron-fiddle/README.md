# chromium-gpu-bug Electron Fiddle

A minimal Electron Fiddle that loads the
[chromium-gpu-bug repro page](https://spaceagetv.github.io/chromium-gpu-bug/)
in a `BrowserWindow` so engineers can quickly toggle ANGLE backends, GPU
preferences, and Chromium feature flags and compare Electron's behavior
against Chrome on the same hardware.

This Fiddle is the companion to the GitHub Pages reproduction page hosted
from the same repository
([source `../index.html`](../index.html), [live](https://spaceagetv.github.io/chromium-gpu-bug/)).
The page reproduces the bug in any Chromium browser; this Fiddle reproduces
it inside an Electron `BrowserWindow` with toggleable Chromium / ANGLE flags
so the two can be compared on identical hardware.

Tracking issue: [spaceagetv/missioncontrol#4046](https://github.com/spaceagetv/missioncontrol/issues/4046).

> **Canonical location:** this directory in
> [spaceagetv/chromium-gpu-bug](https://github.com/spaceagetv/chromium-gpu-bug/tree/main/electron-fiddle).
> An older copy of this Fiddle exists as
> [gist `c82631380f573e3278d864c57fa75df0`](https://gist.github.com/jjeff/c82631380f573e3278d864c57fa75df0);
> prefer this directory going forward.

## What it does

Opens a 1280x800 window pointed at `https://spaceagetv.github.io/chromium-gpu-bug/`
with detached DevTools. All Chromium / ANGLE switches live in a clearly
labeled `FLAGS` block at the top of `main.js`. By default everything is
commented out — that matches a stock Electron app and is the baseline you
want to compare against Chrome.

## How to load it in Electron Fiddle

Three options, easiest first:

- **From this repo:** clone the repo and in Electron Fiddle use
  **File → Open Fiddle…** pointed at the `electron-fiddle/` directory.
- **From the gist (legacy copy):** open
  `electron-fiddle://gist/c82631380f573e3278d864c57fa75df0` in your browser, or
  paste the gist URL into Fiddle's **File → Load Fiddle from GitHub Gist**.
- **Manually:** copy the contents of this directory into a fresh Fiddle.

Fiddle will install the pinned Electron version on first run, and you can
hit **Run**.

## Workflow: testing flags

1. Open `main.js` in the Fiddle editor.
2. Uncomment one (or more) lines in the `FLAGS` block at the top.
   - The `--use-angle=...` variants are mutually exclusive — pick one.
   - Multiple `--disable-features` values must be combined into a single
     comma-separated switch (a commented example is provided).
3. Save and click **Run**.
4. Observe the repro page; use detached DevTools to inspect.
5. Stop, change flags, run again.

## Workflow: comparing against Chrome

Open the same page in Chrome on the same machine:

```
https://spaceagetv.github.io/chromium-gpu-bug/
```

**Important caveat for Windows hybrid laptops (NVIDIA Optimus / AMD hybrid):**
Windows and the NVIDIA Control Panel maintain per-application GPU profiles.
Chrome and Electron are different executables, so they can land on
*different* GPUs by default — Chrome typically on the iGPU, Electron
typically on the dGPU. That asymmetry is itself part of the bug picture
and was a major source of confusion in early triage.

To force Chrome onto the dGPU for a fair comparison:

- **Quick:** right-click `chrome.exe` → **Run with graphics processor** →
  **NVIDIA / High-performance GPU**.
- **Persistent:** Windows Settings → System → Display → Graphics → add
  Chrome → Options → **High performance**. Or set it in the NVIDIA Control
  Panel under "Manage 3D settings → Program Settings".

To verify which GPU each app is actually using, check `chrome://gpu`
("GL_RENDERER") in Chrome and the same URL pasted into the Fiddle window's
DevTools-attached page (or load `chrome://gpu` instead of the repro URL
temporarily).

## Notes

- Pinned to Electron `^41.0.0` (current stable major as of writing).
- No tracking, no analytics, no extra dependencies — just Electron.
- `index.html`, `renderer.js`, and `preload.js` are stubs; the Fiddle
  loads an external URL via `win.loadURL`.
