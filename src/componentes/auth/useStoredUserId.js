import { useState } from "react";

export const useStoredUserId = () => {
  return useState(() => {
    let id =
      localStorage.getItem("userId") ||
      sessionStorage.getItem("userId");

    if (!id) {
      id =
        crypto?.randomUUID?.() ||
        `id-${Date.now()}-${Math.random()}`;

      localStorage.setItem("userId", id);
      sessionStorage.setItem("userId", id);
    }

    return id;
  })[0];
};