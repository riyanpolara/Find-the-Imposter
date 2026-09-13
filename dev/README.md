# Dev-only files

Not part of the app. Vite's production build only takes `index.html` as an
entry, so nothing here ends up in `dist/`.

## `harness.html`

Loads the real app at `/dev/harness.html`, but first patches two things that
only matter under browser automation:

- **A worker-driven `requestAnimationFrame` pump.** An automated browser pane
  often never paints, so rAF is never serviced and Framer Motion's frame loop
  stalls mid-transition. `setTimeout` can't stand in either — background pages
  clamp it to roughly 1Hz. A Worker's timers are not throttled.
- **`delete Element.prototype.animate`.** Motion hands opacity/transform springs
  to the Web Animations API, which also refuses to advance in a document that
  never paints. Removing it makes Motion fall back to its JS driver, which runs
  on the pumped rAF loop.

Without both, `AnimatePresence mode="wait"` never completes an exit and the app
appears frozen on the first screen — an artefact of the harness, not a bug.
