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
- Resolve optional paired limb lengths through the shared limb-length module and quantize preview lengths to whole crochet rounds; extend limbs away from fixed attachments, move paw boundaries with their tips, and offset joined-body round numbers without rewriting saved drafts.
- Define yarns and display groups in one shared palette module, retaining legacy yarn IDs; all region controls use the shared swatch component so exact colour resolution and saved selections stay consistent.
- Version the base anatomy in pattern keys and migrate saved configurations without overwriting draft text; existing edited patterns must remain recoverable when defaults change.
- Resolve individual part yarns through the shared character helper with legacy main-yarn fallback; backfill missing saved part colors without modifying draft records, and name sides from the doll's perspective so preview and assembly agree.
- The 3D lower body renders a smooth union of independently parameterized torso and leg volumes with continuous normals and per-part vertex colors; one surface prevents attachment seams while retaining modular shape and yarn inputs.
- Derive head attachment from the joined torso bounds and shift ears with the head; a shared anatomy module prevents gaps after torso edits and owns the raised cheek geometry.
- Keep blush visibility in face.cheeks and independent face yarns in colors.leftBlush/rightBlush/leftEye/rightEye with legacy blush/eyes fallbacks in the shared part helper; migration preserves drafts and hiding cheeks retains both yarns so saved configurations remain recoverable.
- Store mix-and-match facial selections as optional face fields with legacy-safe defaults; shared surface-following stitches reuse individual eye yarns, and blush shape geometry and placements belong to the anatomy module so face choices remain independent and recoverable.
- Keep ear registry IDs stable when changing display names so saved selections remain compatible.
- The canonical layered renderer uses the original image pointer through a separate display mask and a shared fixed canvas; registry entries define slot, ordered PNG/SVG asset pieces, component IDs and rule references, so adding artwork never requires editing the renderer.
- Layered configuration is versioned separately from legacy crochet configuration; migrate missing layer selections to empty slots without changing drafts, and block pattern generation until the base and selected components have explicit supported rules.
- Optional tails use a single registry selection slot and a separate shared-material 3D part with its own yarn; normalization backfills absent selections, and undefined tail crochet rules remain blocked.
- Paw yarns are optional shared surface-region settings, not body parts; patch the existing physical-material colour stage using local limb coordinates without altering positions or normals. Resolve remaining limb surfaces through the shared individual-part yarn helper regardless of paw selection so side-specific controls stay effective.
- Keep category/subcategory navigation and active colour-region targeting local to the customization workspace; reuse shared feature cards and a single shared palette without changing persisted character data, so layout changes cannot overwrite saved choices.
- Map optional feature thumbnail selections to existing visibility fields in the workspace; presentation-only changes must retain saved shapes and yarns without a configuration migration.
- The landing page owns "/" and the character editor owns "/customize"; account pages keep their own routes. In-app links to the editor must target "/customize", so marketing copy and the working tool never compete for the same address.
- Pattern reader presentation is shared by draft and saved views through a reusable workspace header and reader-scoped styles; keep parsing, generated text and progress storage independent so visual changes cannot alter crochet content.
- Reader and booklet share part-focus selection; isolated leg capsules use shared leg dimensions, blush uses thin discs, and compact paired close-ups retain per-side yarns without altering assembled anatomy.
- Roles (maker/admin/super_admin) live only in the protected user_roles table; only super admins may grant or revoke admin via RLS, and the first account to sign up becomes super admin — prevents privilege escalation from client data.
- The team sign-in lives at "/team-login", separate from the maker "/auth" page, and admits only admin/super_admin roles checked through the shared isTeamMember helper — makers can never enter through the team door.
- Saved patterns stay in the local store for the UI and are mirrored to the `patterns` table by src/lib/cloud-sync.ts when signed in; maker preferences live in `maker_preferences`. Team roles can read both for analytics — keeps the editor offline-capable while admins see real data.
- Maker yarn stash lives in `maker_yarns`; stitching preferences (weight, hook, favourite colours) are derived from saved patterns × stash via src/lib/maker-insights.ts and mirrored into `maker_preferences` — only written terms are chosen manually, so analytics reflect real usage.
- Maker routes use the MakerOnly gate (team → /admin; allowTeam only on /customize and /pattern). Team invites go through role-checked createTeamMember; profiles.must_change_password forces a first sign-in change and fails closed. PatternReader is read-only unless onTextChange is passed.
- Team saves from /customize go to `official_patterns`, never `patterns`; cloud-sync skips team users and counters change only via `track_official_pattern` (ignores team) — keeps maker analytics clean.
