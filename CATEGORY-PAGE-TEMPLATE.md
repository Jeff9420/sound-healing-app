# Category Page Template Guide

This template is based on the successful Rain Sounds and Meditation Music pages. Use this to create the remaining 7 category pages.

## File Structure
```
pages/[category-name]/
└── index.html
```

## Template Structure (All pages should be 1500+ words)

### 1. Head Section Components
```html
<!-- Primary Meta Tags -->
<title>[Category Name] for [Primary Benefit] | [Number] Free Tracks | Sound Healing Space</title>
<meta name="description" content="Free [category] for [benefit 1], [benefit 2] & [benefit 3]. [Number] HD [category type] tracks: [example 1], [example 2], [example 3]. Perfect for [use case 1], [use case 2] & [use case 3]. Listen now!">
<meta name="keywords" content="[primary keyword],[secondary keyword],[long-tail keyword 1],[long-tail keyword 2],...">
<link rel="canonical" href="https://www.soundflows.app/pages/[category-slug]/">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.soundflows.app/pages/[category-slug]/">
<meta property="og:title" content="[Same as title but slightly shorter]">
<meta property="og:description" content="[Same or condensed version of meta description]">
<meta property="og:image" content="https://www.soundflows.app/assets/images/[category]-og.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://www.soundflows.app/pages/[category-slug]/">
<meta name="twitter:title" content="[Same as OG title]">
<meta name="twitter:description" content="[Same as OG description]">
<meta name="twitter:image" content="https://www.soundflows.app/assets/images/[category]-twitter.jpg">

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MusicPlaylist",
  "name": "[Category Name] Collection",
  "description": "[Number] professional [category type] tracks for [primary benefits]",
  "numTracks": [NUMBER],
  "genre": ["[Genre 1]", "[Genre 2]", "[Genre 3]"],
  "inLanguage": "en",
  "publisher": {
    "@type": "Organization",
    "name": "Sound Healing Space",
    "url": "https://www.soundflows.app"
  }
}
</script>
```

### 2. Body Structure

#### Hidden SEO H1
```html
<h1 style="position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;">
    [Category Name] for [Primary Benefit], [Secondary Benefit] & [Tertiary Benefit] - [Number] Free High-Quality Tracks
</h1>
```

#### Header Section
```html
<header style="max-width: 960px; margin: 40px auto 24px; text-align: center; padding: 0 16px;">
    <h2 style="font-size: 2.4rem; margin-bottom: 12px;">[Emoji] [Category Name] for [Primary Benefit]</h2>
    <p style="font-size: 1.05rem; color: #b6c8e5; max-width: 660px; margin: 0 auto;">
        [Engaging description of what makes this category special - 2-3 sentences]
    </p>
</header>
```

### 3. Main Content Sections (Order & Structure)

#### Section 1: What Makes [Category] Effective?
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">What Makes [Category Name] Effective?</h3>
    <p style="line-height: 1.7; color: #c3d4f2;">
        [Scientific/experiential explanation of why this sound category works - Include statistics if possible]
    </p>
</section>
```

#### Section 2: Benefits
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">Benefits of [Category Name]</h3>
    <ul style="line-height: 1.8; color: #c3d4f2; padding-left: 20px;">
        <li><strong>[Benefit 1 Title]:</strong> [Description with specific outcomes]</li>
        <li><strong>[Benefit 2 Title]:</strong> [Description with specific outcomes]</li>
        <li><strong>[Benefit 3 Title]:</strong> [Description with specific outcomes]</li>
        <li><strong>[Benefit 4 Title]:</strong> [Description with specific outcomes]</li>
        <li><strong>[Benefit 5 Title]:</strong> [Description with specific outcomes]</li>
    </ul>
</section>
```

#### Section 3: Featured Tracks
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">Featured [Category] Sessions</h3>
    <ul style="line-height: 1.8; color: #c3d4f2; padding-left: 20px;">
        <li><strong>[Track Name 1]:</strong> [Description of what makes it special]</li>
        <li><strong>[Track Name 2]:</strong> [Description of what makes it special]</li>
        <li><strong>[Track Name 3]:</strong> [Description of what makes it special]</li>
        <li><strong>[Track Name 4]:</strong> [Description of what makes it special]</li>
        <li><strong>[Track Name 5]:</strong> [Description of what makes it special]</li>
    </ul>
</section>
```

#### Section 4: How to Use Guide
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">How to Use [Category Name] for [Primary Benefit]</h3>
    <ol style="line-height: 1.8; color: #c3d4f2; padding-left: 20px;">
        <li><strong>[Step 1 Title]:</strong> [Detailed instruction]</li>
        <li><strong>[Step 2 Title]:</strong> [Detailed instruction]</li>
        <li><strong>[Step 3 Title]:</strong> [Detailed instruction]</li>
        <li><strong>[Step 4 Title]:</strong> [Detailed instruction]</li>
        <li><strong>[Step 5 Title]:</strong> [Detailed instruction]</li>
    </ol>
</section>
```

#### Section 5: CTA (Call to Action)
```html
<section style="margin-bottom: 48px; text-align: center;">
    <h3 style="font-size: 1.7rem; margin-bottom: 20px;">[Action-oriented heading]</h3>
    <p style="line-height: 1.7; color: #c3d4f2; margin-bottom: 24px;">
        Access all [number] [category] tracks plus 200+ additional healing audios inside the main Sound Healing Space app.
    </p>
    <a href="../../index.html?category=[URL-parameter]" style="display: inline-flex; align-items: center; gap: 10px; background: #7db5ff; color: #051421; padding: 16px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 1.1rem;">
        🎧 Play [Category] Collection Now
    </a>
</section>
```

#### Section 6: Types/Variations (Optional)
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">Types of [Category] We Offer</h3>
    <ul style="line-height: 1.8; color: #c3d4f2; padding-left: 20px;">
        <li><strong>[Type 1]:</strong> [Description]</li>
        <li><strong>[Type 2]:</strong> [Description]</li>
        <li><strong>[Type 3]:</strong> [Description]</li>
        <li><strong>[Type 4]:</strong> [Description]</li>
    </ul>
</section>
```

#### Section 7: Related Pages
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">Continue Your Healing Journey</h3>
    <ul style="line-height: 1.8; color: #c3d4f2; padding-left: 20px;">
        <li><a href="../[related-category-1]/" style="color: #8ea8ff; text-decoration: none;">[Emoji] [Related Category 1]</a> - [Brief description]</li>
        <li><a href="../[related-category-2]/" style="color: #8ea8ff; text-decoration: none;">[Emoji] [Related Category 2]</a> - [Brief description]</li>
        <li><a href="../[related-category-3]/" style="color: #8ea8ff; text-decoration: none;">[Emoji] [Related Category 3]</a> - [Brief description]</li>
        <li><a href="../faq/" style="color: #8ea8ff; text-decoration: none;">❓ FAQ</a> - Common questions</li>
    </ul>
</section>
```

#### Section 8: FAQ (Category-Specific)
```html
<section style="margin-bottom: 48px;">
    <h3 style="font-size: 1.7rem; margin-bottom: 12px;">[Category Name] FAQ</h3>

    <div style="margin-bottom: 20px;">
        <h4 style="color: #b6c8e5; margin-bottom: 8px;">[Question 1 related to category]?</h4>
        <p style="line-height: 1.7; color: #c3d4f2;">
            [Answer with specific details and benefits]
        </p>
    </div>

    <div style="margin-bottom: 20px;">
        <h4 style="color: #b6c8e5; margin-bottom: 8px;">[Question 2 related to category]?</h4>
        <p style="line-height: 1.7; color: #c3d4f2;">
            [Answer with specific details and benefits]
        </p>
    </div>

    <div style="margin-bottom: 20px;">
        <h4 style="color: #b6c8e5; margin-bottom: 8px;">[Question 3 related to category]?</h4>
        <p style="line-height: 1.7; color: #c3d4f2;">
            [Answer with specific details and benefits]
        </p>
    </div>
</section>
```

#### Footer
```html
<footer style="text-align: center; padding: 24px; opacity: 0.6; font-size: 0.85rem;">
    <p>© 2025 Sound Healing Space · Free [category] for [primary benefit]</p>
    <p style="margin-top: 8px;">
        <a href="../../index.html" style="color: #8ea8ff; text-decoration: none;">Home</a> ·
        <a href="../../content/blog/" style="color: #8ea8ff; text-decoration: none;">Blog</a> ·
        <a href="../faq/" style="color: #8ea8ff; text-decoration: none;">FAQ</a>
    </p>
</footer>
```

---

## Remaining 7 Pages to Create

### 1. Singing Bowl Sounds (61 tracks)
- **Slug**: `singing-bowls`
- **Keywords**: singing bowl sounds, tibetan bowls, crystal bowls, sound bath, frequency healing
- **Benefits**: Energy balancing, deep meditation, chakra alignment, stress relief, sound bath experience
- **CTA URL**: `../../index.html?category=Singing bowl sound`

### 2. Chakra Healing (7 tracks)
- **Slug**: `chakra-healing`
- **Keywords**: chakra healing music, energy healing, chakra balancing, root chakra, crown chakra
- **Benefits**: Energy center balancing, spiritual awakening, emotional healing, vitality boost
- **CTA URL**: `../../index.html?category=Chakra`

### 3. Hypnosis Audio (70 tracks - MOST CONTENT)
- **Slug**: `hypnosis`
- **Keywords**: guided hypnosis, hypnotherapy audio, subconscious reprogramming, self-hypnosis
- **Benefits**: Habit change, confidence building, anxiety reduction, sleep improvement, goal achievement
- **CTA URL**: `../../index.html?category=hypnosis`

### 4. Subconscious Therapy (11 tracks)
- **Slug**: `subconscious-therapy`
- **Keywords**: subconscious mind healing, deep therapy audio, mind reprogramming, limiting beliefs
- **Benefits**: Deep pattern change, trauma healing, belief transformation, mental clarity
- **CTA URL**: `../../index.html?category=Subconscious Therapy`

### 5. Animal Sounds (26 tracks)
- **Slug**: `animal-sounds`
- **Keywords**: nature animal sounds, forest sounds, bird sounds, wildlife audio, natural ambience
- **Benefits**: Nature connection, relaxation, focus, biophilia effect, stress reduction
- **CTA URL**: `../../index.html?category=Animal sounds`

### 6. Fire Sounds (4 tracks)
- **Slug**: `fire-sounds`
- **Keywords**: fireplace sounds, crackling fire, campfire audio, cozy fire sounds
- **Benefits**: Cozy atmosphere, winter relaxation, focus, comforting ambience
- **CTA URL**: `../../index.html?category=Fire`

### 7. Running Water (6 tracks)
- **Slug**: `running-water`
- **Keywords**: running water sounds, river sounds, stream sounds, waterfall audio, water white noise
- **Benefits**: Deep sleep, meditation, focus, natural white noise, stress relief
- **CTA URL**: `../../index.html?category=running water`

---

## SEO Best Practices Checklist

For each page, ensure:

- [ ] **Title tag**: 50-60 characters, includes primary keyword and number of tracks
- [ ] **Meta description**: 150-160 characters, includes 3 benefits and call-to-action
- [ ] **Keywords meta**: 15-25 keywords, mix of short-tail and long-tail
- [ ] **Canonical URL**: Points to correct www subdomain
- [ ] **Open Graph tags**: All 5 required tags (type, url, title, description, image)
- [ ] **Twitter Card tags**: All 5 required tags (card, url, title, description, image)
- [ ] **JSON-LD structured data**: MusicPlaylist schema with accurate track count
- [ ] **Hidden H1**: Keyword-rich, 10-15 words, describes full offering
- [ ] **Visible H2**: Engaging, emoji included, focuses on primary benefit
- [ ] **Content length**: 1500+ words minimum
- [ ] **Internal links**: Minimum 4 links to related pages
- [ ] **FAQ section**: Minimum 3 Q&A pairs specific to category
- [ ] **CTA button**: Clear, action-oriented, links to filtered main app
- [ ] **Footer links**: Home, Blog, FAQ
- [ ] **Mobile-responsive**: Uses inline styles with max-width: 960px containers
- [ ] **Consistent styling**: Matches rain-sounds and meditation-music pages

---

## Example: Quick Reference for Singing Bowls Page

**File**: `pages/singing-bowls/index.html`

**Title**: `Singing Bowl Sounds for Deep Meditation | 61 Free Tracks | Sound Healing Space`

**Description**: `Free singing bowl sounds for deep meditation, chakra healing & sound baths. 61 HD Tibetan & crystal bowl tracks: 432Hz tuning, binaural frequencies, energy healing. Perfect for yoga, meditation & spiritual practice. Listen now!`

**Keywords**: `singing bowl sounds,tibetan singing bowls,crystal bowls,sound bath,sound healing therapy,432hz healing,meditation bowls,chakra bowls,healing frequencies,vibrational healing,sound therapy,free singing bowls,bowl meditation`

**H1 (hidden)**: `Singing Bowl Sounds for Deep Meditation, Sound Baths & Chakra Healing - 61 Free High-Quality Tracks`

**H2 (visible)**: `🎵 Singing Bowl Sounds for Deep Meditation & Energy Healing`

**Opening paragraph**:
```
Experience the transformative power of Tibetan and crystal singing bowls. Our curated collection features 61 professionally recorded tracks tuned to healing frequencies (432Hz, 528Hz, chakra-specific tones) that promote deep meditation states, energy balancing, and spiritual awakening. Perfect for sound baths, yoga sessions, and daily mindfulness practice.
```

**CTA Heading**: `Ready to Experience Sound Bath Healing?`

**CTA Link**: `../../index.html?category=Singing bowl sound`

---

## Notes

- All pages should maintain the same visual style (dark gradient background, blue accents)
- Use emojis sparingly and only in H2/H3 headings
- Write in second person ("you") to engage readers
- Include statistics/research when possible (e.g., "Studies show X% improvement in Y")
- Front-load benefits - put most compelling information first
- Use **strong tags** for emphasis on key benefits
- Keep paragraphs short (2-4 sentences max) for readability
- Use numbered lists for step-by-step instructions, bullet lists for features/benefits

---

This template provides a complete framework. When creating new pages, simply copy the structure and customize content for each category's unique characteristics and benefits.
