"use client";

import { useEffect, useState } from "react";
import AdInjector from "./AdInjector";

export default function TopAd() {
  const [nativeBannerScript, setNativeBannerScript] = useState<string>("");

  useEffect(() => {
    fetch("/api/settings?key=native_banner_url")
      .then((res) => res.json())
      .then((data) => {
        if (data.value) setNativeBannerScript(data.value);
      })
      .catch(() => {});
  }, []);

  if (!nativeBannerScript) return null;

  return <AdInjector htmlContent={nativeBannerScript} />;
}
