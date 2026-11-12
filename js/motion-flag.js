/*
 * Runs in <head> before the page paints.
 * Adds "js" and (unless the visitor prefers reduced motion) "motion" to <html>,
 * so the intro states in style.css apply from the first frame.
 * If main.js hasn't taken over within 4 s, the intro states are removed and
 * everything is shown as-is.
 */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    d.classList.add('motion');
    window.__motionFallback = setTimeout(function () {
      d.classList.remove('motion');
      d.classList.add('motion-fallback');
    }, 4000);
  }
})();
