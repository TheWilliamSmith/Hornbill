export function setAccessToken(token: string): void {
  if (typeof document === "undefined") return;
  // Set cookie with 15 minutes expiration to match token lifetime
  const maxAge = 60 * 15; // 15 minutes in seconds
  document.cookie = `accessToken=${token}; path=/; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeAccessToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = "accessToken=; path=/; Secure; SameSite=Strict; Max-Age=0";
}

export function setRefreshToken(token: string): void {
  if (typeof document === "undefined") return;
  // Set cookie with 7 days expiration to match token lifetime
  const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
  document.cookie = `refreshTokenClient=${token}; path=/; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)refreshTokenClient=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeRefreshToken(): void {
  if (typeof document === "undefined") return;
  document.cookie =
    "refreshTokenClient=; path=/; Secure; SameSite=Strict; Max-Age=0";
}
