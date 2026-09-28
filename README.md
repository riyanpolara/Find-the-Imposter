# Mr. White — Find the Imposter

A mobile-first party game for **3–10 friends, one phone, and plenty of suspicious clues**. Pass the phone to reveal secret cards, give hints out loud, then record the group's vote. Mr. White has no word and must bluff their way through.

## Features

- Charcoal-and-lime interface designed for phones, with large touch controls and a persistent start button.
- Full-screen portrait intro video with animated controls, sound, pause, skip, and reduced-motion support.
- Private card reveals and clear pass-the-phone handoffs.
- One shared group vote per round.
- A last-chance word guess for every caught Mr. White.
- **360 built-in words** across Easy, Medium, and Hard, including **180 Indian entries**.
- Mixed, Indian, and Classic word packs, with choices retained for the next game.
- Explicit regional names and spelling alternatives, such as Golgappa for Pani Puri and Sari for Saree.
- Play Again and Back to home actions after the game ends.
- Local game-state persistence and optional Supabase game history.

## Play locally

Use **Node.js 24 LTS** and npm. No account or backend is required for the core game.

```bash
git clone https://github.com/riyanpolara/Find-the-Imposter.git
cd Find-the-Imposter
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). If the port is busy, use the address Vite prints in the terminal.

### Open on your phone

Connect the phone and development computer to the same Wi-Fi network. Vite is configured to expose the development server on the local network. Open the **Network** address printed by Vite on the phone, such as `http://192.168.1.20:5173`. `localhost` on the phone refers to the phone itself.

### Offline play

The game is played face to face. Roles, words, clues, voting, and win checks run locally in the browser; no online multiplayer connection is needed. Once the app is loaded, the core game does not require internet access. Initial loading and reopening still require access to the site or local server: the project does not currently include a service worker or an installable offline cache.

## How to play

1. Choose **3–10 players** and the number of Mr. Whites. They must start outnumbered by civilians. For example, six players can have four civilians and two Mr. Whites.
2. Select **Easy, Medium, or Hard**, then a **Mixed, Indian, or Classic** word pack.
3. Enter everyone's names. Pass the phone in turn so each player can choose and privately reveal a card.
4. Every civilian sees the same secret word. Mr. White sees no word or category.
5. Put the phone down. Each active player gives a short hint out loud in the displayed order. Mr. White listens and bluffs.
6. Discuss who seems suspicious. **One person records the group's decision** by selecting one player to vote out.
7. If a civilian is eliminated, play continues unless the Mr. Whites now equal or outnumber the civilians.
8. If a Mr. White is caught, they get **one guess** at the secret word. A correct guess wins for Mr. White immediately. After a wrong guess, they are out; the word stays hidden if another Mr. White is still playing.
9. Civilians win when every Mr. White is eliminated and the last guess fails. Mr. Whites also win if they equal or outnumber the remaining civilians.

**Play Again** keeps the group and word settings and deals a new random game. **Back to home** returns to the lobby.

## Word bank

The word bank is already integrated into setup and the game engine. Selection is filtered by both difficulty and word pack, and every civilian receives the same selected word.

| Difficulty | Mixed | Indian | Classic | Indian examples |
| --- | ---: | ---: | ---: | --- |
| Easy | 120 | 60 | 60 | Samosa, Cricket, Diwali |
| Medium | 120 | 60 | 60 | Dhokla, Antakshari, Onam |
| Hard | 120 | 60 | 60 | Kathakali, Ganjifa, Rani ki Vav |

Mixed combines the Indian and Classic entries; it is not an additional set of words. Difficulty is an editorial estimate and depends on the group's familiarity with regional names and topics.

- [Full word bank, accepted alternatives, and research sources](docs/word-bank.md)
- [JSON export](public/word-bank.json), also served at `/word-bank.json`
- [Canonical word data and option definitions](src/data/words.ts)

Indian selections were informed by official Incredible India food, festival, art, and games references, and UNESCO's Indian heritage listings. The full reference list is included in the word-bank document.

### Update the words

1. Edit `src/data/words.ts`. Every entry has a category, difficulty, and pack; accepted alternatives are curated explicitly.
2. Regenerate the readable bank and JSON export:

   ```bash
   npm run words:export
   ```

3. Run `npm test` to check bank integrity, selection, and answer matching. If intentionally changing the bank size, update the expected counts in `tests/word-bank.test.ts` and this README.

Guesses ignore case, extra spaces, accents, and hyphen differences. Exact words and listed alternatives are accepted; arbitrary typos and partial guesses are not.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build production assets into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run the Vitest test suite |
| `npm run test:watch` | Run tests while editing |
| `npm run words:export` | Generate the word-bank document and JSON |

The test suite covers player limits, dealing, voting, win conditions, last-chance guesses, secret-word visibility, persistence, difficulty filtering, regional alternatives, and replay preferences.

## Project structure

```text
src/
  components/     Shared layout, controls, and secret cards
  data/words.ts   Word bank, difficulties, packs, and accepted alternatives
  game/           Game engine, reducer, word selection, voting, and persistence
  pages/          Intro, setup, handoffs, rounds, voting, and results
  lib/            Optional Supabase client and game history
  types/          Game and setup types
public/
  video.mp4       Portrait intro video used by the app
  word-bank.json  Generated export of the playable word bank
docs/
  word-bank.md    Readable word bank and research references
scripts/
  export-word-bank.mjs
tests/            Vitest tests for gameplay and word selection
```

Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion.

## Optional Supabase history

Leave Supabase unconfigured for local-only play. To enable the existing history integration, copy `.env.example` to `.env.local` and provide:

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
```

The integration expects `games` and `game_players` tables and `game_stats` / `word_stats` RPC functions. Database migrations are not included in this repository; configure the schema and appropriate Row Level Security policies separately. Missing configuration or failed history requests do not block the game.

When configured, completed-game history includes player names, roles, results, and the revealed secret word. Keep `.env.local` out of Git. Only a public/publishable client key belongs in `VITE_*` variables; never use a service-role key or database password.

## Production build

```bash
npm ci
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static web host. Keep `video.mp4` and the generated assets available at their built paths. The current asset paths assume the app is hosted at the domain root; subdirectory hosting requires adjusting the base and public-asset URLs.
