<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep character configuration, SVG preview, and deterministic pattern generation separate; anatomy changes must update the preview and pattern together to keep them aligned.
- Version the base anatomy in pattern keys and migrate saved configurations without overwriting draft text; existing edited patterns must remain recoverable when defaults change.
- Resolve individual part yarns through the shared character helper with legacy main-yarn fallback; backfill missing saved part colors without modifying draft records, and name sides from the doll's perspective so preview and assembly agree.
- The 3D lower body renders a smooth union of independently parameterized torso and leg volumes with continuous normals and per-part vertex colors; one surface prevents attachment seams while retaining modular shape and yarn inputs.
- Derive head attachment from the joined torso bounds and shift ears with the head; a shared anatomy module prevents gaps after torso edits and owns the raised cheek geometry.
- Keep blush visibility in face.cheeks and independent face yarns in colors.leftBlush/rightBlush/leftEye/rightEye with legacy blush/eyes fallbacks in the shared part helper; migration preserves drafts and hiding cheeks retains both yarns so saved configurations remain recoverable.
- Keep ear registry IDs stable when changing display names so saved selections remain compatible.
- The canonical layered renderer uses the original image pointer through a separate display mask and a shared fixed canvas; registry entries define slot, ordered PNG/SVG asset pieces, component IDs and rule references, so adding artwork never requires editing the renderer.
- Layered configuration is versioned separately from legacy crochet configuration; migrate missing layer selections to empty slots without changing drafts, and block pattern generation until the base and selected components have explicit supported rules.
- Optional tails use a single registry selection slot and a separate shared-material 3D part with its own yarn; normalization backfills absent selections, and undefined tail crochet rules remain blocked.
