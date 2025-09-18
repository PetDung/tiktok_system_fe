export function updateQueryParam(
  key: string,
  value: string | number | null | undefined,
  replace: boolean = true // true = replaceState, false = pushState
) {
  const url = new URL(window.location.href);

  if (value === null || value === undefined || value === "") {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, String(value));
  }

  if (replace) {
    window.history.replaceState({}, "", url.toString());
  } else {
    window.history.pushState({}, "", url.toString());
  }
}
