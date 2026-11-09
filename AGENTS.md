<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- bluette closet data (wardrobe items, saved outfits, photos) lives in the browser's IndexedDB via `src/lib/bluette/storage.ts`; there is no sign-in, so per-device storage keeps each visitor's closet private.
- App-wide closet state lives in `BluetteProvider` (mounted once by `BluetteShell` in `__root.tsx`); pages under `src/routes` read it with `useBluette()` so state survives navigation.
- AI calls go through server functions in `src/lib/bluette/stylist.functions.ts` (logic in `stylist.server.ts`); only garment metadata is sent for outfit ideas, never photos, to keep payloads small.
- Outfit fallback/ID-validation rules live in `src/lib/bluette/outfit-rules.ts` with tests beside it, so the stylist can never return pieces the user doesn't own.
- Brand colours are tokens in `src/styles.css` (`--ink`, `--sky`, `--butter`, ...); components use token utilities or `var(--color-*)` inside arbitrary values, never raw hex.
