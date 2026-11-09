/**
 * "Shrink to fit one page" geometry, shared by the on-screen preview and the
 * PDF export so they never disagree.
 *
 * Templates are authored at PAGE_DESIGN_WIDTH. To make a slightly-too-long
 * resume fit one page we render the design a little WIDER — text reflows into
 * fewer, shorter lines — then scale that wider design down to the output
 * width. The net effect is a smaller effective font that still fills the page
 * width (unlike a plain zoom, which would leave side margins).
 *
 * Crucially, "does it fit one page" depends only on the design width, not the
 * output width: content of natural height H at design width W fits when
 * H ≤ W · (usable-height / page-width). So the same fitted width works for the
 * 560px preview and the 816px print page alike.
 */
export const PAGE_DESIGN_WIDTH = 560;
export const FIT_FLOOR = 0.75; // never shrink the effective font below 75%
// US-Letter usable content height ÷ width, with 0.5in top+bottom margins:
// (11 - 1) / 8.5
export const LETTER_RATIO = 10 / 8.5;

/**
 * Probe the element at increasing widths until its content fits one page's
 * height, or the floor is reached. Mutates `el.style.width` while measuring
 * (caller owns a hidden/offscreen node). Returns the chosen design width,
 * whether it actually fits one page, and the natural height there.
 */
export function fitDesignWidth(el: HTMLElement): {
  designWidth: number;
  fits: boolean;
  naturalHeight: number;
} {
  const maxW = PAGE_DESIGN_WIDTH / FIT_FLOOR;
  let dw = PAGE_DESIGN_WIDTH;
  el.style.width = `${dw}px`;
  let h = el.scrollHeight;
  let guard = 0;
  while (h > dw * LETTER_RATIO && dw < maxW && guard++ < 40) {
    dw = Math.min(maxW, dw * 1.04);
    el.style.width = `${dw}px`;
    h = el.scrollHeight;
  }
  return {
    designWidth: dw,
    fits: h <= dw * LETTER_RATIO + 1,
    naturalHeight: h,
  };
}
