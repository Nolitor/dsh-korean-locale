/**
 * Korean language pack — Host half.
 *
 * The Korean dictionaries live entirely in the browser half (`./client`),
 * discovered from package.json#dsh.client and served by the client module
 * system. This module exists only because the module registry composes its
 * boot graph from enabled Loader entries: a package without a loadable Host
 * row is never scanned, so its browser half would never reach the page.
 *
 * It imports nothing, owns no state, and is deliberately a no-op.
 */

/** Cordis plugin name reported by the loader tree. */
export const name = 'korean-locale'

/** Mount the inert Host row. */
export function apply() {}
