# Character artwork contract

The base character and all ear variants are cut directly from the user's reference sheet (`views/*.png`): one column per ear type (human, dog, cat, bear, bunny), three views each (front, side, back), on a shared 256 × 360 transparent canvas with feet bottom-aligned. Only the background is removed; the artwork is not redrawn.

The base (no ear option selected) uses the plain character column. Ear options swap the whole character sprite for that view, so exactly one character is drawn and ears never duplicate. The "left" view mirrors the side view.

Hair, face, outfit and accessory files are dashed-outline placeholders, shown only in the front view, until real artwork is supplied. No crochet rules exist for this base; generation stays blocked.
