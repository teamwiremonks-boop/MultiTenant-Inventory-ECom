export function postLogoutNavigation() {
  return {
    href: "/",
    replaceHistory: true,
    refreshBeforeNavigate: false,
  };
}
