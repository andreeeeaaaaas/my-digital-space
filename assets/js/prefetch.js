function prefetch(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('a');
  
    links.forEach(link => {
      if (link.origin === window.location.origin) {
        link.addEventListener('mouseover', function () {
          prefetch(link.href);
        });
      }
    });
  });