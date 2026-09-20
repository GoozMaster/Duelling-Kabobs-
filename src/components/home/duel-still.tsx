"use client";

import s from "./home.module.css";

/**
 * The duel, held still.
 *
 * This is the artwork from the original scroll-driven Overture with all of its
 * animation plumbing removed — no refs, no interpolation tracks, no scroll
 * subscription. It exists for visitors who ask for reduced motion, who must not
 * be shown an autoplaying video. They get the drawing rather than a blank panel.
 *
 * The clash, the flying meat and the launched shawarma are deliberately absent:
 * those only read as anything mid-animation, and frozen they are just debris
 * floating above two cooks.
 */
export function DuelStill() {
  return (
    <div className={s.duel}>
      <svg
                  viewBox="0 0 960 560"
                  role="img"
                  aria-label="Two cartoon cooks duelling with kebab skewers"
                >
                  {/* ---------- left cook: keffiyeh, full beard, gritted teeth ---------- */}
                  <g className="fig figL">
                    {/* thobe */}
                    <path className="ln cloth" d="M236 560 V436 C236 396 264 374 300 374 C336 374 364 396 364 436 V560 Z" />
                    <path d="M300 398 V560" stroke="#050505" strokeWidth="3" fill="none" opacity=".8" />
                    {/* raised arm: keyline stroke, then the sleeve over it */}
                    <path className="sleeveln" d="M352 408 C392 390 414 348 418 310" />
                    <path className="sleeve" d="M352 408 C392 390 414 348 418 310" />
                    {/* keffiyeh: crown plus two panels hanging past the shoulders */}
                    <path className="ln cloth" d="M300 240 C344 240 368 264 374 302 C382 356 378 424 372 482 L330 482 C339 424 342 374 338 344 L262 344 C258 374 261 424 270 482 L228 482 C222 424 218 356 226 302 C232 264 256 240 300 240 Z" />
                    {/* agal: two thin cords on the crown, above the hairline */}
                    <path d="M254 276 C260 250 276 240 300 240 C324 240 340 250 346 276" fill="none" stroke="#050505" strokeWidth="11" strokeLinecap="round" />
                    <path d="M256 290 C262 268 277 259 300 259 C323 259 338 268 344 290" fill="none" stroke="#050505" strokeWidth="8" strokeLinecap="round" />
                    {/* head, with the nose carried in the silhouette */}
                    <path className="ln skin" d="M300 266 C334 266 352 288 354 306 C370 307 382 314 381 326 C380 338 368 345 354 345 C352 363 334 376 300 376 C266 376 248 354 248 321 C248 288 266 266 300 266 Z" />
                    {/* beard: jaw, chin and cheeks, leaving the forehead and nose clear */}
                    <path className="hair" d="M250 314 C258 336 282 350 314 352 C334 352 347 345 352 334 C355 356 347 370 332 376 C318 382 280 382 267 373 C253 363 248 340 250 314 Z" />
                    {/* gritted teeth set into the beard */}
                    <rect x="308" y="349" width="36" height="16" rx="3.5" fill="#ffffff" stroke="#050505" strokeWidth="3.5" />
                    <path className="tooth" d="M320 349 V365 M332 349 V365" />
                    {/* eyes, looking at the opponent */}
                    <ellipse cx="282" cy="300" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                    <ellipse cx="315" cy="300" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                    <circle cx="289" cy="302" r="5.5" fill="#050505" />
                    <circle cx="322" cy="302" r="5.5" fill="#050505" />
                    <path className="brow" d="M261 280 L295 293" />
                    <path className="brow" d="M306 293 L338 284" />
                    {/* fist and skewer, up and to the right */}
                    <circle className="ln skin" cx="420" cy="302" r="17" />
                    <path d="M410 294 L430 294 M410 304 L430 304" stroke="#050505" strokeWidth="3" opacity=".7" />
                    <g>
                      <path className="rodline" d="M392 344 L556 102" fill="none" />
                      <path className="rod" d="M392 344 L556 102" fill="none" />
                      <rect className="meatc" x="454" y="206" width="30" height="30" rx="6" transform="rotate(-34 469 221)" />
                      <rect className="meatc" x="484" y="162" width="30" height="30" rx="6" transform="rotate(-34 499 177)" />
                      <rect className="meatc" x="514" y="118" width="30" height="30" rx="6" transform="rotate(-34 529 133)" />
                    </g>
                  </g>
  
                  {/* ---------- right cook: swept hair, walrus moustache, white shirt ---------- */}
                  <g className="fig figR">
                    {/* shirt with collar and buttons */}
                    <path className="ln cloth" d="M596 560 V436 C596 396 624 374 660 374 C696 374 724 396 724 436 V560 Z" />
                    <path className="ln cloth" d="M660 376 L634 402 L651 413 L660 396 Z" />
                    <path className="ln cloth" d="M660 376 L686 402 L669 413 L660 396 Z" />
                    <path d="M660 406 V560" stroke="#050505" strokeWidth="3" fill="none" opacity=".8" />
                    <circle cx="660" cy="442" r="3.5" fill="#050505" />
                    <circle cx="660" cy="480" r="3.5" fill="#050505" />
                    <circle cx="660" cy="518" r="3.5" fill="#050505" />
                    <path className="sleeveln" d="M608 408 C568 390 546 348 542 310" />
                    <path className="sleeve" d="M608 408 C568 390 546 348 542 310" />
                    {/* ear behind the head */}
                    <path className="ln skin" d="M710 314 C726 312 728 338 710 340" />
                    {/* head, nose on the left */}
                    <path className="ln skin" d="M660 266 C694 266 712 288 712 321 C712 354 694 376 660 376 C630 376 610 363 608 345 C592 344 578 337 579 325 C580 313 592 306 608 305 C610 286 628 266 660 266 Z" />
                    {/* swept black hair: a cap with a fringe pointing to the temple */}
                    <path className="hair" d="M612 300 C606 266 628 245 662 245 C698 245 718 268 712 296 C702 277 686 266 664 266 C646 266 632 275 624 289 C620 296 616 300 612 300 Z" />
                    <ellipse cx="637" cy="302" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                    <ellipse cx="670" cy="302" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                    <circle cx="630" cy="304" r="5.5" fill="#050505" />
                    <circle cx="663" cy="304" r="5.5" fill="#050505" />
                    <path className="brow" d="M652 285 L620 296" />
                    <path className="brow" d="M696 287 L665 294" />
                    {/* the walrus moustache, under the nose across the face */}
                    <path className="hair" d="M613 336 C627 327 643 329 653 337 L667 337 C679 329 695 329 705 338 C695 352 679 353 667 347 L653 347 C640 353 622 349 613 336 Z" />
                    <rect x="630" y="351" width="36" height="16" rx="3.5" fill="#ffffff" stroke="#050505" strokeWidth="3.5" />
                    <path className="tooth" d="M642 351 V367 M654 351 V367" />
                    {/* fist and skewer, up and to the left */}
                    <circle className="ln skin" cx="540" cy="302" r="17" />
                    <path d="M530 294 L550 294 M530 304 L550 304" stroke="#050505" strokeWidth="3" opacity=".7" />
                    <g>
                      <path className="rodline" d="M568 344 L404 102" fill="none" />
                      <path className="rod" d="M568 344 L404 102" fill="none" />
                      <rect className="meatc" x="476" y="206" width="30" height="30" rx="6" transform="rotate(34 491 221)" />
                      <rect className="meatc" x="446" y="162" width="30" height="30" rx="6" transform="rotate(34 461 177)" />
                      <rect className="meatc" x="416" y="118" width="30" height="30" rx="6" transform="rotate(34 431 133)" />
                    </g>
                  </g>
  
                  
              </svg>
    </div>
  );
}
