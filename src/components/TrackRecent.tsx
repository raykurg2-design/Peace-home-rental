"use client";

import { useEffect } from "react";
import { pushRecent } from "@/lib/recent";

export function TrackRecent({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecent(slug);
  }, [slug]);
  return null;
}
