# Stitch Resonance Loop Handoff

## Purpose

This folder contains visual and HTML references exported from Stitch.

The files are design references only. They are not production-ready source
code and must not replace the existing Let’s Collect application.

## Source of truth

Use:

- screen.png for visual hierarchy, spacing, composition, and interaction intent
- code.html for approximate typography, dimensions, card radius, padding,
  and component structure
- the existing repository for real routes, real toy assets, business logic,
  state management, Supabase integration, and design tokens

## Echo states

1. echo_discover
   Potential Resonance. Users browse recommended collectors horizontally.

2. echo_send_interaction
   Preset Echo interaction sheet.

3. echo_pending
   Echo has been sent and is waiting for a response.

4. resonance_formed
   Both users have responded and a mutual Resonance is created.

5. echo_my_echoes
   Overview of established Resonances and pending Echoes.

6. resonance_space_mia
   Dedicated shared relationship space containing:
   - Why You Resonated
   - current collaborative mission
   - individual progress
   - lightweight interactions
   - shared history
   - reward state

## Important product rules

- Horizontal swiping only browses recommendations.
- It is not a like or reject gesture.
- Before a mutual Echo, show traits only.
- Do not show collaborative missions before Resonance is formed.
- Do not add free-text chat.
- Do not add followers, likes, or popularity metrics.
- All social interactions must remain connected to toys and collections.
- Use real toys from the existing application, not Stitch placeholder images.
- Preserve the existing Collect, Cabinet, and Echo navigation.
- Mission rewards must not be claimable more than once.

## MVP mission

Cabinet Exchange

Each collector chooses one favorite toy from the other collector’s Cabinet.

Reward: 6 special-series tickets.