# Chromium DWM/MPO rendering bug — minimal reproduction

A minimal in-browser reproduction of the long-standing rendering glitch affecting
Chromium-based applications on **Windows 11 24H2 and 25H2 with discrete GPUs**.

**Live demo:** https://spaceagetv.github.io/chromium-gpu-bug/

## What is this bug?

Chromium's default video and compositor present path on Windows uses
DirectComposition swap chains, which Windows 11's Desktop Window Manager (DWM)
schedules through the Multi-Plane Overlay (MPO) hardware path on capable GPUs.
Starting with Windows 11 24H2 (October 2024), DWM's dynamic switching between
its `Composed: Flip` and `Hardware Composed: Independent Flip` presentation
modes regressed — partially-updating windows can freeze or tear during the
flip-mode transition.

The bug is **OS-side** (DWM), not in Chromium itself, but Chromium's default
present strategy is what trips it. Other Chromium apps including Discord,
Visual Studio Code, Obsidian, and any Electron application on Windows 11 24H2+
exhibit the same symptoms.

## Affected systems

| Component | Status |
|---|---|
| **Operating system** | Windows 11 24H2 (build 26100+) or 25H2 |
| **GPU** | Discrete (NVIDIA / AMD Radeon non-APU / Intel Arc). Integrated GPUs (Intel UHD/Iris Xe, AMD APUs) appear largely unaffected because their MPO capabilities don't qualify for DWM's broken promotion path. |
| **Browser** | Any Chromium-based — Chrome, Edge, Brave, Vivaldi, Opera, Arc, Electron apps |
| **Settings** | Default. Specifically requires D3D11 ANGLE backend (default) and DirectComposition enabled (default). |

## How to reproduce

1. Open https://spaceagetv.github.io/chromium-gpu-bug/ in Chrome (or Edge / any Chromium browser) on an affected machine
2. Watch the **animation frame counter** in the top-left increment smoothly at ~60Hz
3. Press <kbd>Alt</kbd>+<kbd>Tab</kbd> to a fullscreen window (game, video player, or maximized application)
4. Switch back to this tab
5. Repeat 2–3 times if needed — the bug doesn't always fire on the first switch

**Bug present:** the counter freezes at an old number while the rest of the
page UI is still responsive (cursor, buttons, scrolling). Clicking the page
typically resumes the counter. Sometimes parts of a previous window's overlay
are visible bleeding into this page.

**No bug:** counter keeps incrementing across the alt-tab cycle, or resumes
instantly when the window regains focus.

The page also exposes a **Fullscreen** toggle and an **Auto-trigger** mode
that cycles fullscreen on/off every 10 seconds, since fullscreen transitions
force DWM to re-evaluate MPO promotion and reliably trigger the regression on
affected hardware.

## Workarounds

These are end-user / sysadmin workarounds. The application-side workarounds
(switching ANGLE backend, disabling hardware video decode) are vendor-specific.

### Windows 11 24H2

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\GraphicsDrivers
"OverlayMinFPS"=dword:00000000
```

Then restart. This forces DWM to keep low-frame-rate windows in
`Hardware Composed: Independent Flip` mode rather than toggling between modes.

### Windows 11 25H2

The 24H2 registry path no longer takes effect. Use:

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\GraphicsDrivers
"DisableOverlays"=dword:00000001
```

Then restart. This disables hardware overlay scheduling system-wide, which
prevents DWM from promoting any swap chain to MPO and so avoids the bug
entirely. Has performance implications for borderless-windowed gaming.

### Per-app (Chromium browsers)

Visit `chrome://flags/#use-angle` and select **D3D9** or **OpenGL**.
This switches Chromium's ANGLE backend off the broken D3D11 path.
Side effects vary; in particular, hardware HEVC video decode requires the
D3D11 ANGLE backend in Chromium and is lost when switching to D3D9 / GL.

## Upstream tracking

- **Chromium:** https://issues.chromium.org/issues/429859152 — "Hardware acceleration causes stuttering on Chromium…"
- **Electron:** https://github.com/electron/electron/issues/46206
- **Microsoft:** Not yet acknowledged on the [official 24H2 known-issues page](https://learn.microsoft.com/en-us/windows/release-health/status-windows-11-24h2). 18+ months and counting.

## Why this repository exists

Existing reports of this bug are mostly anecdotal screenshots in forum threads.
A short, deterministic reproduction page running in vanilla Chrome — no
browser flags, no third-party app — should make it easier for Chromium /
Microsoft engineers to reproduce on their own hardware and prioritize a fix.

If you have a fix landing in a Chromium milestone, a Windows servicing update,
or a GPU driver release, please open an issue or PR linking to it.

## Contents

- `index.html` — the reproduction page
- `test-video.mp4` — sample H.264 video used to trip MPO promotion (Big Buck Bunny clip, public domain, ~770KB)
- `README.md` — this file
- `LICENSE` — MIT

## License

MIT. The included `test-video.mp4` is from the Big Buck Bunny film
(© 2008 Blender Foundation, [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/)).
