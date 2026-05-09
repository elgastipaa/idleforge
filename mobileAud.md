/goal Perform a full mobile-first UI/UX audit of the entire game and produce a prioritized improvement plan. Do not implement changes yet unless the issues are tiny and obviously safe.

Context:
The game is already fairly advanced and the current direction feels good, but there are still many UI/UX opportunities across the whole app, especially on mobile. Previous playtest feedback showed that new players can feel overwhelmed by too many cards, too much text, too many visible locked options, and unclear next actions.

Important hypothesis to evaluate:
Currently, expedition Vigor usage may be shown as a separate card/control with a check such as “Use Vigor”. This may add clutter. One possible alternative is to integrate Vigor cost directly into the expedition action/claim flow, similar to a button state like:
- “Claim”
- “Claim • Use 1 Vigor”
- “Start Expedition • 1 Vigor”
or another clearer mobile-friendly pattern.
Do not blindly implement this. Evaluate whether it is better than the current design and propose the best solution.

Main objective:
Audit the entire app, not only the main expedition tab, and identify UI/UX improvements that make the game clearer, more compact, more polished, and easier to play on mobile.

Scope:
- All tabs/screens/routes/components in the app.
- Mobile viewports are the priority:
  - 360px
  - 390px
  - 430px
- Also sanity-check tablet/desktop, but do not optimize desktop at the expense of mobile.
- Focus on actual player experience, not just code cleanliness.

Audit areas:
1. First-time player clarity
   - Is the next action obvious?
   - Is the player overloaded with choices or text?
   - Are locked/unavailable things shown too early?
   - Does the game teach by doing rather than explaining?

2. Action hierarchy
   - Is there one dominant CTA per state?
   - Are primary, secondary, and disabled actions visually distinct?
   - Are there buttons/cards competing for attention?
   - Are “Dismiss”, “Use Vigor”, “Next Call/Next Step”, claim buttons, upgrade buttons, etc. fighting each other?

3. Vigor UX
   - Evaluate the current “Use Vigor” interaction.
   - Decide whether Vigor should be a separate card, checkbox/toggle, inline button cost, badge, confirmation state, or contextual message.
   - Propose the cleanest mobile-first solution.
   - Make sure the player understands cost without adding clutter.

4. Expedition UX
   - Is it obvious which expedition can be started, claimed, repeated, or is locked?
   - Are rewards, duration, success/failure, and requirements clear without walls of text?
   - Is the claim/result screen compact enough on mobile?
   - Are reward cards too large or repetitive?

5. Layout density and scanning
   - Find cards that are too tall, too text-heavy, redundant, or visually similar.
   - Identify places where content should be collapsed, hidden, grouped, or moved behind progressive disclosure.
   - Check whether important actions are visible without excessive scrolling.

6. Navigation and tab structure
   - Are tabs named clearly?
   - Are there too many destinations too early?
   - Does the player know where to go next?
   - Are important alerts/badges useful or noisy?

7. Progression and locked content
   - Are locked regions/items/upgrades/classes shown in a useful way?
   - Should some locked content be hidden until closer to unlock?
   - Are unlock requirements clear and motivating rather than overwhelming?

8. Visual polish
   - In dark mode, check contrast, button colors, card borders, muted text, hover/active states, and disabled states.
   - Identify inconsistent spacing, typography, icon usage, badges, shadows, borders, and color semantics.
   - Look for components that feel visually heavier than their importance.

9. Mobile ergonomics
   - Are touch targets large enough?
   - Are sticky/bottom actions needed anywhere?
   - Are important actions reachable with thumb?
   - Are modals/sheets/cards usable on 360px width?
   - Are long cards causing fatigue?

10. Empty, loading, disabled, and error states
   - Are they clear and compact?
   - Do they explain what the player can do next?
   - Are disabled states useful or just frustrating?

Required output:
Create a new document:
docs/mobile_ux_audit.md

The document must include:
1. Executive summary
   - The top 5 UI/UX problems hurting clarity or polish.

2. Current UX diagnosis
   - What the app currently does well.
   - Where it creates confusion or friction.

3. Screen-by-screen audit
   - For each major screen/tab/component:
     - Problems found.
     - Why they matter.
     - Recommended improvement.
     - Expected player impact.
     - Implementation risk.

4. Vigor interaction recommendation
   - Compare at least 3 possible patterns:
     - Current separate “Use Vigor” card/control.
     - Inline cost in the main CTA.
     - Contextual cost badge/message near the CTA.
     - Any other better pattern you find.
   - Choose one recommended approach and explain why.

5. Prioritized improvement backlog
   - Group improvements into:
     - Quick wins
     - Medium improvements
     - Larger redesigns
   - For each item include:
     - Description
     - Affected files/components
     - Expected impact
     - Implementation risk
     - Suggested acceptance criteria

6. Mobile viewport checklist
   - Specific checks for 360px, 390px, and 430px widths.
   - Note where content overflows, becomes dense, or requires excessive scrolling.

7. Proposed implementation plan
   - Phase 1: safest high-impact UI/UX fixes
   - Phase 2: structural improvements
   - Phase 3: polish and refinement

Constraints:
- Do not rewrite the app architecture.
- Do not implement major changes during this audit.
- Do not remove game systems.
- Prefer progressive disclosure over adding more explanatory text.
- Prefer fewer, clearer actions over more controls.
- Preserve current functionality.
- Be specific. Avoid generic advice like “improve spacing” unless you name exactly where and how.
- Use the actual current codebase. Do not invent screens/components that do not exist.

After writing docs/mobile_ux_audit.md, print a concise summary in the terminal with:
- Top 5 recommendations
- The recommended Vigor UX pattern
- The safest first implementation batch