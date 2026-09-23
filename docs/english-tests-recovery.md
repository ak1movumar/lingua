# English A1–A2 access and test recovery

- The learning path hides lessons until placement is completed. Previously course cards displayed this as zero lessons and course details said the course was empty. Locked courses now explain the prerequisite and link to placement.
- `/level-tests` lists active server tests and links to placement or level completion. Entry points appear in the learning navigation and course catalog.
- The server initially contained an active placement test with zero questions. The tests-only importer fills it and creates A1 and A2 completion tests, 24 questions each.
- Course and test imports can run independently. Results describe the scope actually imported.
- The importer caches list responses within a run, spaces requests, retries rate-limit responses and reconciles interrupted writes with fresh reads before retrying. Existing records are reused; unrelated records are not deleted.
- Backend learning-path locks remain authoritative. Completing the placement test selects the learner's starting level; completion tests are subject to backend progression requirements.

Validation: full project check (types, lint, formatting, tests, contrast checks and production build). Added regressions for tests-only imports, reruns without duplicate writes and recovery of interrupted requests with no saved record.
