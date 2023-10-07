<template>
  <HtmlMarkdown v-model:value="formData.content" @save="onSave"></HtmlMarkdown>
</template>

<script lang="ts">
import { defineAsyncComponent, onMounted, ref } from "vue";
import API from "@/api/api";
import { HttpResponseCode } from "@/constants/constants";
import { ElMessage, ElNotification } from "element-plus";
import Empty from "./empty.vue";

export default {
  name: "form-component",
  components: {
    HtmlMarkdown: defineAsyncComponent({
      // 工厂函数
      loader: () => import("@/components/html-markdown.vue"),
      errorComponent: Empty,
      loadingComponent: Empty,
      delay: 0,
      timeout: 3000,
      // 定义组件是否可挂起 | 默认值：true
      suspensible: false,
      onError(error, retry, fail, attempts) {
        if (error.message.match(/fetch/) && attempts <= 3) {
          // 请求发生错误时重试，最多可尝试 3 次
          retry();
        } else {
          // 注意，retry/fail 就像 promise 的 resolve/reject 一样：
          // 必须调用其中一个才能继续错误处理。
          fail();
        }
      },
    }),
  },
  props: {
    _id: String,
    category: String,
  },
  // @ts-ignore
  setup(props) {
    const formData = ref({
      _id: "",
      title: "",
      disabled: false,
      category: props.category,
      relations: [],
      content: "",
    });

    onMounted(() => {
      if (props._id) {
        formData.value._id = props._id;
        getCodeSnippet(props._id);
      }
    });

    const getCodeSnippet = async (_id: string) => {
      try {
        const { code, message, data } = await API.getCodeSnippet(_id);
        if (code === HttpResponseCode.OK) {
          formData.value = data;
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const onSave = async (value: string) => {
      formData.value.content = value;
      const request = formData.value._id
        ? API.updateCodeSnippet
        : API.addCodeSnippet;
      try {
        const reg = /^# (.*)\n?/;
        if (reg.test(formData.value.content)) {
          formData.value.title = RegExp.$1;
        }
        const { code, message, data } = await request(formData.value);
        if (code === HttpResponseCode.OK) {
          Object.assign(formData.value, {
            _id: data._id,
          });
          ElNotification.success({
            message,
            offset: 18,
          });
        } else {
          ElMessage.error(message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    return {
      formData,
      onSave,
      getCodeSnippet,
    };
  },
};
</script>

<style lang="css" scoped></style>
