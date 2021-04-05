<template>
  <vue3-markdown-it :source='markdown' :plugins='plugins' />
</template>

<script>
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'; 
import markdownItMultimdTable from 'markdown-it-multimd-table'
import markdownItAbbr from 'markdown-it-abbr'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItDeflist from 'markdown-it-deflist'
import markdownItEmoji from 'markdown-it-emoji'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItHighlightjs from 'markdown-it-highlightjs'
import markdownItIns from 'markdown-it-ins'
import markdownItMark from 'markdown-it-mark'
import markdownItSub from 'markdown-it-sub'
import markdownItSup from 'markdown-it-sup'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'

export default {
  name: "html-markdown",
  props: {
    markdown: String
  },
  setup(props, context) {

    const markdownEditorRef = ref(null);

    const store = reactive({
      plugins: [{ 
          plugin: markdownItMultimdTable
      }, {
          plugin: markdownItAbbr
      }, {
          plugin: markdownItAnchor
      }, {
          plugin: markdownItDeflist
      }, {
          plugin: markdownItEmoji
      }, {
          plugin: markdownItFootnote
      }, {
          plugin: markdownItHighlightjs
      }, {
          plugin: markdownItIns
      }, {
          plugin: markdownItMark
      }, {
          plugin: markdownItSub
      }, {
          plugin: markdownItSup
      }, {
          plugin: markdownItTaskLists
      }, {
          plugin: markdownItTocDoneRight
      }],
    });

    return {
      ...toRefs(store)
    }
  }
}
</script>

<style lang="scss">
.markdown {
  word-break: break-all;
  line-height: 2rem;
  font-size: 16px;
  font-family: "Fira Code Retina";
  text-align: left;

  hr {
    margin: 10px 0;
  }

  h1,h2,h3,h4,h5,h6{
    padding: 10px 0;
  }

  img {
    max-width: 100%;
  }

  pre>code {
    border-radius: 5px;
  }
}
</style>