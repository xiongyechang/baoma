<template>
  <div class="markdown-viewer" @click="onClick" v-html="html" v-highlight />
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai-sublime.css';
import CopyButtonPlugin from 'highlightjs-copy';
import 'highlightjs-copy/styles/highlightjs-copy.css';
import { shell } from 'electron';
import { ElMessage } from 'element-plus';

hljs.addPlugin(new CopyButtonPlugin())

export default defineComponent({
  name: 'preview-markdown',
  props: {
    value: String
  },
  directives: {
    highlight: function(el) {
      let blocks = el.querySelectorAll('pre code');
      blocks.forEach(block => {
        hljs.highlightBlock(block);
      });
    }
  },
  setup(props) {

    const html = ref(``);

    watch(() => props.value, (newValue, oldValue) => {
      if(newValue !== oldValue) {
        html.value = marked(props.value);
      }
    })

    onMounted(() => {
      marked.setOptions({
        renderer: new marked.Renderer(),
        highlight(code, lang) {
          console.log(code, lang);
          return hljs.highlightAuto(code, [lang]).value;
        },
        pedantic: false,
        gfm: true,
        tables: true,
        breaks: true,
        sanitize: true,
        smartLists: true,
        smartypants: true,
        xhtml: false,
      });
      
      html.value = marked(props.value);
    });

    const onClick = (event) => {
      event.preventDefault();
      const dom = event.target;
      if (dom.nodeName.toLowerCase() === 'a') {
        try {
          shell.openExternal(dom.href);
        } catch (error) {
          ElMessage.error('打开默认浏览器失败');
        }
      }
    }

    return {
      html,
      onClick,
    }
  }
})
</script>

<style lang="scss" scoped>
  .markdown-viewer {
    padding-right: 10px;

    /deep/ {

      h1 {
        height: 50px;
        line-height: 50px;
        position: sticky;
        top: 0;
        right: 0;
        left: 0;
        padding-top: 10px;
        background-color: white;
        z-index: 9999;
        margin-bottom: 8px;
      }
      code.hljs {
        margin-bottom: 10px;
      }
      p {
        line-height: 2rem;
      }

      li { 
        line-height: 2rem;
      }

      table {
        border-collapse: collapse;
        empty-cells: show;
        margin-bottom: 16px;
        overflow: auto;
        border-spacing: 0;
        display: block;
        word-break: keep-all;
        width: 100%;

        th {
          font-weight: 600;
        }

        th, td {
          padding: 6px 13px;
          border: 1px solid #dfe2e5;
          word-break: normal;
          white-space: nowrap;

          &:first-child::after{
            content: "";
            display: inline-block;
            vertical-align: top;
            min-height: 24px;
          }
        }

        tr {
          border-top: 1px solid #c6cbd1;
          background-color: #fafbfc;
        }
      }

      hr {
        height: 2px;
        padding: 0;
        margin: 24px 0;
        background-color: #eaecef;
        border: 0;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 5px 0;
      }
    }

    
  }
</style>