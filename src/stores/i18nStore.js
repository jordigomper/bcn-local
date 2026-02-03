import { defineStore } from 'pinia'
import { I18n } from '../lib/utils/i18n.js'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    currentLanguage: I18n.currentLanguage
  }),
  actions: {
    init() {
      I18n.init()
      this.currentLanguage = I18n.currentLanguage
    },
    setLanguage(lang) {
      if (I18n.translations[lang]) {
        I18n.currentLanguage = lang
        localStorage.setItem('bcn_local_language', lang)
        this.currentLanguage = lang
        I18n.updateUI()
      }
    },
    t(key) {
      return I18n.t(key)
    }
  },
  getters: {
    lang: (state) => state.currentLanguage
  }
})
