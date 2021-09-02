import router, { useRouter } from "next/router";
import { useEffect } from "react";
import { User } from "../types";

export const useIsLoggedIn = () => {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("loggedIn");
  }
  return false;
};

export const useGetUserRole = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userRole");
  }
  return "customer";
};

export const useGetUserEmail = () => {
  if (typeof window === "undefined") {
    return
  }
  return localStorage.getItem("userEmail");
}

export const logIn = ($user: User) => {
  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("userEmail", $user.email);
  localStorage.setItem("userRole", $user.role ?? "customer");

  if ($user.role === "admin") {
    return router.push("/admin");
  }
  return router.push("/");
};

export const logOut = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");

    router.push("/");
  }
};

export const useRedirectIfNotLoggedIn = () => {
  const router = useRouter();
  const isLoggedIn = useIsLoggedIn();

  return useEffect(() => {
    if (!isLoggedIn) {
      router.replace("login");
    }
  }, [router, isLoggedIn]);
};
