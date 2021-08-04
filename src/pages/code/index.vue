<template>
    <el-row class="full-height">
      <el-col class="pad10 full-height" :span="6">
        <search-list @row-click="rowClick"></search-list>
      </el-col>
      <el-col class="content full-height pad10 scrollbar" :span="18">
        <template v-if="markdown">
          <HtmlMarkdown :markdown="markdown" />
        </template>
        <template v-else>
          <Empty />
        </template>
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
import Empty from '@/components/empty'

export default {
  name: "web",
  components: { SearchList, HtmlMarkdown, Empty },
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
.content {
  position: relative;
  overflow: auto;
}
</style>