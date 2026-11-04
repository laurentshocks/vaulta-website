"use client";

import { useState } from "react";

/** Product photo gallery: main photo + thumbnails */
export default function Gallery({ images, name, fillFirst }: { images: string[]; name: string; fillFirst: boolean }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gallery-main" />;
  // the first photo is a product shot on white; the others are close-ups that fill the frame
  const fill = i === 0 ? fillFirst : true;
  return (
    <div>
      <div className={`gallery-main${fill ? " fill" : ""}`}>
        <img src={images[i]} alt={name} />
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, n) => (
            <button key={src} className={n === i ? "active" : ""} onClick={() => setI(n)} aria-label={`${name} ${n + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
