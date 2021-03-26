import hljs from 'highlight.js'
import Prism from 'prismjs'
import 'prismjs/themes/prism-twilight.css'

export const highlight = {
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted(el) {
  	let blocks = el.querySelectorAll('pre code')
      blocks.forEach(block => {
        hljs.highlightBlock(block)
      });
      Prism.highlightAll()
  },
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},
  unmounted() {}
}