<template>
  <tree-table
    :treeConfig="treeConfig"
    :tableConfig="tableConfig"
    :paginationConfig="paginationConfig"
  >
    <!-- 树组件的分组 -->
    <template #tree-control-bar>
      <el-row :gutter="10" style="padding: 5px 5px 5px 25px; height: 40px">
        <el-col>
          <el-button type="primary" :icon="Plus" @click="openUpdateDialog"
            >添加</el-button
          >
        </el-col>
      </el-row>
    </template>

    <!-- 树组件的插槽 -->
    <template #tree-list="{ data }">
      <img :src="data.data.avatar" width="18" height="18" alt="" />
      <span class="category-title">{{ data.data.title }}</span>
      <el-space :size="10">
        <el-icon size="18px" @click="openUpdateDialog(data)">
          <Edit />
        </el-icon>

        <el-popconfirm
          title="Are you sure to delete this?"
          @confirm="onRemoveDialog(data)"
        >
          <template #reference>
            <el-icon size="18px">
              <Delete />
            </el-icon>
          </template>
        </el-popconfirm>
      </el-space>
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
            :disabled="!selectedTableRow.length"
            type="danger"
            :icon="Delete"
            @click="doAction(DELETE_MULTIPLE_TABLE_ROW, null)"
            >删除
            {{
              selectedTableRow.length ? selectedTableRow.length : null
            }}</el-button
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
      <el-table-column fixed="right" label="操作" width="170">
        <template #default="scope">
          <el-button
            @click="doAction(UPDATE_TABLE_ROW, scope.row)"
            size="small"
            :icon="Edit"
            type="primary"
            >更新</el-button
          >

          <el-popconfirm
            title="Are you sure to delete this?"
            @confirm="doAction(DELETE_TABLE_ROW, scope.row)"
          >
            <template #reference>
              <el-button size="small" :icon="Delete" type="danger"
                >删除</el-button
              >
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </template>
  </tree-table>

  <el-dialog v-model="dialogFormVisible" title="修改分类" width="500">
    <el-form :model="form">
      <el-form-item label="标题">
        <el-input v-model="form.title" autocomplete="off" />
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
          class="avatar-uploader"
          v-model:file-list="fileList"
          :show-file-list="false"
          :on-change="handleFileChange"
          :http-request="onUploadToQiniu"
        >
          <img
            v-if="form.avatar"
            :src="form.avatar"
            width="80"
            height="80"
            class="avatar"
            style="margin-top: 16px"
            alt=""
          />
          <template v-else>
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          @click="doAction(ADD_OR_UPDATE_TREE_NODE, null)"
        >
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { Plus, Edit, Delete, UploadFilled } from "@element-plus/icons-vue";
import { defineComponent, ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  removeCategory,
  updateCategory,
  addCategory,
  removeCodeSnippet,
  fetchCodeCategories,
  fetchCodeSnippets,
  removeCodeSnippets,
} from "@/api/api";
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
import { useRouter } from "vue-router";
import { useQiniu } from "@/hooks";
import dayjs from "dayjs";
import { toRaw, Ref } from "vue";

export default defineComponent({
  name: "admin-page",
  components: {
    TreeTable,
    Delete,
    Edit,
    UploadFilled,
  },
  setup() {
    const router = useRouter();

    const { upload } = useQiniu();

    const dialogFormVisible = ref(false);
    const formLabelWidth = "80px";

    const form = reactive({
      _id: "",
      title: "",
      avatar: "",
    });

    const fileList = ref<File[]>([]);

    const page = ref(1),
      limit = ref(20),
      keyword = ref("");

    const getId = (node?: Node) =>
      node && node.data && node.data._id === "#0001"
        ? undefined
        : node?.data?._id;

    const getCodeCategories = async () => {
      try {
        const { code, message, data } = await fetchCodeCategories({
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
              children: rows,
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
        const { code, message, data } = await fetchCodeSnippets({
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

    const treeConfig = ref({
      data: [],
      defaultExpandedKeys: [] as TreeKey[],
      indent: 0,
      props: {},
      nodeKey: "_id",
      expandOnClickNode: false,
      highlightCurrent: true,
      onNodeClick: onNodeClick,
    });

    const selectedTableRow = ref<string[]>([]);
    const selectionChange = (selection: Array<CodeSnippetItem>) => {
      selectedTableRow.value = selection.map((item) => item._id);
    };

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
      background: true,
      "onUpdate:current-page": page.value,
      "onUpdate:page-size": limit.value,
      "onUpdate:page-sizes": [5, 10, 20, 40, 60, 100],
      total: 0,
      layout: "total, sizes, prev, pager, next, jumper",
      onCurrentChange: currentPageChange,
      onSizeChange: currentSizeChange,
    });

    const doAction = (action: keyof typeof TreeTableActions, data: any) => {
      typeof doActionMethods[action] === "function" &&
        doActionMethods[action](data);
    };

    const {
      ADD_TABLE_ROW,
      ADD_TREE_NODE,
      UPDATE_TREE_NODE,
      UPDATE_TABLE_ROW,
      DELETE_TABLE_ROW,
      DELETE_TREE_NODE,
      ADD_OR_UPDATE_TREE_NODE,
      DELETE_MULTIPLE_TABLE_ROW,
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
      async [DELETE_TABLE_ROW](row: any) {
        try {
          const { code, message } = await removeCodeSnippet(row._id);
          if (code === HttpResponseCode.OK) {
            ElMessage({
              type: "success",
              message,
            });
            getCodeSnippets();
          } else {
            ElMessage({
              type: "error",
              message,
            });
          }
        } catch (error) {
          console.error(error);
        }
      },
      async [DELETE_MULTIPLE_TABLE_ROW]() {
        try {
          const { code, message } = await removeCodeSnippets(
            selectedTableRow.value
          );
          if (code === HttpResponseCode.OK) {
            ElMessage({
              type: "success",
              message,
            });
            getCodeSnippets();
          } else {
            ElMessage({
              type: "error",
              message,
            });
          }
        } catch (error) {
          console.error(error);
        }
      },
      async [ADD_TREE_NODE]() {
        const { _id, ...rest } = toRaw(form);
        const { code, message, data } = await addCategory(rest);
        debugger;
        if (code === HttpResponseCode.OK) {
          ElMessage.success(message);
          Object.assign(form, {
            _id: data._id,
          });
          dialogFormVisible.value = false;
          getCodeCategories();
        } else {
          ElMessage.error(message);
        }
      },
      async [UPDATE_TREE_NODE]() {
        const { _id, ...rest } = toRaw(form);
        const { code, message } = await updateCategory(_id, rest);
        if (code === HttpResponseCode.OK) {
          ElMessage.success(message);
          dialogFormVisible.value = false;
          getCodeCategories();
        } else {
          ElMessage.error(message);
        }
      },
      async [DELETE_TREE_NODE]() {
        const { _id } = toRaw(form);
        const { code, message } = await removeCategory(_id);
        if (code === HttpResponseCode.OK) {
          ElMessage.success(message);
          dialogFormVisible.value = false;
          getCodeCategories();
        } else {
          ElMessage.error(message);
        }
      },
      [ADD_OR_UPDATE_TREE_NODE]() {
        if (form._id) {
          doAction(UPDATE_TREE_NODE, null);
        } else {
          doAction(ADD_TREE_NODE, null);
        }
      },
    };

    const getCategoryAvatar = (category: any) => {
      return (category && category.avatar) || "";
    };

    const openUpdateDialog = (params: any) => {
      const data = params.data || {};
      form._id = data._id || "";
      form.title = data.title || "";
      form.avatar = data.avatar || "";
      dialogFormVisible.value = true;
    };

    const handleFileChange = (_uploadFile, uploadFiles) => {
      fileList.value = uploadFiles;
    };

    const onUploadToQiniu = () => {
      upload(fileList.value[0]).then((res: any) => {
        form.avatar = res;
      });
    };

    const onRemoveDialog = (params: any) => {
      const data = params.data || {};
      form._id = data._id || "";
      form.title = data.title || "";
      form.avatar = data.avatar || "";
      doAction(DELETE_TREE_NODE, null);
    };

    return {
      treeConfig,
      tableConfig,
      paginationConfig,
      getCategoryAvatar,
      searchCodeSnippets,
      doAction,
      dayjs,
      Plus,
      Edit,
      Delete,
      keyword,
      dialogFormVisible,
      formLabelWidth,
      openUpdateDialog,
      onRemoveDialog,
      form,
      fileList,
      selectedTableRow,
      handleFileChange,
      onUploadToQiniu,
      ...TreeTableActions,
    };
  },
});
</script>

<style lang="scss">
.el-tree {
  --el-tree-node-content-height: 40px;
}
</style>
