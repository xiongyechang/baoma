<template>
  <div id="vditor" ref="markdownRef"></div>
</template>

<script lang="ts">
import { onMounted, ref, defineComponent } from "vue";
import API from "@/api/api";
import { HttpResponseCode } from "@/constants/constants";
import { ElMessage, ElNotification } from "element-plus";
import Vditor from "vditor";
import "vditor/dist/index.css";
import isImage from "is-image";
import { useQiniu } from "@/hooks";
// @ts-ignore
import isAudio from "is-audio";

export default defineComponent({
  name: "form-component",
  props: {
    _id: String,
    category: String,
  },
  setup(props) {
    const formData = ref({
      _id: "",
      title: "",
      disabled: false,
      category: props.category,
      relations: [],
      content: "",
    });

    onMounted(async () => {
      if (props._id) {
        formData.value._id = props._id;
        await getCodeSnippet(props._id);
      }
      initMarkdown();
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

    const onSave = async (value?: string) => {
      formData.value.content = value || "";
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

    const onContentChange = (value: string) => {
      console.count("content change == " + value);
      formData.value.content = value;
    };

    const markdownRef = ref<Element | null>(null);

    const vditor = ref<Vditor | null>(null);

    const height = ref(0);

    const { upload } = useQiniu();

    const initMarkdown = () => {
      const thisElement = markdownRef.value;
      if (!thisElement) return;
      const parentElement = thisElement.parentElement;
      if (parentElement) {
        height.value = parentElement.offsetHeight;
      }

      vditor.value = new Vditor("vditor", {
        height: height.value,
        cdn: "https://cdn.xiongyechang.com/vditor",
        mode: "sv",
        fullscreen: {
          index: 520,
        },
        toolbar: [
          "emoji",
          "headings",
          "bold",
          "italic",
          "strike",
          "|",
          "line",
          "quote",
          "list",
          "ordered-list",
          "check",
          "outdent",
          "indent",
          "code",
          "inline-code",
          "insert-after",
          "insert-before",
          "undo",
          "redo",
          "upload",
          "link",
          "table",
          "record",
          "edit-mode",
          "both",
          "preview",
          "fullscreen",
          "outline",
          "code-theme",
          "content-theme",
          "export",
          "devtools",
          "info",
          "help",
          "br",
          {
            hotkey: "⇧⌘S",
            name: "sponsor",
            tipPosition: "s",
            tip: "保存",
            className: "right",
            icon: '<svg t="1640361319243" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5443" width="200" height="200"><path d="M1008.00076 6.285714q18.857143 13.714286 15.428571 36.571429l-146.285714 877.714286q-2.857143 16.571429-18.285714 25.714285-8 4.571429-17.714286 4.571429-6.285714 0-13.714286-2.857143l-258.857142-105.714286-138.285715 168.571429q-10.285714 13.142857-28 13.142857-7.428571 0-12.571428-2.285714-10.857143-4-17.428572-13.428572T365.715046 987.428571v-199.428571l493.714285-605.142857-610.857142 528.571428-225.714286-92.571428q-21.142857-8-22.857143-31.428572-1.142857-22.857143 18.285714-33.714285L969.143617 5.142857q8.571429-5.142857 18.285714-5.142857 11.428571 0 20.571429 6.285714z" p-id="5444"></path></svg>',
            click() {
              const value = vditor.value?.getValue();
              onSave(value);
            },
          },
        ],
        preview: {
          actions: [],
          hljs: {
            enable: true,
            lineNumber: true,
            style: "github",
          },
        },
        value: formData.value.content,
        cache: {
          enable: false,
        },
        counter: {
          enable: true,
        },
        after() {
          vditor.value?.setValue(formData.value.content);
        },
        upload: {
          async handler([file]) {
            let message = ``;
            try {
              // @ts-ignore
              const url = await upload(file);

              const name = file && file.name;

              let succFileText = "";

              if (vditor.value?.vditor?.currentMode === "wysiwyg") {
                succFileText += `\n <img alt=${name} src="${url}">`;
              } else {
                if (isImage(name)) {
                  succFileText += `\n![${name}](${url})`;
                } else if (isAudio(name)) {
                  succFileText += `\n<audio src='${url}' controls></audio>`;
                } else {
                  succFileText += `\n[${name}](${url})`;
                }
              }

              document.execCommand("insertHTML", false, succFileText);

              message = `${name}上传成功`;
            } catch (e: any) {
              message = e.message;
              console.error(e);
            }
            return message;
          },
        },
      });
    };

    return {
      formData,
      getCodeSnippet,
      onContentChange,
      markdownRef,
    };
  },
});
</script>

<style lang="css">
@import url("https://fonts.googleapis.com/css2?family=Fruktur&family=Roboto+Mono&display=swap");

.markdown {
  word-break: break-all;
  line-height: 2rem;
  font-size: 16px;
  text-align: left;
  font-family: "Roboto Mono", monospace;
  padding-right: 10px;
}

.vditor-tooltipped {
  &::before {
    top: 29px;
    border-bottom-color: #3b3e43;
    border-top-color: transparent;
  }

  &::after {
    bottom: -100%;
  }
}
</style>
