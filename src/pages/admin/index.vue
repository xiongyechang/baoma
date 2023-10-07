<template>
  <tree-table
    :treeConfig="treeConfig"
    :tableConfig="tableConfig"
    :paginationConfig="paginationConfig"
    @action="doAction"
  >
    <template #default="{ data }">
      <template v-if="data.data.editable">
        <input
          type="text"
          @blur="doCategoryAction(data, $event)"
          v-model="data.data.title"
          @click.prevent.stop
        />
      </template>
      <template v-else>
        <div class="flex-center-start">
          <input
            :id="data.data._id"
            type="file"
            :data-id="data.data._id"
            style="width: 0; height: 0; overflow: hidden"
          />
          <img
            :src="data.data.avatar"
            height="16"
            width="16"
            @click.stop.prevent="setCategoryAvatar(data.data)"
          />
          <span class="category-title">{{ data.data.title }}</span>
        </div>
      </template>
    </template>
  </tree-table>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { ElMessage } from "element-plus";
import API from "@/api/api";
import TreeTable from "@/components/tree-table.vue";
import {
  ADD_ID_LENGTH,
  HttpResponseCode,
  TreeTableActions,
} from "@/constants/constants";
import { CodeSnippetItem } from "@/typing";
import {
  TreeKey,
  TreeNodeData,
} from "element-plus/es/components/tree/src/tree.type";
import Node from "element-plus/es/components/tree/src/model/node";
import randomstring from "randomstring";
import { useRouter } from "vue-router";
import { useQiniu } from "@/hooks";

export default defineComponent({
  name: "admin-page",
  components: {
    TreeTable,
  },
  setup() {
    const router = useRouter();

    const { upload } = useQiniu();

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

    const setCategoryAvatar = async (data: any) => {
      const fileUploadDOM = document.getElementById(
        `${data._id}`
      ) as HTMLInputElement;
      fileUploadDOM.addEventListener(
        "change",
        async (event: Event) => {
          // @ts-ignore
          const file = event.target?.files[0];
          // @ts-ignore
          const avatar = await upload(file);
          Reflect.set(data, "avatar", avatar);
          await API.updateCategory(data);
        },
        false
      );
      fileUploadDOM.click();
    };

    const doCategoryAction = async (category: any, event: Event) => {
      let request = null;
      if (category._id.length === ADD_ID_LENGTH) {
        request = API.addCategory;
      } else {
        request = API.updateCategory;
      }
      try {
        const { code, message, data } = await request(category);
        if (code === HttpResponseCode.OK) {
          ElMessage.success(message);
          Object.assign(category, {
            _id: data._id,
            // @ts-ignore
            title: event.target?.value,
            editable: false,
          });
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const doAction = ({
      action,
      data,
    }: {
      action: keyof typeof TreeTableActions;
      data: any;
    }) => {
      console.log(action, data);
      typeof doActionMethods[action] === "function" &&
        doActionMethods[action](data);
    };

    const {
      ADD_TABLE_ROW,
      ADD_TREE_NODE,
      UPDATE_TABLE_ROW,
      UPDATE_TREE_NODE,
      DELETE_TABLE_ROW,
      DELETE_TREE_NODE,
    } = TreeTableActions;

    const doActionMethods = {
      [ADD_TABLE_ROW]() {
        if (!selectedTreeNode.value) {
          return ElMessage.warning("请先选择一个树节点【除了全部节点之外】");
        }

        if (selectedTreeNode.value.data.title === `全部`) {
          return ElMessage.warning("请先选择一个树节点【除了全部节点之外】");
        }

        const { _id: category } = selectedTreeNode.value.data;

        router.push({
          name: "form",
          query: {
            category,
          },
        });
      },
      [UPDATE_TABLE_ROW](data: any) {
        router.push({
          name: "form",
          query: {
            _id: data._id,
          },
        });
      },
      [DELETE_TABLE_ROW]() {
        if (multipleSelection.value.length) {
          const reqs = multipleSelection.value.map((_id) => {
            return API.removeCodeSnippet(_id);
          });
          Promise.all(reqs)
            .then(() => {
              getCodeSnippets(
                page.value,
                limit.value,
                getId(selectedTreeNode.value)
              );

              ElMessage({
                type: "success",
                message: `删除成功`,
              });
            })
            .catch(console.error);
        }
      },
      [ADD_TREE_NODE](treeRef: any) {
        const root = treeRef.root.childNodes[0];
        treeRef.append(
          {
            _id: randomstring.generate({
              capitalization: "lowercase",
              length: ADD_ID_LENGTH,
            }),
            title: "",
            count: 0,
            editable: true,
          },
          root
        );
      },
      [UPDATE_TREE_NODE](treeRef: any) {
        const selectedTreeNode = treeRef.getCheckedNodes();
        if (selectedTreeNode.length !== 1) {
          return ElMessage.warning("必须选择一项");
        }
        selectedTreeNode.forEach((node: any) => {
          node.editable = true;
        });
      },
      [DELETE_TREE_NODE](treeRef: any) {
        const selectedTreeNode = treeRef.getCheckedNodes();
        if (!selectedTreeNode.length) {
          return ElMessage.warning("至少选择一项");
        }

        const reqs = selectedTreeNode.map((category: any) => {
          return API.removeCategory(category);
        });

        Promise.all(reqs)
          .then(() => {
            selectedTreeNode.forEach((node: any) => {
              treeRef.remove(node);
            });
          })
          .catch(console.error);
      },
    };

    return {
      treeConfig,
      tableConfig,
      paginationConfig,
      setCategoryAvatar,
      doCategoryAction,
      doAction,
    };
  },
});
</script>
