export function postLogoutNavigation() {
  return {
    href: "/auth/login",
    replaceHistory: true,
    refreshBeforeNavigate: false,
  };
}
