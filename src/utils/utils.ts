export function getToken() {
  return localStorage.getItem("access_token");
}

export function toQuerystring(
  params: Record<string, number | string | undefined>
) {
  return Object.keys(params)
    .map((key) => {
      const value = params[key];
      return `${key}=${value || ""}`;
    })
    .join("&");
}
