const port = Number(process.env.PORT || 3001);
try {
  const response = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: AbortSignal.timeout(4000) });
  if (!response.ok || (await response.json()).status !== 'ok') throw new Error('Health check failed');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
