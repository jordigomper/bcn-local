var I18n = {
  currentLanguage: 'es',

  translations: {
    es: {
      appName: 'BCN Local',
      appTitle: 'BCN Local - Barcelona Native Mobility',
      languageSelector: 'Idioma',
      districtsList: 'Lista de distritos',
      metroTren: 'Metro/Tren',
      buses: 'Buses',
      gasolineras: 'Gasolineras',
      bicing: 'Bicing',
      serviciosDeportivos: 'Servicios deportivos',
      resetButton: 'Reset',
      resetButtonTitle: 'Volver a la vista inicial (ESC)',
      transportePublico: 'Transporte público',
      parada: 'Parada',
      lineas: 'Líneas',
      ruta: 'Ruta',
      servicioDeportivo: 'Servicio deportivo',
      hazClickParaIrALaWeb: 'Haz click para ir a la web',
      metro: 'Metro',
      tren: 'Tren',
      bus: 'Bus',
      tranvia: 'Tranvía',
      ferry: 'Ferry',
      teleferico: 'Teleférico',
      gondola: 'Gondola',
      funicular: 'Funicular',
      transporte: 'Transporte',
      leyendaSeleccion: 'Leyenda de selección',
      gimnasios: 'Gimnasios'
    },
    ca: {
      appName: 'BCN Local',
      appTitle: 'BCN Local - Barcelona Native Mobility',
      languageSelector: 'Idioma',
      districtsList: 'Llista de districtes',
      metroTren: 'Metro/Tren',
      buses: 'Busos',
      gasolineras: 'Gasolineres',
      bicing: 'Bicing',
      serviciosDeportivos: 'Serveis esportius',
      resetButton: 'Restablir',
      resetButtonTitle: 'Tornar a la vista inicial (ESC)',
      transportePublico: 'Transport públic',
      parada: 'Parada',
      lineas: 'Línies',
      ruta: 'Ruta',
      servicioDeportivo: 'Servei esportiu',
      hazClickParaIrALaWeb: 'Fes clic per anar a la web',
      metro: 'Metro',
      tren: 'Tren',
      bus: 'Bus',
      tranvia: 'Tramvia',
      ferry: 'Ferri',
      teleferico: 'Telefèric',
      gondola: 'Gondola',
      funicular: 'Funicular',
      transporte: 'Transport',
      leyendaSeleccion: 'Llegenda de selecció',
      gimnasios: 'Gimnasos'
    },
    en: {
      appName: 'BCN Local',
      appTitle: 'BCN Local - Barcelona Native Mobility',
      languageSelector: 'Language',
      districtsList: 'Districts list',
      metroTren: 'Metro/Train',
      buses: 'Buses',
      gasolineras: 'Gas Stations',
      bicing: 'Bicing',
      serviciosDeportivos: 'Sports Services',
      resetButton: 'Reset',
      resetButtonTitle: 'Return to initial view (ESC)',
      transportePublico: 'Public Transport',
      parada: 'Stop',
      lineas: 'Lines',
      ruta: 'Route',
      servicioDeportivo: 'Sports Service',
      hazClickParaIrALaWeb: 'Click to go to website',
      metro: 'Metro',
      tren: 'Train',
      bus: 'Bus',
      tranvia: 'Tram',
      ferry: 'Ferry',
      teleferico: 'Cable Car',
      gondola: 'Gondola',
      funicular: 'Funicular',
      transporte: 'Transport',
      leyendaSeleccion: 'Selection Legend',
      gimnasios: 'Gyms'
    }
  },

  t: function(key) {
    return this.translations[this.currentLanguage][key] || key;
  },

  setLanguage: function(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('bcn_local_language', lang);
      this.updateUI();
    }
  },

  init: function() {
    var savedLang = localStorage.getItem('bcn_local_language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    } else {
      var browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.startsWith('ca')) {
        this.currentLanguage = 'ca';
      } else if (browserLang.startsWith('en')) {
        this.currentLanguage = 'en';
      } else {
        this.currentLanguage = 'es';
      }
    }
    this.updateUI();
  },

  updateUI: function() {
    if (typeof window.updateTranslations === 'function') {
      window.updateTranslations();
    }
  }
};

window.I18n = I18n;
