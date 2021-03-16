import hljs from 'highlight.js'

export const highlight = {
  beforeMount(el, binding, vnode, prevVnode) {},
  mounted(el) {
  	let blocks = el.querySelectorAll('pre code')
      blocks.forEach(block => {
        hljs.highlightBlock(block)
      });
      window.Prism.highlightAll()
  },
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},
  unmounted() {}
}