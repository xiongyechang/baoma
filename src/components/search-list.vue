<template>
  <div class="search-list full-height">
    <div class="pad5 flex">
      <el-select v-model="category" @change="seachCodeSnippets" placeholder="请选择">
        <el-option v-for="item of options" :key="item._id" :label="item.title" :value="item._id">
          <code-category :data="item"></code-category>
        </el-option>
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="请输入内容"
        prefix-icon="el-icon-search"
        @change="seachCodeSnippets">
      </el-input>
      <el-button icon="el-icon-search">搜索</el-button>
    </div>
    <div class="list-outter">
      <ul class="list-inner">
        <li class="list-item" :class="{
          current: c === currentListItem
        }" v-for="(c, index) of list" :key="index" @click="rowClick(c)">
          <el-avatar shape="square" size="small" :src="c.category.avatar"></el-avatar>
          <div class="title">{{ c.title }}</div>
          <div class="list-index" :index="index">{{index+1}}</div>
        </li>
      </ul>
      <div v-if="noMore" class="no-more">没有更多数据了</div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, toRefs, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import API from '@/api/api';
import { HttpResponseCode } from '@/constants/constants'
import CodeCategory from '@/components/code-category.vue'

export default {
  name: "search-list",
  components : { CodeCategory },
  setup(props, context) {
    
    const data = reactive({
      keyword: "",
      list: [],
      count: 0,
      page: 1,
      limit: 20,
      category: "",
      options: [],
      currentListItem: null
    })


    const noMore = computed(() => data.list.length === data.count)

    const handleScroll = () => {
      const outterDOM = document.querySelector('.list-outter');
      const innerDOM = document.querySelector('.list-inner');
      const outterDOMHeight = outterDOM.clientHeight;
      const innerDOMHeight = innerDOM.clientHeight;
      if (innerDOMHeight < outterDOMHeight) {
        return;
      }
      outterDOM.onscroll = () => {
        if (outterDOMHeight + outterDOM.scrollTop >= innerDOMHeight) {
          if (data.list.length === data.count) {
            return;
          }
          if (data.page < Math.ceil(data.count / data.limit)) {
            data.page++;
            getCodeSnippets();
          }
        }
      }
    }

    const getCodeSnippets = async () => {
      try {
        const { code, message, data: { rows, count } } = await API.getCodeSnippets(data.page, data.limit);
        if (code === HttpResponseCode.OK) {
          data.count = count;
          if (data.page === 1) {
            data.list = rows;
          } else {
            data.list.push.apply(data.list, rows); // 超大数据量时，push方法不创建新的数组，可以降低内存
          }
          nextTick(() => {
            handleScroll();
          });
        } else {
          ElMessage.error(message)
        }
      } catch (error) {
        console.error(error)
      }
    }

    const getCodeCategories = async () => {
      try {
        const { code, message, data: { rows } } = await API.getCodeCategories();

        if (code === HttpResponseCode.OK) {

          data.options = rows.reduce(function(prev, curr) {
            return prev.concat(curr)
          }, [{
            _id: 0,
            title: "全部",
            avatar: "https://cdn.xiongyechang.com/all.png"
          }]);

        } else {
          ElMessage.error(message)
        }
      } catch (error) {
        console.error(error)
      }
    }
    const rowClick = row => {
      data.currentListItem = row;
      context.emit("row-click", row);
    }


    const seachCodeSnippets = async () => {
      data.page = 1;

      if (data.category === 0) {
        getCodeSnippets();
        return;
      }

      try {
        const { code, message, data: { rows, count } } = await API.searchCodeSnippets(data.keyword, data.category, data.page, data.limit);
        if (code === HttpResponseCode.OK) {
          data.list = rows;
          data.count = count;
          nextTick(() => {
            handleScroll();
          });
        } else {
          ElMessage.error(message)
        }
      } catch (error) {
        console.error(error)
      }
    }

    getCodeSnippets();
    getCodeCategories();

    return {
      ...toRefs(data),
      noMore,
      handleScroll,
      getCodeSnippets,
      getCodeCategories,
      rowClick,
      seachCodeSnippets
    }
  }
}
</script>

<style lang="scss" scoped>
.selected {
  background-color: rgba(49, 193, 124, 1) !important;
  font-weight: bold;
  color: #FFFFFF;
}

.search-list {
  background-color: rgb(236, 239, 241);
  display: flex;
  flex-direction: column;
}

.flex {
  display: flex;
  justify-content: flex-start;
  align-items: center;
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
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  margin: 5px;
  border-radius: 5px 0 5px 0;
  position: relative;
  text-align: left;
}

.list-index {
  position: absolute;
  right: 0;
  height:100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  width: 50px;
  padding-right: 10px;
  font-size: 28px;
  transform: rotateZ(30deg);
  color: #e3e3e3;
  font-family: 'fira code retina';
  mix-blend-mode: lighten;
  z-index: 2;
}

.current, .list-item:hover {
  @extend .selected;
}

.list-item:nth-child(odd) {
  background-color: rgb(192, 196, 204);
}

.list-item:nth-child(even) {
  background-color: rgb(192, 196, 204);
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