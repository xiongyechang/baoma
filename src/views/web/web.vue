<template>
    <el-row class="search-list__row">
      <el-col class="full-height pad10" :span="6">
        <search-list @row-click="rowClick"></search-list>
      </el-col>
      <el-col class="content full-height pad10 scrollbar" :span="18">
        <HtmlMarkdown :markdown="markdown"></HtmlMarkdown>
      </el-col>
    </el-row>
</template>

<script>
import { ref } from 'vue'
import SearchList from '@/components/search-list'
import HtmlMarkdown from '@/components/html-markdown'
import API from '@/api/api'
import { ElMessage } from 'element-plus'
import { HttpResponseCode } from '@/constants/constants'

export default {
  name: "web",
  components: { SearchList, HtmlMarkdown },
  setup() {
    const markdown = ref(``)

    const rowClick = async({ _id }) => {
      try {
        const { code, message, data } = await API.getCodeSnippet(_id)
        if (code === HttpResponseCode.OK) {
          markdown.value = data.content
        } else {
          ElMessage.error(message)
        }
      } catch (e) {
        console.error(e)
      }
    }

    return {
      markdown,
      rowClick
    }
  }
}
</script>

<style lang="css" scoped>
.search-list__row {
  /*height: 100%;*/
}
.content {
  overflow: auto;
}
</style>