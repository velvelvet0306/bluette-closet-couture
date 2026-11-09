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

- bluette closet data lives in Lovable Cloud per signed-in user: tables `profiles`, `wardrobe_items`, `saved_outfits` (RLS owner-only) and private buckets `closet-photos` / `avatars` under a `<userId>/` folder, all accessed through `src/lib/bluette/cloud.ts`; rows store photo paths, never signed URLs, because signed links expire.
- Saved outfits keep a JSON snapshot of their pieces so a look survives deleting a wardrobe item; deleting an item keeps its photo file while any saved look still uses it.
- `src/lib/bluette/storage.ts` (IndexedDB) is only read once per browser to import a pre-accounts closet into the signed-in account, plus image compression.
- Every closet page lives under `src/routes/_authenticated/` (sign-in gate, `ssr: false`); its layout mounts `BluetteShell` → `BluetteProvider`, and pages read state with `useBluette()` so it survives navigation. `/auth` and `/reset-password` are the only public pages.
- AI calls go through server functions in `src/lib/bluette/stylist.functions.ts` (logic in `stylist.server.ts`), protected by `requireSupabaseAuth` so only signed-in people can spend AI credits; only garment metadata is sent for outfit ideas, never photos, to keep payloads small.
- Outfit fallback/ID-validation rules live in `src/lib/bluette/outfit-rules.ts` with tests beside it, so the stylist can never return pieces the user doesn't own.
- Brand colours are tokens in `src/styles.css` (`--ink`, `--sky`, `--butter`, ...); components use token utilities or `var(--color-*)` inside arbitrary values, never raw hex.
