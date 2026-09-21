# Lingora design refresh

The landing page follows the third supplied reference; shared application components follow the first reference. The visual system uses midnight navy, mint actions, quieter cards, rounded panels, and a sequential learning journey. Light and dark themes and existing Russian, Kyrgyz, and English translations remain supported.

The learning journey uses real course availability, lessons, and progress from the backend. Backend contracts and access checks are preserved.

## Illustration

- Asset: `public/lingora-travelers.png` (1536 × 1024).
- Tool: built-in `image_gen.imagegen`.
- Used on the landing and authentication pages through Next Image.

Final generation prompt:

> Use case: stylized-concept. Asset type: production website hero illustration for Lingora language learning. Create a premium polished 3D animated-film illustration, landscape 3:2 composition, no text, no lettering, no logos, no UI, no watermark. Two friendly young adult student travelers, a dark wavy-haired man with a forest-green varsity jacket over a cream hoodie and backpack, and a dark-haired woman with a messy bun wearing an emerald green hoodie and carrying books. Waist-up figures close together in the center, expressive warm natural smiles, beautiful soft sculpted features, high quality fabric detail. A small curved blue-green globe at their waist and tasteful miniature Eiffel Tower and Colosseum behind them, tiny floating paper airplane, a few softly glowing mint particles. Light pale sky blue backdrop on the left transitioning smoothly to deep midnight navy #0b1d29 at the far right edge and bottom. Soft daylight, optimistic worldly mood. Subjects fill frame but keep all heads fully visible and generous breathing room around heads. The rightmost 15% fades into plain deep navy so this image can blend seamlessly into an adjacent dark website copy column. Elegant and restrained, not cluttered. No speech bubbles or text; these will be added as accessible HTML separately.

## Theme correction

The hero and authentication artwork now follow the selected theme. Light uses white surfaces and dark text; dark uses navy surfaces and mint accents. Hero text contrast is checked in both themes.

Light asset: `public/lingora-travelers-light.png`, edited with built-in `image_gen.imagegen`.

Final edit prompt:

> Edit this existing website illustration into its LIGHT THEME counterpart. Preserve exactly the same two student travelers, faces, poses, green clothing, books, globe, Eiffel Tower and Colosseum, framing and premium 3D style. Replace ALL midnight/navy backdrop and dark vignette on the right and bottom with soft ivory-white #ffffff, pale mint and very pale sky blue daylight. The far right 20% and bottom edge must fade smoothly to pure WHITE #ffffff, never navy or black. Bright airy daylight, soft pale clouds behind the figures, retain natural green clothing and natural face contrast. No text, no logos, no UI, no added objects. Same landscape 3:2 composition.

## Interior screens

The dashboard now has a main learning column and an activity rail. Courses, course details, the learning journey, exercises, tests, progress, profiles, settings, friends, community, chats, achievements, challenges, leaderboard, administration, and course import share the theme-aware surfaces and controls. Rewards have dedicated medal cards and leaderboard rows; administration has a resource navigation panel. Mobile supplementary navigation wraps into two columns.

Verified in the signed-in demo account: dashboard, profile, settings, community, chat list, achievements and leaderboard; desktop and mobile views and light/dark surfaces. The current backend catalog and chat history are empty, so populated courses, lesson attempts, conversations and administrative records cannot be verified with this account. No test records were created on the server.

Backend moved to http://54.90.250.224. Its OpenAPI schema matches all 61 existing paths.
