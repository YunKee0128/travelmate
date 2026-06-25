"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

function readLocalStorageValue<T>(key: string, initialValue: T) {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);

    if (item === null) {
      return initialValue;
    }

    return JSON.parse(item) as T;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readLocalStorageValue(key, initialValue),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // localStorage can fail in private browsing or restricted environments.
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
