<template>
  <tree-table
    :treeConfig="treeConfig"
    :tableConfig="tableConfig"
    :paginationConfig="paginationConfig"
  ></tree-table>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ElMessage } from "element-plus";
import API from "@/api/api";
import TreeTable from "@/components/tree-table.vue";
import { HttpResponseCode } from "@/constants/constants";
import { CodeSnippetItem } from "@/typing";
import {
  TreeKey,
  TreeNodeData,
} from "element-plus/es/components/tree/src/tree.type";
import Node from "element-plus/es/components/tree/src/model/node";

export default defineComponent({
  name: "admin-page",
  components: {
    TreeTable,
  },
  setup() {
    const page = ref(1),
      limit = ref(20);

    const multipleSelection = ref<string[]>([]);

    const getCodeCategories = async () => {
      try {
        const { code, message, data } = await API.getCodeCategories({
          page: 1,
          limit: 100,
        });
        if (code === HttpResponseCode.OK) {
          const { rows } = data;

          const _id = "#0001";

          treeConfig.value.defaultExpandedKeys.push(_id);

          treeConfig.value.data = [
            // @ts-ignore
            {
              _id,
              title: "全部",
              avatar: "https://cdn.xiongyechang.com/01y2y1pi-all.png",
              editable: false,
              // @ts-ignore
              children: rows.map((item) => ({
                ...item,
                editable: false,
              })),
            } as const,
          ];
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getCodeCategories();

    const selectedTreeNode = ref<Node>();

    const getCodeSnippets = async (
      page: number,
      limit: number,
      categoryId?: string,
      keyword = ""
    ) => {
      try {
        const { code, message, data } = await API.getCodeSnippets({
          page,
          limit,
          categoryId,
          keyword,
        });
        if (code === HttpResponseCode.OK) {
          tableConfig.value.data = data.rows;
          paginationConfig.value.total = data.count;
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getCodeSnippets(page.value, limit.value);

    const onNodeClick = (
      data: TreeNodeData,
      node: Node,
      e: MouseEvent
    ): MouseEvent => {
      selectedTreeNode.value = node;
      getCodeSnippets(page.value, limit.value, getId(node));
      return e;
    };

    const getId = (node?: Node) =>
      node && node.data && node.data._id === "#0001"
        ? undefined
        : node?.data?._id;

    const selectionChange = (list: CodeSnippetItem[]) => {
      multipleSelection.value = list.map(({ _id }) => _id);
    };

    const treeConfig = ref({
      data: [],
      defaultExpandedKeys: [] as TreeKey[],
      indent: 0,
      props: {},
      nodeKey: "_id",
      showCheckbox: true,
      expandOnClickNode: false,
      highlightCurrent: true,
      onNodeClick: onNodeClick,
    });

    const tableConfig = ref({
      data: [],
      border: true,
      stripe: true,
      "highlight-current-row": true,
      onSelectionChange: selectionChange,
    });

    const currentPageChange = (pageNo: number) => {
      page.value = pageNo;
      getCodeSnippets(page.value, limit.value, getId(selectedTreeNode.value));
    };

    const currentSizeChange = (size: number) => {
      page.value = 1;
      limit.value = size;
      getCodeSnippets(page.value, limit.value, getId(selectedTreeNode.value));
    };

    const paginationConfig = ref({
      size: "mini",
      background: true,
      "onUpdate:current-page": page.value,
      "onUpdate:page-size": limit.value,
      "onUpdate:page-sizes": [5, 10, 20, 40, 60, 100],
      total: 0,
      layout: "total, sizes, prev, pager, next, jumper",
      onCurrentChange: currentPageChange,
      onSizeChange: currentSizeChange,
    });

    return {
      treeConfig,
      tableConfig,
      paginationConfig,
    };
  },
});
</script>
