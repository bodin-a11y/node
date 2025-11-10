export default () => ({
    planfix: {
      baseUrl: process.env.PLANFIX_BASE_URL,
      token: process.env.PLANFIX_API_TOKEN,
      timeoutMs: Number(process.env.PLANFIX_TIMEOUT_MS ?? 10000),
    },
  });
  