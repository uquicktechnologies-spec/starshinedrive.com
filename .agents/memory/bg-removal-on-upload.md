---
name: Automatic background removal on CRM image upload
description: How/why staff image uploads get automatic background removal, and gotchas with bundling the ML deps.
---

CRM image uploads (via the shared `ImagePickerButton` Upload tab and the standalone Image Library page) run local background removal automatically before the image is registered/used — no external API or key.

- Library: `@imgly/background-removal-node` (ONNX model, runs in-process via `onnxruntime-node` + `sharp`). Chosen over a hosted API (remove.bg/Replicate) so the feature works on every upload without new secrets.
- Flow: client uploads raw bytes to object storage as before, then calls a new server endpoint that downloads the object, runs removal, and re-uploads a transparent PNG as a new object; the new path is used for both the gallery record and the field being edited.

**Why:** `removeBackground()` needs a `Blob` with an explicit `type` (e.g. `image/png`/`image/jpeg`) — without it, decoding throws "Unsupported format". Pass the original object's stored content-type through.

**Why:** pnpm's strict node_modules means a transitive dependency (`onnxruntime-node`, and `sharp`) used indirectly through `@imgly/background-removal-node` is NOT resolvable from an esbuild-bundled app unless it's also a *direct* dependency of that app — otherwise the bundled output fails at runtime with `ERR_MODULE_NOT_FOUND` even though `tsc`/typecheck pass and the package is installed somewhere in the workspace.

**How to apply:** when bundling (esbuild) pulls in a package with native/ML runtime deps that must stay external, add those transitive deps as explicit direct dependencies of the consuming app's `package.json` too. Also, native build scripts (onnxruntime-node, sharp) need approval — add them to root `package.json`'s `pnpm.onlyBuiltDependencies` so `pnpm install` runs their postinstall non-interactively instead of silently skipping native binaries.
