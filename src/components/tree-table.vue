<template>
  <div class="grid">
    <div class="tree-widget">
      <slot name="tree-control-bar" :data="treeRef"></slot>
      <el-tree
        ref="treeRef"
        v-bind="treeConfig"
        style="height: calc(100% - 50px); overflow: auto"
      >
        <template #default="node">
          <slot name="tree-list" :data="node"></slot>
        </template>
      </el-tree>
    </div>
    <div class="table-widget">
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

<script lang="ts">
import { ref, defineComponent, PropType } from "vue";
import { TableProps } from "element-plus";
import { TreeComponentProps } from "element-plus/es/components/tree/src/tree.type";
import { CodeSnippetItem } from "@/typing/code-snippet";
import ElPagination from "element-plus/es/components/pagination";

export default defineComponent({
  name: "tree-table",
  props: {
    treeConfig: {
      type: Object as PropType<TreeComponentProps>,
    },
    tableConfig: {
      type: Object as PropType<TableProps<CodeSnippetItem>>,
    },
    paginationConfig: {
      type: Object as PropType<typeof ElPagination>,
    },
  },
  setup() {
    const treeRef = ref<HTMLDivElement | null>(null);

    const tableRef = ref<HTMLDivElement | null>(null);

    return {
      treeRef,
      tableRef,
    };
  },
});
</script>

<style lang="scss">
.el-tree-node__expand-icon {
  visibility: hidden;
}

.post-title__link {
  cursor: pointer;
  text-decoration: underline;
  color: blue;
  font-size: 13px;
}

.grid {
  height: 100%;
  display: grid;
  grid-template-columns: 360px calc(100% - 360px);
  grid-template-rows: 100%;
  text-align: left;
}

.table-widget {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 40px 1fr 40px;
  overflow: hidden;
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

.post-form__wrapper {
  overflow-y: auto;
}

.category-title {
  margin-left: 10px;
  flex: 1;
}

.custom-tree-node {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 100%;
  font-size: 13px;

  div:first-child {
    flex: 1;
  }

  div:last-child {
    width: 60px;
    text-align: right;
    padding-right: 10px;
  }
}

.el-tree::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
