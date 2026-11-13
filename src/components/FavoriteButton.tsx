"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  slug,
  className = "",
  label = false,
}: {
  slug: string;
  className?: string;
  label?: boolean;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isFavorite(slug));
  }, [slug]);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Remove from saved homes" : "Save this home"}
      className={`inline-flex items-center gap-2 rounded-md transition ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOn(toggleFavorite(slug).includes(slug));
      }}
    >
      <Heart size={18} className={on ? "fill-clay text-clay" : "text-current"} />
      {label ? <span className="text-sm font-medium">{on ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
