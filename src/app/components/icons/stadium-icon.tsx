import type { SVGProps } from 'react';

/**
 * Venue / arena icon — the stadium silhouette used by the league sites. Inline
 * SVG so it never depends on an external asset URL. Colour it via `text-*`
 * (uses currentColor) and size it via `w-*`/`h-*`; the artwork keeps its
 * 130×94.7 aspect ratio.
 */
export function StadiumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130 94.7"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M59,54C28.8,54,4.3,49.1,4.3,43l6.4,51.7h33.4l4-22.5h21.7l4,22.5h33.4l6.4-51.7C113.7,49,89.2,54,59,54z" />
      <path d="M113.7,22l11.2-3.3l-11.2-3.3h-1.9v20.1c-6.2-4.6-27-8-51.8-8.1V13l11.2-3.3L60,6.4h-2v21c-24.8,0.1-45.5,3.5-51.8,8.1V21.9l11.2-3.3L6.2,15.3H4.3v23l0,0l0,0c0,6.1,24.5,11,54.7,11s54.7-4.9,54.7-11l0,0L113.7,22L113.7,22z M14.5,38.4c0-1.8,5.7-3.4,14.7-4.5l2.9,9.4C21.4,42.2,14.5,40.4,14.5,38.4z M57.4,44.5c-8,0-15.4-0.4-21.8-0.9l-3.1-10c7-0.7,15.6-1.1,24.9-1.2V44.5z M84.8,43.4c-6.9,0.7-15.2,1.1-24.2,1.1V32.4C71,32.5,80.4,33,87.8,33.8L84.8,43.4z M88.3,43l2.7-8.8c7.7,1.1,12.5,2.6,12.5,4.2C103.5,40.2,97.6,41.9,88.3,43z" />
    </svg>
  );
}
