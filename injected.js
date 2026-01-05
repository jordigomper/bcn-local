(function() {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);

    const url = args[0]?.url || args[0];
    if (typeof url === 'string' && url.includes('/api/property-public/coordinates/')) {
      try {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        window.postMessage({
          type: 'FACILITEA_DATA_CAPTURED',
          data: data
        }, '*');
        console.log('Facilitea Extension: Datos capturados!', data.length, 'propiedades');
      } catch (e) {
        console.error('Facilitea Extension: Error al parsear respuesta', e);
      }
    }

    return response;
  };

  const originalXHROpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._facilitea_url = url;
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  const originalXHRSend = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function(...args) {
    this.addEventListener('load', function() {
      if (this._facilitea_url && this._facilitea_url.includes('/api/property-public/coordinates/')) {
        try {
          const data = JSON.parse(this.responseText);
          window.postMessage({
            type: 'FACILITEA_DATA_CAPTURED',
            data: data
          }, '*');
          console.log('Facilitea Extension: Datos capturados (XHR)!', data.length, 'propiedades');
        } catch (e) {
          console.error('Facilitea Extension: Error al parsear respuesta XHR', e);
        }
      }
    });
    return originalXHRSend.apply(this, args);
  };

  console.log('Facilitea Extension: Interceptor instalado');
})();
