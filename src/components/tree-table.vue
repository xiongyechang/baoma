<template>
  <div class="grid">
    <div>
      <el-row :gutter="10" style="padding: 5px 5px 5px 25px; height: 40px">
        <el-col>
          <el-button
            type="primary"
            :icon="Plus"
            @click="doAction(ADD_TREE_NODE, treeRef)"
            >添加</el-button
          >
          <el-button
            type="success"
            :icon="Edit"
            @click="doAction(UPDATE_TREE_NODE, treeRef)"
            >更新</el-button
          >
          <el-button
            type="danger"
            :icon="Delete"
            @click="doAction(DELETE_TREE_NODE, treeRef)"
            >删除</el-button
          >
        </el-col>
      </el-row>
      <el-tree
        ref="treeRef"
        v-bind="treeConfig"
        style="height: calc(100% - 50px); overflow: auto"
      >
        <template #default="node">
          <slot :data="node"></slot>
        </template>
      </el-tree>
    </div>
    <div class="table-widget">
      <el-row class="table-widget-top">
        <el-col :span="8">
          <el-button
            type="primary"
            :icon="Plus"
            @click="doAction(ADD_TABLE_ROW)"
            >添加</el-button
          >
          <el-button
            type="danger"
            :icon="Delete"
            @click="doAction(DELETE_TABLE_ROW)"
            >删除</el-button
          >
        </el-col>
        <el-col :span="8"></el-col>
        <el-col :span="8">
          <el-input placeholder="请输入搜索词" v-model="keyword"> </el-input>
        </el-col>
      </el-row>
      <el-table v-bind="tableConfig" height="100%">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column label="类型" width="60">
          <template #default="scope">
            <img
              :src="getCategoryAvatar(scope.row.category)"
              alt=""
              width="20"
              height="20"
            />
          </template>
        </el-table-column>
        <el-table-column label="编号" width="100">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column prop="createdAt" width="160" label="发布日期">
          <template #default="scope">
            {{ dayjs(scope.row.createdAt).format("YYYY-MM-DD hh:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" width="160" label="更新日期">
          <template #default="scope">
            {{ dayjs(scope.row.updatedAt).format("YYYY-MM-DD hh:mm:ss") }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button
              @click="doAction(UPDATE_TABLE_ROW, scope.row)"
              size="small"
              :icon="Edit"
              >更新</el-button
            >
          </template>
        </el-table-column>
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
import dayjs from "dayjs";
import { TableProps } from "element-plus";
import { TreeComponentProps } from "element-plus/es/components/tree/src/tree.type";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { CodeSnippetItem } from "@/typing/code-snippet";
import ElPagination from "element-plus/es/components/pagination";
import { TreeTableActions } from "@/constants/constants";

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
  setup(_props, { emit }) {
    const treeRef = ref<HTMLDivElement | null>(null);

    const getCategoryAvatar = (category: any) => {
      return (category && category.avatar) || "";
    };

    const doAction = (action: keyof typeof TreeTableActions, data?: any) => {
      emit("action", { data, action });
    };

    return {
      treeRef,
      dayjs,
      getCategoryAvatar,
      ...TreeTableActions,
      doAction,
      Plus,
      Edit,
      Delete,
      keyword: ref(""),
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
