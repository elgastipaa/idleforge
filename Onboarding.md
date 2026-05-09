/goal Improve the new-player onboarding and reduce early-game information overload based on playtest feedback.

Context:
Playtesters understood the class selection screen clearly, but after choosing a class and entering the main game they felt overwhelmed. The screen shows too much text, too many cards, too many concepts, and too many locked regions. Players did not immediately understand what the game is about, where to click, what the next expedition is, or what systems like Vigor mean. The “Next Call”/next action exists, but it competes visually with other UI elements such as dismissible banners, vigor explanations, multiple cards, and a long list of locked regions.

Main objective:
Make the first 3 minutes of gameplay extremely focused and obvious. The player should always understand the next single action without reading a lot.

Tasks:
1. Audit the current post-class-selection screen and identify all UI elements shown to a brand-new player.
2. Reduce the initial screen to one primary action: starting the first expedition.
3. Make the primary CTA visually dominant and unambiguous.
4. Hide or heavily reduce locked regions during the early game. Do not show a long list of unavailable regions to level 1 players. Show only currently available regions, plus optionally one small hint that more regions unlock later.
5. Reduce tutorial/explanation text. Replace long explanatory cards with short contextual guidance, ideally one sentence at a time.
6. De-emphasize Vigor during the first screen. Keep the system functional, but do not explain it with a large card unless the player runs out of vigor or directly interacts with it.
7. Remove, delay, or visually downplay dismissible banners that compete with the main CTA during the first-time experience.
8. Implement a simple guided “Next Step” system for the first few actions:
   - Start first expedition
   - Claim first reward
   - Upgrade or inspect hero
   - Start next expedition
9. Ensure the mobile layout stays compact. On 360px, 390px, and 430px widths, the first screen should not feel like a wall of cards.
10. Preserve the existing game systems and avoid large rewrites unless necessary. This is primarily a UX/onboarding simplification pass.

Design principles:
- Show fewer choices early.
- Explain systems only when they become relevant.
- One primary action per screen state.
- Avoid walls of text.
- Avoid showing unavailable content too early.
- The player should learn by doing, not by reading.

Acceptance criteria:
- A new level 1 player sees a clear first expedition CTA without needing to scroll.
- Locked regions are not shown as a huge list in the initial experience.
- Vigor is not presented as a confusing major concept before it matters.
- The first mobile viewport feels focused and not overloaded.
- The user can complete the first expedition and claim rewards with minimal reading.
- Existing functionality still works after the refactor.
- Add or update docs with the onboarding design decisions so future agents do not reintroduce early-game clutter.

After implementing, write a short summary in docs/onboarding_simplification_report.md explaining:
- What was removed or hidden from the first-time experience.
- What the new first-player flow is.
- Any tradeoffs made.
- Suggestions for future onboarding improvements.


