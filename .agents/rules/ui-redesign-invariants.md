# Rule: UI-Only Redesign - Zero Functional Mutation

## Invariant Principles
1. **Separation of Presentation and Logic**:
   - Application logic, Supabase integration, authentication, RBAC, database queries, server actions, API routes, data fetching, hooks, and types are FROZEN unless a type strictly needs a visual presentation prop.
   - If a component currently performs an action, it must continue performing exactly the same action after UI edits.
   - If a button submits data, it must submit the exact same payload to the exact same handler.
   - If a page fetches data from Supabase, it must fetch the same columns and filters.

2. **No Invention of Features or Content**:
   - Do NOT add new routes, pages, dashboard cards, fake statistics, AI placeholders, or mock sections that do not exist in the working application.
   - Redesign ONLY existing components, existing pages, and existing user flows.

3. **Aesthetic Direction: Educational & Editorial**:
   - Avoid generic SaaS drop-shadow card blobs ("AI slop").
   - Prefer warm neutral backgrounds (`#faf8f4`, `#f3efe8`), deep charcoal typography (`#1c1b19`), muted metadata (`#9a958e`), academic accent (`#2d5f5d`), and warm amber (`#b8732e`).
   - Use Amiri serif for page headers, quotes, and primary titles. Use Tajawal for clean UI body text.
   - Use editorial lists, fine dividers, timelines, curriculum indexes, and tables rather than wrapping everything in rounded cards.
   - Use restrained radii (3px - 10px).
