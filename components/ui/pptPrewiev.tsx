"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface PptxViewerProps {
  url: string;
}

export const PptxViewer = ({ url }: PptxViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).pptx_render_pptx &&
        containerRef.current
      ) {
        (window as any).pptx_render_pptx(url, {
          slidesContainer: containerRef.current,
          keyHandler: true,
          slideMode: true,
        });
      } else {
        console.warn("pptx_render_pptx hali yuklanmagan");
      }
    };

    const timer = setTimeout(load, 1000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <>
      {/* Kutubxonalarni client tarafda yuklash */}
      <Script src="/pptxjs/jszip.min.js" strategy="afterInteractive" />
      <Script src="/pptxjs/pptxjs.js" strategy="afterInteractive" />

      <div
        ref={containerRef}
        className="w-full h-[600px] border rounded overflow-auto bg-white"
      />
    </>
  );
};
