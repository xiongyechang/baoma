<template>
  <div class="grid">
    <div>
      <el-row :gutter="10" style="padding: 5px 5px 5px 25px; height: 40px">
        <el-col>
          <el-button type="primary" :icon="Plus" @click="appendToTree"
            >添加</el-button
          >
          <el-button type="success" :icon="Edit" @click="updateCategory"
            >更新</el-button
          >
          <el-button type="danger" :icon="Delete" @click="removeCategories"
            >删除</el-button
          >
        </el-col>
      </el-row>
      <el-tree
        ref="treeRef"
        v-bind="treeConfig"
        style="height: calc(100% - 50px); overflow: auto"
      >
        <template #default="{ data }">
          <template v-if="data.editable">
            <input
              type="text"
              v-model="data.title"
              @blur="doCategoryAction(data, $event)"
              @click.prevent.stop
            />
          </template>
          <template v-else>
            <div class="flex-center-start">
              <input
                :id="data._id"
                type="file"
                :data-id="data._id"
                style="width: 0; height: 0; overflow: hidden"
              />
              <img
                :src="data.avatar"
                @click.stop.prevent="setCategoryAvatar(data)"
                height="16"
                width="16"
              />
              <span class="category-title">{{ data.title }}</span>
            </div>
          </template>
        </template>
      </el-tree>
    </div>
    <div class="table-widget">
      <el-row class="table-widget-top">
        <el-col :span="8">
          <el-button type="primary" :icon="Plus" @click="addCodeSnippet"
            >添加</el-button
          >
          <el-button type="danger" :icon="Delete" @click="removeCodeSnippets"
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
            <el-button @click="updateCodeSnippet(scope.row)" link size="small"
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
import { ref, reactive, toRefs, defineComponent, PropType } from "vue";
import API from "@/api/api";
import randomstring from "randomstring";
import { useQiniu } from "@/hooks";
import dayjs from "dayjs";
import { HttpResponseCode } from "@/constants/constants";
import { ElMessage, TableProps } from "element-plus";
import { useRouter } from "vue-router";
import { TreeComponentProps } from "element-plus/es/components/tree/src/tree.type";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import { CodeSnippetItem } from "@/typing/code-snippet";
import ElPagination from "element-plus/es/components/pagination";

const ADD_ID_LENGTH = 8; // 添加的节点 _id 的长度

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
    // 获取路由器实例
    const router = useRouter();

    const tableLoading = ref(false);

    const _data = reactive({
      selectedTreeNode: null as any, // 点击树节点后才会有值
      selectedCodeSnippet: null,
      tableData: [],
      page: 1,
      limit: 20,
      total: 0,
      keyword: "",
      multipleSelection: [] as string[],
    });

    const treeRef = ref<HTMLDivElement | null>(null);

    const { upload } = useQiniu();

    const getCodeSnippetsByCategory = async (_id: string) => {
      tableLoading.value = true;
      // @ts-ignore
      const root = treeRef.value?.root?.childNodes[0];
      let response = null;
      try {
        if (_id === root.data._id) {
          response = await API.getCodeSnippets({
            page: _data.page,
            limit: _data.limit,
          });
        } else {
          response = await API.getCodeSnippetsByCategory({
            _id,
            page: _data.page,
            limit: _data.limit,
          });
        }

        const {
          code,
          message,
          data: { count, rows },
        } = response;

        if (code === HttpResponseCode.OK) {
          _data.tableData = rows;
          _data.total = count;
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        tableLoading.value = false;
      }
    };

    const appendToTree = () => {
      // @ts-ignore
      const root = treeRef.value?.root.childNodes[0];
      treeRef.value?.append(
        {
          // @ts-ignore
          _id: randomstring.generate({
            capitalization: "lowercase",
            length: ADD_ID_LENGTH,
          }),
          title: "",
          count: 0,
          editable: true,
        },
        root
      ); // root 是指树的第一级节点
    };

    const updateCategory = () => {
      // @ts-ignore
      const selectedTreeNode = treeRef.value?.getCheckedNodes();
      if (selectedTreeNode.length !== 1) {
        ElMessage.warning("必须选择一项");
      } else {
        // @ts-ignore
        selectedTreeNode.forEach((node) => {
          node.editable = true;
        });
      }
    };

    const removeCategories = () => {
      // @ts-ignore
      const selectedTreeNode = treeRef.value?.getCheckedNodes();
      if (selectedTreeNode.length) {
        const reqs = selectedTreeNode.map((category: any) => {
          return API.removeCategory(category);
        });
        Promise.all(reqs)
          .then(() => {
            selectedTreeNode.forEach((node: HTMLDivElement) => {
              // @ts-ignore
              treeRef.value.remove(node);
            });
          })
          .catch(console.error);
      }
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

    const addCodeSnippet = () => {
      if (!_data.selectedTreeNode) {
        ElMessage({
          type: `warning`,
          message: `请先选择一个树节点【除了全部节点之外】`,
        });
        return;
      } else {
        if (_data.selectedTreeNode.data.title === `全部`) {
          ElMessage({
            type: `warning`,
            message: `请先选择一个树节点【除了全部节点之外】`,
          });
          return;
        }
      }
      const { _id: category } = _data.selectedTreeNode.data;
      _data.selectedCodeSnippet = null;

      router.push({
        name: "form",
        query: {
          category,
        },
      });
    };

    const removeCodeSnippets = () => {
      if (_data.multipleSelection.length) {
        const reqs = _data.multipleSelection.map((_id) => {
          return API.removeCodeSnippet(_id);
        });
        Promise.all(reqs)
          .then(() => {
            if (_data.selectedTreeNode) {
              getCodeSnippetsByCategory(_data.selectedTreeNode.data._id);
            } else {
              // getCodeSnippets();
            }
            ElMessage({
              type: "success",
              message: `删除成功`,
            });
          })
          .catch(console.error);
      }
    };
    const updateCodeSnippet = (codesnippet: any) => {
      _data.selectedCodeSnippet = codesnippet;
      router.push({
        name: "form",
        query: {
          _id: codesnippet._id,
        },
      });
    };

    const getCategoryAvatar = (category: any) => {
      return (category && category.avatar) || "";
    };

    return {
      treeRef,
      tableLoading,
      ...toRefs(_data),
      dayjs,
      getCodeSnippetsByCategory,
      appendToTree,
      updateCategory,
      removeCategories,
      doCategoryAction,
      setCategoryAvatar,
      addCodeSnippet,
      removeCodeSnippets,
      updateCodeSnippet,
      getCategoryAvatar,
      Plus,
      Edit,
      Delete,
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
