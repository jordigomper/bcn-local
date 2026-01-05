(function() {
  let capturedData = null;
  let button = null;
  const STORAGE_KEY = 'facilitea_properties';

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

  window.addEventListener('message', async function(event) {
    if (event.source !== window) return;
    if (event.data.type === 'FACILITEA_DATA_CAPTURED') {
      const newData = event.data.data;
      await syncData(newData);
      enableButton();
    }
  });

  async function syncData(newData) {
    const stored = await getStoredData();
    const storedMap = new Map(stored.map(item => [item.id, item]));

    let newCount = 0;
    let updatedCount = 0;

    const syncedData = newData.map(item => {
      const existing = storedMap.get(item.id);
      if (existing) {
        updatedCount++;
        return { ...item, viewed: existing.viewed };
      } else {
        newCount++;
        return { ...item, viewed: false };
      }
    });

    stored.forEach(item => {
      if (!newData.find(n => n.id === item.id)) {
        syncedData.push(item);
      }
    });

    await saveData(syncedData);
    capturedData = syncedData;

    console.log(`Facilitea Extension: Sincronizado! ${newCount} nuevas, ${updatedCount} actualizadas, ${syncedData.length} total`);
  }

  function getStoredData() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || []);
      });
    });
  }

  function saveData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    });
  }

  function enableButton() {
    if (button && capturedData) {
      const newItems = capturedData.filter(item => !item.viewed).length;
      button.disabled = false;
      button.classList.add('enabled');
      button.title = `${capturedData.length} propiedades (${newItems} sin ver) - Click para ver mapa`;

      if (newItems > 0) {
        updateBadge(newItems);
      }
    }
  }

  function updateBadge(count) {
    let badge = document.getElementById('facilitea-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'facilitea-badge';
      button.appendChild(badge);
    }
    badge.textContent = count > 99 ? '99+' : count;
  }

  function createButton() {
    if (document.getElementById('facilitea-search-btn')) return;

    button = document.createElement('button');
    button.id = 'facilitea-search-btn';
    button.disabled = true;
    button.title = 'Esperando datos...';
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;

    button.addEventListener('click', function() {
      if (!capturedData) {
        alert('No hay datos capturados todavía');
        return;
      }

      const mapUrl = chrome.runtime.getURL('map.html');
      window.open(mapUrl, '_blank');
    });

    document.body.appendChild(button);

    getStoredData().then(stored => {
      if (stored.length > 0) {
        capturedData = stored;
        enableButton();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createButton);
  } else {
    createButton();
  }
})();
