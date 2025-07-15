export const CONTACT_EMAIL = "shahwaizislam1404@gmail.com";

export const URLS = {
  BUY_ME_COFFEE: "https://buymeacoffee.com/coderxyz14",
} as const;

export const SOCIAL_LINKS = {
  twitter: "https://x.com/coderxyz14",
  github: "https://github.com/CoderXYZ14",
  linkedin: "https://www.linkedin.com/in/shahwaiz-islam/",
  email: `mailto:${CONTACT_EMAIL}`,
  calendly: "https://calendly.com/shahwaizislam1404/30min",
} as const;

export const LOGO_LINKS = {
  logo: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0f0ff" />
    </radialGradient>
    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00c6ff"/>
      <stop offset="50%" stop-color="#1A69DD"/>
      <stop offset="100%" stop-color="#8a2be2"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#ringGradient)" />
  <circle cx="50" cy="50" r="25" fill="url(#innerGlow)" />
</svg>`,
} as const;
