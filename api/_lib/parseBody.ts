export function getPasswordFromRequestBody(body: unknown): string | undefined {
  if (body == null) return undefined;

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as { password?: unknown };
      return typeof parsed.password === "string" ? parsed.password : undefined;
    } catch {
      return undefined;
    }
  }

  if (typeof body === "object" && "password" in body) {
    const password = (body as { password?: unknown }).password;
    return typeof password === "string" ? password : undefined;
  }

  return undefined;
}
