const frontend = process.env.CHECK_FRONTEND_URL ?? 'http://localhost:3000';
const backend = process.env.NEXT_PUBLIC_API_URL ?? 'http://13.61.11.140';
const routes = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/courses',
  '/courses/1',
  '/progress',
  '/friends',
  '/community',
  '/chats',
  '/profile',
  '/settings',
  '/achievements',
  '/challenges',
  '/leaderboard',
  '/admin',
  '/admin/import',
  '/exercise-preview',
  '/design-system',
];
let failed = false;
for (const path of routes) {
  try {
    const response = await fetch(frontend + path, {
      signal: AbortSignal.timeout(30000),
    });
    console.log('PAGE', path, response.status);
    if (!response.ok) failed = true;
  } catch (error) {
    console.log('PAGE', path, error.message);
    failed = true;
  }
}
for (const path of ['/health', '/languages', '/courses']) {
  try {
    const response = await fetch(backend + path, {
      signal: AbortSignal.timeout(15000),
    });
    console.log('API', path, response.status);
    if (!response.ok) failed = true;
  } catch (error) {
    console.log('API', path, error.message);
    failed = true;
  }
}
try {
  const response = await fetch(backend + '/friends/request', {
    method: 'OPTIONS',
    headers: {
      Origin: frontend,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
    signal: AbortSignal.timeout(15000),
  });
  console.log(
    'CORS',
    response.status,
    response.headers.get('access-control-allow-origin'),
  );
  if (
    !response.ok ||
    ![frontend, '*'].includes(
      response.headers.get('access-control-allow-origin'),
    )
  )
    failed = true;
} catch (error) {
  console.log('CORS', error.message);
  failed = true;
}
console.log(
  'HTTP checks do not execute browser interactions or authenticated flows.',
);
if (failed) process.exitCode = 1;
