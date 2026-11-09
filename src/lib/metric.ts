/**
 * Anonymous usage breadcrumbs. Each call prints one structured line to
 * stdout, which Render's log viewer picks up — filter logs for "bmetric"
 * to see whether (and how far) testers are getting through the funnel.
 * Deliberately logs NO content, filenames, or identifiers of any kind.
 */
export function metric(event: string, extra: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({ bmetric: event, at: new Date().toISOString(), ...extra }),
  );
}
