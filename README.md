# Syed Ukasha Shahid — Portfolio (plain HTML, CSS and JavaScript)


## Files

```
portfolio-website/
├── index.html            All page content and structure
├── css/
│   └── style.css         All styling (colours, fonts, layout, every section)
├── js/
│   ├── motion-flag.js    Tiny script in <head>: switches intro animations on before the page paints
│   ├── main.js           All behaviour: menu, animations, scroll effects, tabs, contact form, GitHub list
│   └── vendor/           Libraries main.js needs (do not edit)
│       ├── gsap.min.js
│       ├── ScrollTrigger.min.js
│       └── lenis.min.js
├── fonts/                Archivo, Newsreader and JetBrains Mono (self-hosted)
├── images/               Portrait and project screenshots in AVIF, WebP and PNG/JPG at several sizes
├── cv/                   Syed-Ukasha-Shahid-CV.pdf (the Download CV buttons link here)
├── favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
├── og-image.jpg          Preview image shown when the link is shared
├── site.webmanifest
└── robots.txt
```
## Live sites

All of these are free:

- **Netlify:** go to https://app.netlify.com/drop and drag the `portfolio-website` folder onto the page.
- **Vercel or Cloudflare Pages:** upload the folder as a static site. There is no build command.
- **GitHub Pages:** push the folder's contents to a repository, then go to **Settings → Pages** and deploy from the main branch.

## Editing

**Text** (projects, skills, education, contact details): edit `index.html`.

- Each section is easy to find:
  - `<section id="about">`
  - `<article class="plate plate--cs">` (CyberShield)
  - `plate--cc` (Campus Café)
  - `plate--bus` (Bus Management System)
  - `plate--sh` (Shineo)
  - `<section id="skills">`
  - `<section id="education">`
  - `<section id="contact">`
- Contact details also appear in the footer, the mobile menu and the structured data at the top of the file (`application/ld+json`). Update every copy.

**Colours and fonts:** edit the variables at the top of `css/style.css`, under `:root`.

| Variable | What it controls |
| --- | --- |
| `--ink` | Near-black background |
| `--paper` | Light background |
| `--guide` | The blue accent |

**CV:** replace `cv/Syed-Ukasha-Shahid-CV.pdf` with a new PDF of the same name.

**Animations:** `js/main.js` is readable and commented by section. For example, search for `src/scripts/cinematic.ts` to find the scroll scenes.



<!-- To make it send for real with **Web3Forms** (free):

1. Go to https://web3forms.com, enter `syedukashashahid@gmail.com`, and copy the access key they email you.
2. In `index.html`, find the `<form class="cform"` tag and change it so it starts like this:

   ```html
   <form class="cform" novalidate data-contact-form data-provider="web3forms" data-web3forms-key="YOUR-ACCESS-KEY"
   ```

3. In the same form, replace the sentence in `<p class="cform__note" id="cform-note">` with: `Your message goes straight to my inbox.`

To use **Formspree** instead, set `data-provider="formspree"` and `data-formspree="https://formspree.io/f/your-form-id"`. -->
