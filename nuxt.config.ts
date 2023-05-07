// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@anu-vue/nuxt',
    '@unocss/nuxt',
  ],
  app: {
    head: {
      title: '科技業 剛畢業新鮮人起薪 分享',
      meta: [
        { name: 'charset', content: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '分享剛畢業的新鮮人的薪資分享' },
        { name: 'keywords', content: '科技,科技業,新鮮人,起薪,分享' },
        { name: 'author', content: 'Matt Tai (listennn08@outlook.com)' }
      ],
    },
  }
})
