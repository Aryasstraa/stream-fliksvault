"use client";

import { useEffect, useRef } from "react";

export default function AdInjector({ htmlContent }: { htmlContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !htmlContent) return;
    const container = containerRef.current;
    
    // createContextualFragment parses the string and allows script tags to be executed
    const slotHtml = document.createRange().createContextualFragment(htmlContent);
    container.innerHTML = "";
    container.appendChild(slotHtml);
  }, [htmlContent]);

  return <div ref={containerRef} style={{ display: "contents" }} />;
}
