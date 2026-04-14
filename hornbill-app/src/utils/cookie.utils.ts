export function setAccessToken(token: string): void {
  document.cookie = `accessToken=${token}; path=/; Secure; SameSite=Strict`;
}

export function getAccessToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeAccessToken(): void {
  document.cookie = "accessToken=; path=/; Secure; SameSite=Strict; Max-Age=0";
}
