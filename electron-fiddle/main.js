// =============================================================================
// FLAGS — toggle these to test Chromium / ANGLE / GPU configurations.
// Default state: ALL COMMENTED OUT. That matches what most Electron apps ship
// with (no intervention), and is what we want to compare against Chrome.
//
// To use: uncomment one or more lines, save, and hit "Run" in Electron Fiddle.
// Some flags are mutually exclusive (notably the --use-angle variants — pick
// one at a time).
//
// Bug under investigation: spaceagetv/missioncontrol#4046
//   Periodic full-frame visual flicker during video playback on Windows 11
//   24H2+ with active discrete GPUs when ANGLE uses D3D11.
// =============================================================================

const { app, BrowserWindow } = require('electron')

// --- ANGLE backend (only ONE at a time) -------------------------------------
// Default: ANGLE picks D3D11 on Windows. The bug suspect.
// app.commandLine.appendSwitch('use-angle', 'd3d9')   // Force ANGLE to D3D9 — known-good fallback for the MPO glitch.
// app.commandLine.appendSwitch('use-angle', 'gl')     // Use desktop OpenGL via ANGLE.
// app.commandLine.appendSwitch('use-angle', 'warp')   // CPU software rasterizer. Slow, useful as a control.
// app.commandLine.appendSwitch('use-angle', 'default')// Explicitly request the default (D3D11 on modern Windows).

// --- GPU preference ---------------------------------------------------------
// Hint to Chromium which GPU to bind to on hybrid systems.
// app.commandLine.appendSwitch('gpu-preference', 'low-power')
// app.commandLine.appendSwitch('gpu-preference', 'high-performance')
// app.commandLine.appendSwitch('gpu-preference', 'default')

// --- Hard force iGPU on non-Optimus hybrid systems --------------------------
// Stronger than --gpu-preference; bypasses NVIDIA / Windows per-app GPU
// profile databases that otherwise steer Electron onto the dGPU even when
// Chrome lands on the iGPU on the same hardware.
// app.commandLine.appendSwitch('force_low_power_gpu')

// --- Direct Composition / MPO -----------------------------------------------
// Disables overlay promotion of video planes by DWM. If the flicker stops
// here, the bug is in the MPO promotion path.
// app.commandLine.appendSwitch('disable-features', 'DirectCompositionVideoOverlays')

// --- Hardware video decode --------------------------------------------------
// Forces software / MFT / FFmpeg decode instead of the D3D11 video decoder.
// Useful to isolate decoder vs. compositor as the source of the glitch.
// app.commandLine.appendSwitch('disable-features', 'D3D11VideoDecoder')

// --- Combined disable-features (uncomment if testing more than one) ---------
// app.commandLine.appendSwitch('disable-features', 'DirectCompositionVideoOverlays,D3D11VideoDecoder')

// =============================================================================
// Window setup — you should rarely need to touch anything below.
// =============================================================================

const REPRO_URL = 'https://spaceagetv.github.io/chromium-gpu-bug/'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'chromium-gpu-bug repro (Electron Fiddle)',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: require('path').join(__dirname, 'preload.js'),
    },
  })

  win.loadURL(REPRO_URL)
  win.webContents.openDevTools({ mode: 'detach' })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
