<template>
  <tree-table
    :treeConfig="treeConfig"
    :tableConfig="tableConfig"
    :paginationConfig="paginationConfig"
  >
    <!-- 树组件的分组 -->
    <template #tree-control-bar="{ data }">
      <el-row :gutter="10" style="padding: 5px 5px 5px 25px; height: 40px">
        <el-col>
          <el-button
            type="primary"
            :icon="Plus"
            @click="doAction(ADD_TREE_NODE, data)"
            >添加</el-button
          >
          <el-button
            type="success"
            :icon="Edit"
            @click="doAction(UPDATE_TREE_NODE, data)"
            >更新</el-button
          >
          <el-button
            type="danger"
            :icon="Delete"
            @click="doAction(DELETE_TREE_NODE, data)"
            >删除</el-button
          >
        </el-col>
      </el-row>
    </template>

    <!-- 树组件的插槽 -->
    <template #tree-list="{ data }">
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

    <!-- 树组件的分组 -->
    <template #table-control-bar>
      <el-row class="table-widget-top">
        <el-col :span="8">
          <el-button
            type="primary"
            :icon="Plus"
            @click="doAction(ADD_TABLE_ROW, null)"
            >添加</el-button
          >
          <el-button
            type="danger"
            :icon="Delete"
            @click="doAction(DELETE_TABLE_ROW, null)"
            >删除</el-button
          >
        </el-col>
        <el-col :span="8"></el-col>
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索词"
            v-model="keyword"
            @input="searchCodeSnippets"
          ></el-input>
        </el-col>
      </el-row>
    </template>

    <!-- 列表组件的插槽 -->
    <template #table-list>
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
    </template>
  </tree-table>
  <div></div>
</template>

<script lang="ts">
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
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
import dayjs from "dayjs";

export default defineComponent({
  name: "admin-page",
  components: {
    TreeTable,
  },
  setup() {
    const router = useRouter();

    const { upload } = useQiniu();

    const page = ref(1),
      limit = ref(20),
      keyword = ref("");

    const multipleSelection = ref<string[]>([]);

    const getId = (node?: Node) =>
      node && node.data && node.data._id === "#0001"
        ? undefined
        : node?.data?._id;

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

    const getCodeSnippets = async () => {
      try {
        const { code, message, data } = await API.getCodeSnippets({
          page: page.value,
          limit: limit.value,
          categoryId: getId(selectedTreeNode.value),
          keyword: keyword.value,
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

    const searchCodeSnippets = () => {
      page.value = 1;
      getCodeSnippets();
    };

    getCodeSnippets();

    const onNodeClick = (
      data: TreeNodeData,
      node: Node,
      e: MouseEvent
    ): MouseEvent => {
      keyword.value = "";
      selectedTreeNode.value = node;
      getCodeSnippets();
      return e;
    };

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
      getCodeSnippets();
    };

    const currentSizeChange = (size: number) => {
      page.value = 1;
      limit.value = size;
      getCodeSnippets();
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
      if (category.data._id.length === ADD_ID_LENGTH) {
        request = API.addCategory;
      } else {
        request = API.updateCategory;
      }
      try {
        const { code, message, data } = await request(category.data);
        if (code === HttpResponseCode.OK) {
          ElMessage.success(message);
          Object.assign(category.data, {
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

    const doAction = (action: keyof typeof TreeTableActions, data: any) => {
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
              getCodeSnippets();
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

    const getCategoryAvatar = (category: any) => {
      return (category && category.avatar) || "";
    };

    return {
      treeConfig,
      tableConfig,
      paginationConfig,
      setCategoryAvatar,
      getCategoryAvatar,
      doCategoryAction,
      searchCodeSnippets,
      doAction,
      dayjs,
      Plus,
      Edit,
      Delete,
      keyword,
      ...TreeTableActions,
    };
  },
});
</script>

<style lang="scss"></style>
