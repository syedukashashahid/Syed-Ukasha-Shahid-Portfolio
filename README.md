# Syed Ukasha Shahid — Portfolio (plain HTML, CSS and JavaScript)

The same website as the Astro project, split into ordinary files. It has no build step, no Node.js and no npm.

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

## How to open it

**Option 1: VS Code with Live Server (recommended)**

1. In VS Code, use **File → Open Folder** and choose `portfolio-website`.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

**Option 2: double-click `index.html`**

The site opens and works. Some browsers limit pages opened straight from disk, though, so use Option 1 to check it properly.

**Option 3: from a terminal**

- With Python: run `python -m http.server 8000` in this folder, then open `http://localhost:8000`.
- With Node.js: run `npx serve .` instead.

## Putting it online

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

## Contact form

Until you connect an email service, the form tells visitors that online sending isn't set up. It then offers to open their email app with the message filled in. It never claims a message was sent.

To make it send for real with **Web3Forms** (free):

1. Go to https://web3forms.com, enter `u128413@gmail.com`, and copy the access key they email you.
2. In `index.html`, find the `<form class="cform"` tag and change it so it starts like this:

   ```html
   <form class="cform" novalidate data-contact-form data-provider="web3forms" data-web3forms-key="YOUR-ACCESS-KEY"
   ```

3. In the same form, replace the sentence in `<p class="cform__note" id="cform-note">` with: `Your message goes straight to my inbox.`

To use **Formspree** instead, set `data-provider="formspree"` and `data-formspree="https://formspree.io/f/your-form-id"`.

## After deploying

Once you have a web address, change `og-image.jpg` in the `og:image` and `twitter:image` tags to the full address, for example `https://your-site.com/og-image.jpg`. Link previews on LinkedIn and WhatsApp need the full address to show the image.
