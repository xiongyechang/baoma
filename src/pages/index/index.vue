<template>
  <el-row class="custom-row" :gutter="10">
    <el-col
      v-for="block of list"
      :key="block.title"
      :span="24 / list.length"
      class="custom-col row-block"
    >
      <div>{{ list[0].title }}</div>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { reactive, toRefs } from "vue";

export default {
  name: "index-page",
  setup() {
    const store = reactive({
      list: [
        {
          title: "代码片段",
          summary: "",
          banner: "",
        },
        {
          title: "代码片段",
          summary: "",
          banner: "",
        },
        {
          title: "代码片段",
          summary: "",
          banner: "",
        },
        {
          title: "代码片段",
          summary: "",
          banner: "",
        },
      ],
    });

    return {
      ...toRefs(store),
    };
  },
};
</script>

<style lang="scss" scoped>
.custom-row,
.custom-col {
  height: 100%;
}
</style>
