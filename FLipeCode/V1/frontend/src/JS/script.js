
    // Interseção para revelar elementos suavemente no scroll
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})
    },{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

    // Carousel: arrastar com mouse / toque
    const carousel = document.getElementById('carousel');
    if (carousel){
      let isDown=false,startX,scrollLeft;
      carousel.addEventListener('mousedown',e=>{isDown=true;carousel.classList.add('drag');startX=e.pageX-carousel.offsetLeft;scrollLeft=carousel.scrollLeft});
      carousel.addEventListener('mouseleave',()=>{isDown=false;carousel.classList.remove('drag')});
      carousel.addEventListener('mouseup',()=>{isDown=false;carousel.classList.remove('drag')});
      carousel.addEventListener('mousemove',e=>{if(!isDown)return;e.preventDefault();const x=e.pageX-carousel.offsetLeft;const walk=(x-startX)*1.2;carousel.scrollLeft=scrollLeft-walk});
      // toque
      let startTouchX=0;let startScrollLeft=0;
      carousel.addEventListener('touchstart',e=>{startTouchX=e.touches[0].pageX;startScrollLeft=carousel.scrollLeft},{passive:true});
      carousel.addEventListener('touchmove',e=>{const dx=e.touches[0].pageX-startTouchX;carousel.scrollLeft=startScrollLeft-dx},{passive:true});
    }

    // Scroll para CTA do topo em dispositivos menores (melhor UX)
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',()=>{
        const m = document.querySelector(a.getAttribute('href'));
        if(m){m.classList.add('visible')}
      })
    })
