"use client";

import { registerSW } from "@/lib/sw-registration";
import { useEffect } from "react";

export function PWAInit() {
  useEffect(() => {
    registerSW();
  }, []);

  return null;
}
