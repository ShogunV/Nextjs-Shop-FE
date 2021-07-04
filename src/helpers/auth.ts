import router, { useRouter } from "next/router";
import { useEffect } from "react";

export const useIsLoggedIn = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('loggedIn')
  }
  return false
};

export const logIn = () => {
  localStorage.setItem('loggedIn', 'true')

  router.push("/");
};

export const logOut = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem('loggedIn')

    router.push("/login");
  }
};

export const useRedirectIfNotLoggedIn = () => {
  const router = useRouter()
  const isLoggedIn = useIsLoggedIn()

  return useEffect(() => {
    if (!isLoggedIn) {
      router.replace('login')
    }
  }, [router, isLoggedIn])
}
