function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  const pairs = cookieHeader.split(';');
  const cookies = {};

  for (const pair of pairs) {
    const index = pair.indexOf('=');
    if (index === -1) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!name) continue;
    cookies[name] = decodeURIComponent(value);
  }

  return cookies;
}

module.exports = {
  parseCookies,
};
