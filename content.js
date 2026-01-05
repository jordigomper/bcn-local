(function() {
  if (document.getElementById('facilitea-search-btn')) return;

  const button = document.createElement('button');
  button.id = 'facilitea-search-btn';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `;

  button.addEventListener('click', function() {
    alert('¡Botón de búsqueda clickeado!');
  });

  document.body.appendChild(button);
})();
