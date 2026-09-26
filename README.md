# Effective Tourism

A travel agency landing page: excursion cards with a live countdown timer and a real-time spots-remaining counter, a photo gallery, a registration form with client-side validation, a hero section with a scroll-synced frame-by-frame animation, UA/EN language switching, and light/dark theme support.

**Demo:** just open `index.html` in a browser — no backend required.

## Stack

Plain HTML/CSS/JS — no build step, no frameworks, no dependencies. This is intentional: it keeps the code simple to hand off or migrate to WordPress or any other CMS later.

## Features

- **Canvas-based hero animation**: instead of a `<video>` element, a sequence of frames is drawn on a `<canvas>` based on scroll position. Scrubbing `video.currentTime` turned out to be unreliable across browsers (visible stutter), so frames are rendered directly instead — this stays smooth regardless of device or hosting.
- **Live spots counter and offer countdown** for each excursion, with automatic "sold out" / "offer expired" states on the card.
- **Form validation**: name accepts letters only (any alphabet) with live auto-capitalization, phone number gets a live `+380 (XX) XXX-XX-XX` mask, and the comment field is sanitized against XSS.
- **i18n**: one-click UA/EN switching, all interface strings live in `js/i18n.js`.
- **Light/dark theme** with the choice remembered.
- Responsive layout, optimized images, lazy-loaded gallery.

## Demo mode (no backend)

This is the public portfolio version of the project, and it intentionally ships without a backend. The registration form doesn't send a network request — instead, after filling it out, it shows a preview of what the message would look like in the site owner's Telegram bot in the production version. "Taken spots" are stored in the browser's `localStorage` purely for the UX demo — reloading in a private window or a different browser resets them back to available.

In the real production project (not part of this repository), the same front end is wired up to a small PHP backend: submissions atomically reserve spots on the server (protecting against overselling on simultaneous requests) and are delivered to the owner's Telegram bot, with rate limiting and Origin/Referer checks against spam.

## Structure

```
index.html
css/            variables · base · layout · components · animations
js/             data (excursions) · i18n · render · form · spots · gallery · theme · timer · main
assets/
  images/       excursion and gallery photos
  videos/frames/ hero animation frames
  fonts/        self-hosted fonts
```

To add or change an excursion, edit only the `EXCURSIONS` array in `js/data.js` (each field is documented in a comment right there).
