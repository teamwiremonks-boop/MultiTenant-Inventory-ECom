"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { postLogoutNavigation } from "@/lib/logout-navigation.mjs";

export function LogoutButton() {
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    const navigation = postLogoutNavigation();
    if (navigation.replaceHistory) {
      window.location.replace(navigation.href);
      return;
    }
    window.location.href = navigation.href;
  };

  return (
    <Button type="button" onClick={logout}>
      Logout
    </Button>
  );
}
