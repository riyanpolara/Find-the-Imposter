import { mkdirSync, writeFileSync } from 'node:fs'
import { WORD_BANK, DIFFICULTIES, WORD_PACKS, wordsFor } from '../src/data/words.ts'

const sources = [
  ['Indian festivals', 'https://www.incredibleindia.gov.in/en/colours-of-india'],
  ['Indian classical dance forms', 'https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/experiences/art/dance-forms.html'],
  ['Indian arts and crafts', 'https://prod.incredibleindia.gov.in/content/incredible-india-v2/en/experiences/art.html'],
  ['Delhi food', 'https://www.incredibleindia.gov.in/en/delhi/delhi/a-captivating-journey-of-flavours'],
  ['Bihar food', 'https://www.incredibleindia.gov.in/en/bihar/patna/15-must-have-local-dishes-in-patna'],
  ['Kerala food', 'https://www.incredibleindia.gov.in/en/kerala/thiruvananthapuram/what-to-eat-and-where-to-eat-in-thiruvananthapuram'],
  ['Gujarati food', 'https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/destinations/ahmedabad/food-and-cuisine.html'],
  ['Rajasthani food', 'https://www.incredibleindia.gov.in/en/rajasthan/jaisalmer/discover-jaisalmers-culinary-kaleidoscope'],
  ['Ganjifa cards', 'https://www.incredibleindia.gov.in/en/karnataka/ganjifa-cards-of-mysore-karnataka'],
  ['Indian World Heritage sites', 'https://whc.unesco.org/en/statesparties/IN'],
]
const lines = [
  '# Mr. White word bank', '',
  `${WORD_BANK.length} unique playable entries: ${WORD_BANK.filter(w => w.pack === 'india').length} Indian and ${WORD_BANK.filter(w => w.pack === 'classic').length} Classic. Stored locally; choosing a word never calls an online service.`, '',
  '## Choosing a game', '',
  'Choose Easy, Medium or Hard, then Mixed, Indian or Classic in setup step 3. Mixed includes both packs. All civilians receive the same word; Mr. White receives neither the word nor its category. Play Again retains the choices. Older saves default to Easy / Mixed.', '',
  '| Difficulty | Mixed | Indian | Classic |', '| --- | ---: | ---: | ---: |',
  ...DIFFICULTIES.map(d => `| ${d.label} | ${wordsFor({difficulty:d.id,wordPack:'mixed'}).length} | ${wordsFor({difficulty:d.id,wordPack:'india'}).length} | ${wordsFor({difficulty:d.id,wordPack:'classic'}).length} |`), '',
  '## Difficulty criteria', '',
  '- Easy: familiar objects, popular foods, major festivals and well-known places with several obvious clue directions.',
  '- Medium: more specific foods, activities, traditions and places, requiring more deliberate clues.',
  '- Hard: regional names, specialist objects and abstract ideas. Use this level when the group is comfortable with the examples.', '',
  'Difficulty is an editorial game-design estimate, not a rating from the sources. Familiarity differs across regions, languages and age groups. Indian means familiar in Indian life or culture, not necessarily originating exclusively in India. Names use English or common Romanised spellings.', '',
  '## Research references', '',
  'Consulted on 28 September 2026 to check and inspire Indian food, festival, art and landmark selections. These are reference sources, not copied word lists; everyday entries and difficulty assignments were curated for the game.', '',
  ...sources.map(([label,url]) => `- [${label}](${url})`), '',
]
for (const difficulty of DIFFICULTIES) {
  lines.push(`## ${difficulty.label} — ${wordsFor({difficulty:difficulty.id}).length} words`, '')
  for (const pack of WORD_PACKS.filter(p => p.id !== 'mixed')) {
    lines.push(`### ${pack.label}`, '')
    const entries = wordsFor({difficulty:difficulty.id,wordPack:pack.id})
    for (const category of new Set(entries.map(w => w.category))) {
      lines.push(`**${category}**`, '', entries.filter(w => w.category === category).map(w => w.word).join(', ') + '.', '')
    }
  }
}
lines.push('## Accepted alternative answers', '',
  'Guesses ignore case, extra whitespace, accents and hyphen differences. Only the exact word or an explicit alternative below is accepted; partial words, unrelated answers and arbitrary misspellings are rejected.', '',
  '| Displayed word | Also accepted |', '| --- | --- |',
  ...WORD_BANK.filter(w => w.aliases.length).map(w => `| ${w.word} | ${w.aliases.join(', ')} |`), '',
  '## Maintenance', '',
  'Edit src/data/words.ts, then run node scripts/export-word-bank.mjs to refresh this document and public/word-bank.json. The JSON export contains every word, category, difficulty, pack and accepted alias.', '')
mkdirSync(new URL('../docs/', import.meta.url), {recursive:true})
writeFileSync(new URL('../docs/word-bank.md', import.meta.url), lines.join('\n'))
writeFileSync(new URL('../public/word-bank.json', import.meta.url), JSON.stringify({version:1,words:WORD_BANK},null,2)+'\n')
console.log(`Exported ${WORD_BANK.length} entries; ${WORD_BANK.filter(w=>w.pack==='india').length} Indian words.`)
