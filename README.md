# SimplyStitch

SimplyStitch lets you design a soft toy in the browser and get a crochet pattern that matches exactly what you made. You choose the body, face, ears, tail and yarn colours, watch the character update in 3D, then generate a written amigurumi pattern and keep it in your own library.

No account, no login, no server. Every design and every saved pattern is stored in the browser on the device you used, so the app works offline and nothing is uploaded anywhere.

## The journey

| Address | What it does |
| --- | --- |
| `/` | Landing page: what the app is and how it works, with a button into the customizer |
| `/customize` | The editor — 3D preview on one side, choices on the other |
| `/pattern` | Pattern review — the generated draft before you commit to it |
| `/my-patterns` | Your saved pattern library |
| `/my-patterns/:id` | Reader for one saved pattern |
| `/profile` | Account page |

Design → review → save → read. Saving from the review step drops the pattern into your library, where it can be renamed, reopened in the editor, downloaded, or read section by section.

## What the customizer does today

**3D preview.** The doll is drawn live with three.js rather than illustrated per choice, so every combination of shape, length and colour renders without new artwork. The head, torso and legs form one continuous surface, so parts meet without visible seams. A pose button in the corner of the viewer lowers the arms so you can check the doll from the front, and the camera refits itself as the character grows or shrinks.

**Body.** Sub-tabs for Head, Torso, Arms, Legs and Paws. Torso, arms and legs each have a length slider from 100% to 170%, and the pattern's round counts stretch to match — a longer body really does mean more rounds. Paws give the left hand, right hand, left foot and right foot their own colour, so a doll can have mismatched socks or one dark paw.

**Face.** Sub-tabs for Eyes, Eyebrows, Nose, Mouth and Cheeks. Eye style (open or sleepy), nine brow shapes, nose (teddy bear, cat, round), mouth (X, cat three, smile), whiskers, and blush in round or small oval — each with its own yarn, and the left and right cheek or eye can differ. Cheeks and whiskers are mutually exclusive so a doll never has both.

**Ears and tail.** Ears: Monkey, Dog, Cat, Bear or Bunny, each with its own crochet rules and its own left/right yarn. Tail: Round or Long, with its own yarn. Choosing none is allowed for both.

**Colour.** 25 yarns in five groups — creams and neutrals, browns, fox and autumn tones, pastels, woodland and muted colours — plus three dedicated blush shades. One palette sits below the current choice and recolours the part you have selected. Individual parts fall back sensibly: a paw with no colour of its own uses the shared hand or foot colour, and if that is unset it uses the body colour, so nothing disappears when you change one thing.

**Randomize and Reset.** The dice button rolls a fresh character — colours, features, ears, tail and all three lengths — so you can start from something unexpected instead of a blank doll. Reset returns to the base character.

## What the pattern does today

`generateDollPattern` turns the current character into a written pattern, not a generic template:

- **Sections that match the doll** — Head, Legs, Body (worked continuously from the legs), Arms, then ears, tail and blush only if the doll has them.
- **Symmetry aware** — identical left and right parts come out as one section marked *make 2*. Different colours split into separate *Left* and *Right* sections, each with its own yarn.
- **Length aware** — arm, leg and torso lengths change the round counts and renumber the body rounds, so the written pattern still describes the doll on screen.
- **Materials list** — the yarns actually used, plus what the eyes and embroidery need.
- **Assembly and embroidery notes** — eye and brow placement by round, nose and mouth position, whiskers, where the blush and ears sew on, and a standing reminder that *left and right refer to the doll's own sides*.

## Reading a saved pattern

The reader is built for a phone propped next to the yarn: a contents list, collapsible sections, round ticks so you can see how far through a section you are, and reading progress that persists on the device. Any section can be rewritten with the pencil icon — your wording is kept, and the rest of the pattern is untouched. Saved patterns can be renamed, reopened in the editor with the design restored, or downloaded.

The first visit to a device seeds one example, **Berry Bunny (example)**, so the library is never empty. Delete it and it stays deleted.

## Not here yet

- **No accounts or cloud sync.** Patterns live in one browser, so they do not follow you to another device or survive a cleared cache.
- **Some customizations are placeholders.** Long hair, freckles, vest, scarf and bow appear in the registry for preview, but have no crochet rules yet and are not written into patterns.
- **No payments, no sharing between people.**

## Development

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev        # http://localhost:8080
npm test           # 116 tests
```

## Built with

- TanStack Start (React 19) with TypeScript
- Tailwind CSS v4
- three.js with @react-three/fiber and @react-three/drei
- Radix UI primitives, lucide-react icons, sonner for notices
- Vitest for tests

## Keeping the code in GitHub

This project is built in [Lovable](https://lovable.dev). Connect it to GitHub from **Project settings → Git** and every change made in Lovable is committed straight to your repository; pushes back to that repository sync into Lovable. Prefer the files locally? Use **Project settings → Git → Download codebase**.
