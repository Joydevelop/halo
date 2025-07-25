import { useUserStore } from "@/stores/user";
import type { Router } from "vue-router";

const whiteList = ["ResetPassword"];

export function setupAuthCheckGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    if (whiteList.includes(to.name as string)) {
      next();
      return;
    }

    const userStore = useUserStore();

    if (userStore.isAnonymous) {
      window.location.href = `/login?redirect_uri=${encodeURIComponent(
        window.location.href
      )}`;
      return;
    }

    next();
  });
}
