import { presetAnu, presetIconExtraProperties } from 'anu-vue'
import { presetThemeDefault } from '@anu-vue/preset-theme-default'
import {
  defineConfig,
  presetIcons,
  presetUno,
  presetAttributify
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      extraProperties: presetIconExtraProperties,
    }),
    presetAttributify({ /* preset options */}),
    presetAnu(),

    // default theme preset
    presetThemeDefault(),
  ],
  include: [/.*\/anu-vue\.js(.*)?$/, './**/*.vue', './**/*.md'],
})
