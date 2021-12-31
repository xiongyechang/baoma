<template>
	<div :ref="ref => markdownRef=ref"></div>
</template>

<script>
import { 
	ref,
	unref,
	defineComponent,
	watch,
	onMounted,
	onUpdated,
	getCurrentInstance,
} from "vue";
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import QiniuMixin from "../mixins/qiniu";
import isImage from 'is-image';

let markdownInstance = {};

export default defineComponent({
	name: "html-markdown",
	inheritAttrs: false,
	props: {
    value: { type: String, default: '' },
	},
	emits: ['change', 'get', 'update:value', 'save'],
	mixins: [QiniuMixin],
	setup(props, { attrs, emit }) {

		const markdownRef = ref(null);

		const height = ref(0);

		const instance = getCurrentInstance();

		console.log(instance);

		const { ctx } = instance; 

		watch(() => props.value, (newValue, oldValue) => {
			if (newValue !== oldValue) {
				setTimeout(() => {
					const vditor = markdownInstance;
					if (vditor) {
						try {
							typeof vditor.setValue === 'function' && vditor.setValue(props.value)
						} catch(e) {
							console.error(e);
							location.reload();
						}
					}
				}, 100)
			}
		})

		onMounted(() => {
			initMarkdown();
		})

		onUpdated(() => {
			console.log(`updated`, props.value);
		})

		const initMarkdown = () => {
			const markdownDOM = unref(markdownRef);
			if (!markdownDOM) {
				return;
			}
			const thisElement = markdownRef.value;
			const parentElement = thisElement.parentElement;
			if(parentElement) {
				height.value = parentElement.offsetHeight;
			}
			const bindValue = { ...attrs, ...props };
			markdownInstance = new Vditor(markdownDOM, {
				height: height.value,
				mode: 'sv',
				fullscreen: {
					index: 520,
				},
				toolbar: [
					'emoji', 'headings', 'bold', 'italic', 'strike', '|',
					'line', 'quote', 'list', 'ordered-list', 'check',
					'outdent', 'indent', 'code', 'inline-code', 'insert-after',
					'insert-before', 'undo', 'redo', 'upload', 'link', 'table',
					'record', 'edit-mode', 'both', 'preview', 'fullscreen', 'outline',
					'code-theme', 'content-theme', 'export', 'devtools', 'info', 'help', 'br',
					{
						hotkey: '⇧⌘S',
						name: 'sponsor',
						tipPosition: 's',
						tip: '保存',
						className: 'right',
						icon: '<svg t="1640361319243" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5443" width="200" height="200"><path d="M1008.00076 6.285714q18.857143 13.714286 15.428571 36.571429l-146.285714 877.714286q-2.857143 16.571429-18.285714 25.714285-8 4.571429-17.714286 4.571429-6.285714 0-13.714286-2.857143l-258.857142-105.714286-138.285715 168.571429q-10.285714 13.142857-28 13.142857-7.428571 0-12.571428-2.285714-10.857143-4-17.428572-13.428572T365.715046 987.428571v-199.428571l493.714285-605.142857-610.857142 528.571428-225.714286-92.571428q-21.142857-8-22.857143-31.428572-1.142857-22.857143 18.285714-33.714285L969.143617 5.142857q8.571429-5.142857 18.285714-5.142857 11.428571 0 20.571429 6.285714z" p-id="5444"></path></svg>',
						click () {
							const vditor = markdownInstance;
							if (vditor && vditor.getValue instanceof Function) {
								const value = vditor.getValue();
								emit(`save`, value);
							}
						},
					},
				],
				preview: {
					actions: [],
					hljs: {
						enable: true,
						lineNumber: true,
						style: 'monokai'
					}
				},
				cache: {
          enable: false,
        },
				input: (v) => {
					emit('update:value', v);
					emit('change', v);
				},
				after: () => {},
				blur: () => {},
				...bindValue,
				upload: {
					async handler([file]) {
						let message = ``;
						try {
							const url = await ctx.uploadToQiniu(file);
					
							let name = file && file.name;

							let succFileText = "";

							if (markdownInstance && markdownInstance.vditor.currentMode === "wysiwyg") {
									succFileText += `\n <img alt=${name} src="${url}">`;
							} else {
									if (isImage(name)) {
										succFileText += `\n![${name}](${url})`;
									} else {
										succFileText += `\n[${name}](${url})`;
									}
							}

							document.execCommand("insertHTML", false, succFileText);

							message = `${name}上传成功`;
						} catch (e) {
							message = e.message;
							console.error(e);
						}
						return message;
					}
				}
			});
		}


		return {
			markdownRef,
		};
	},
});
</script>

<style lang="scss">
	@import url("https://fonts.googleapis.com/css2?family=Fruktur&family=Roboto+Mono&display=swap");
	.markdown {
		word-break: break-all;
		line-height: 2rem;
		font-size: 16px;
		text-align: left;
		font-family: "Roboto Mono", monospace;
		padding-right: 10px;
	}
</style>