/**
 * Vercel bills Image Optimization per transformation, and some sources gain
 * nothing from one: rasterising a vector at a logo's display size only loses
 * fidelity, and a file already under ~10 KB is smaller than the round trip
 * through the optimizer is worth.
 *
 * `unoptimized` sources are fetched straight from the provider CDN, so they
 * also cost no cache reads, cache writes or data transfer.
 *
 * https://vercel.com/docs/image-optimization/managing-image-optimization-costs
 */

/** True for sources the optimizer should leave alone — currently the SVG
 *  badges and league logos, which every provider here serves by extension. */
export function skipsOptimizer(src: string): boolean {
  return src.toLowerCase().endsWith('.svg');
}
