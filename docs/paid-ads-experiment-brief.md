# Paid Ads Experiment Brief

## Meta Ads (Facebook/Instagram)
- **Objective:** Traffic to meditation landing page.
- **Audience:** English-speaking, age 24-45, interests in meditation apps, Calm, Headspace, yoga, mindfulness.
- **Creative Concept:** Carousel showcasing 3 ambient scenes.
- **Primary Text:** "Reset between meetings with immersive meditation rooms. Stream 200+ tracks for free." 
- **Headline:** "Meditation Playlist Upgrade" 
- **Description:** "Instant access on web + mobile." 
- **CTA Button:** "Learn More" → `https://soundflows.app/pages/meditation/`
- **Budget:** $200 test over 10 days ($20 learning phase, $5/day afterwards).

## Google Search Ads
- **Campaign:** Exact/phrase match long-tail keywords.
- **Ad Group 1:** "rain sounds for sleep", "fall asleep to rain" → direct to `/pages/rain-sounds/`.
- **Ad Copy:** 
  - Headline 1: "Free Rain Sound Library" 
  - Headline 2: "Sleep Deeper Tonight" 
  - Description: "Stream studio-quality rain ambience + sleep timers. No downloads required." 
- **Budget:** $15/day for 14 days.
- **Extensions:** Sitelinks to `/pages/hypnosis/`, `/pages/nature-sounds/`, `/content/blog/meditation-routine-checklist.html`.

## Measurement Plan
- Install GA4 events: `session_play`, `cta_click`, `newsletter_optin`.
- Track Meta Pixel + Google Ads conversion (once IDs available).
- Build Looker Studio dashboard combining GA4 + ad spend.

## Timeline
- Week 3 of content calendar: launch Meta ads once landing pages show baseline organic traffic.
- Week 4: Activate Search ads, compare CPC & conversion rates.
- Week 5: Evaluate; scale winning creative to $30/day or pause.

## Notes
- Ensure privacy disclosures updated (add Pixel notice in privacy policy).
- Use UTM parameters: `utm_source=meta&utm_medium=paid&utm_campaign=meditation_launch` etc.
- Store creative files in `/ads/assets/` for collaboration.
