<template>
  <div class="search-list full-height">
    <div>
      <el-input placeholder="请输入内容" v-model="keyword" clearable>
        <template #prepend>
          <el-select
            v-model="category"
            @change="seachCodeSnippets"
            placeholder="请选择"
          >
            <el-option
              v-for="item of options"
              :key="item._id"
              :label="item.title"
              :value="item._id"
            >
              <code-category :data="item"></code-category>
            </el-option>
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="seachCodeSnippets"></el-button>
        </template>
      </el-input>
    </div>
    <div class="list-outter">
      <ul class="list-inner">
        <li
          class="list-item"
          :class="{
            current: c === currentListItem,
          }"
          v-for="(c, index) of list"
          :key="index"
          @click="rowClick(c)"
        >
          <div class="list-item--head">
            <img
              :src="getCategoryAvatar(c.category)"
              loading="lazy"
              width="32"
              height="32"
            />
          </div>
          <div class="list-item--body">
            <div class="title">{{ c.title }}</div>
          </div>
        </li>
      </ul>
      <div v-if="noMore" class="no-more">没有更多数据了</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import CodeCategory from "@/components/code-category.vue";
import API from "@/api/api";
import { HttpResponseCode } from "@/constants/constants";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "search-component",
  components: { CodeCategory },
  setup(_props, { emit }) {
    const keyword = ref<string>("");

    const category = ref<string>("");

    const options = ref<any[]>([]);

    const total = ref(0);
    const page = ref(1);
    const limit = ref(20);

    const list = ref<any[]>([]);

    const noMore = computed(() => list.value.length === total.value);

    const currentListItem = ref();

    const handleScroll = () => {
      const outterDOM = document.querySelector(
        ".list-outter"
      ) as HTMLDivElement;
      const innerDOM = document.querySelector(".list-inner") as HTMLDivElement;
      const outterDOMHeight = outterDOM.clientHeight;
      const innerDOMHeight = innerDOM.clientHeight;
      if (innerDOMHeight < outterDOMHeight) {
        return;
      }
      outterDOM.onscroll = () => {
        if (outterDOMHeight + outterDOM.scrollTop >= innerDOMHeight) {
          if (list.value.length === total.value) {
            return;
          }
          if (page.value < Math.ceil(total.value / limit.value)) {
            page.value++;
            getCodeSnippets();
          }
        }
      };
    };

    const getCodeSnippets = async () => {
      try {
        const {
          code,
          message,
          data: { rows, count },
        } = await API.getCodeSnippets(page.value, limit.value);
        if (code === HttpResponseCode.OK) {
          total.value = count;
          if (page.value === 1) {
            list.value = rows;
          } else {
            list.value.push.apply(list.value, rows); // 超大数据量时，push方法不创建新的数组，可以降低内存
          }
          nextTick(() => {
            handleScroll();
          });
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const seachCodeSnippets = async () => {
      page.value = 1;

      if (category.value == "0") {
        getCodeSnippets();
        return;
      }

      try {
        const {
          code,
          message,
          data: { rows, count },
        } = await API.searchCodeSnippets(
          keyword.value,
          category.value,
          page.value,
          limit.value
        );
        if (code === HttpResponseCode.OK) {
          list.value = rows;
          total.value = count;
          nextTick(() => {
            handleScroll();
          });
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getCodeCategories = async () => {
      try {
        const {
          code,
          message,
          data: { rows },
        } = await API.getCodeCategories();

        if (code === HttpResponseCode.OK) {
          options.value = rows.reduce(
            function (prev: any[], curr: any) {
              return prev.concat(curr);
            },
            [
              {
                _id: 0,
                title: "全部",
                avatar: "https://cdn.xiongyechang.com/all.png",
              },
            ]
          );
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const rowClick = (row: any) => {
      currentListItem.value = row;
      emit("row-click", row);
    };

    const getCategoryAvatar = (category: any) => {
      return (category && category.avatar) || "";
    };

    getCodeCategories();
    getCodeSnippets();

    return {
      keyword,
      category,
      Search,
      seachCodeSnippets,
      options,
      noMore,
      list,
      currentListItem,
      rowClick,
      getCategoryAvatar,
    };
  },
});
</script>

<style lang="scss" scoped>
.search-list {
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
}

.list-outter {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 38px);
}

.list-inner {
  margin: 0;
  padding: 0;
}

.list-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  margin: 5px 0 5px 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px 0 6px 0;
  border: 1px solid rgba(0, 0, 0, 0.3);

  &--head {
    width: 36px;
    height: 36px;
    background-color: #fff;
    display: grid;
    place-items: center;
    margin: 0 5px;
    border-radius: 18px;
    box-shadow: 0 0 5px 5px rgba(255, 255, 255, 0.5);
  }

  &--body {
    flex: 1;
    height: 48px;
    line-height: 48px;
    position: relative;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.current,
.list-item:hover {
  font-weight: bold;
  color: #ffffff;
  background-color: var(--primary-color);
}

.title {
  margin-left: 10px;
}

li {
  list-style: none;
}

::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.no-more {
  text-align: center;
  font-size: 12px;
  height: 20px;
  line-height: 20px;
  margin: 5px 0;
  color: #333333;
}
</style>
