<template>
  <div class="grid h-full text-left">
    <div>
      <slot name="tree-control-bar" :data="treeRef"></slot>
      <el-tree
        ref="treeRef"
        v-bind="treeConfig"
        class="overflow-auto"
        style="height: calc(100% - 40px)"
      >
        <template #default="node">
          <slot name="tree-list" :data="node"></slot>
        </template>
      </el-tree>
    </div>
    <div class="overflow-hidden table-widget">
      <slot name="table-control-bar" :data="tableRef"></slot>
      <el-table ref="tableRef" v-bind="tableConfig" height="100%">
        <slot name="table-list"></slot>
      </el-table>
      <el-pagination
        v-bind="paginationConfig"
        class="table-widget-bottom"
      ></el-pagination>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { TableProps, ElPagination } from "element-plus";
import { TreeComponentProps } from "element-plus/es/components/tree/src/tree.type";
import { CodeSnippetItem } from "@/typing/code-snippet";

defineProps<{
  treeConfig: TreeComponentProps;
  tableConfig: TableProps<CodeSnippetItem>;
  paginationConfig: typeof ElPagination;
}>();
const treeRef = ref<HTMLDivElement | null>(null);
const tableRef = ref<HTMLDivElement | null>(null);
</script>

<style lang="scss" scoped>
::v-deep(.el-tree-node__expand-icon) {
  visibility: hidden;
}

.grid {
  display: grid;
  grid-template-columns: 360px calc(100% - 360px);
  grid-template-rows: 100%;
}

.table-widget {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 40px 1fr 40px;
  &-top {
    padding: 5px;
  }
  &-content {
    overflow: auto;
  }
  &-bottom {
    padding: 10px;
  }
}

.el-tree::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
