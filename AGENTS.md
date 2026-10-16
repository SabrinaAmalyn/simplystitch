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
