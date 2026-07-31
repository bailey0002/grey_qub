/* Scroll reveal — toggles .is-visible on [data-reveal] elements as they
   enter and leave the viewport. Two-way by design: scrolling back past an
   element fades it out again.

   Paired with css/reveal.css. If IntersectionObserver is missing (or the
   user prefers reduced motion) everything is simply shown. */
(function(){
  var els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)){
    for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible');
    return;
  }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    /* a sliver is enough to trigger; the bottom inset holds the reveal until
       the element is properly on screen rather than clipping the edge */
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });

  for (var j = 0; j < els.length; j++) io.observe(els[j]);
})();
