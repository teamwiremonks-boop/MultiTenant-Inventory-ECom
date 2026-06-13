const publicRoutePrefixes = ["/auth", "/business/sign-up", "/checkout", "/products"];

export function isPublicRoute(pathname) {
  return (
    pathname === "/" ||
    publicRoutePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export function cacheControlForRoute(pathname) {
  return isPublicRoute(pathname)
    ? undefined
    : "no-store, max-age=0, must-revalidate";
}
