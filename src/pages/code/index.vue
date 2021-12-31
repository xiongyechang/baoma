<template>
	<el-row class="full-height">
		<el-col class="pad10 full-height" :span="6">
			<search-list @row-click="rowClick"></search-list>
		</el-col>
		<el-col class="content full-height scrollbar" :span="18">
			<template v-if="markdown">
				<PreviewMarkdown :value="markdown" />
				<ElButton
					class="fixed-button"
					type="primary"
					icon="el-icon-edit"
					circle
					@click="edit(markdown)"
				></ElButton>
			</template>
			<template v-else>
				<Empty />
			</template>
		</el-col>
	</el-row>
</template>

<script>
	import { ref, defineComponent, onActivated } from "vue";
	import SearchList from "@/components/search-list";
	import PreviewMarkdown from "@/components/preview-markdown";
	import API from "@/api/api";
	import { ElMessage } from "element-plus";
	import { useRouter } from "vue-router";
	import { HttpResponseCode } from "@/constants/constants";
	import Empty from "@/components/empty";

	export default defineComponent({
		name: "web",
		components: { SearchList, PreviewMarkdown, Empty },
		setup() {
			const markdown = ref(``);

			const id = ref(``);

			// 获取路由器实例
			const router = useRouter();

			onActivated(() => {
				console.log("onActivated");
			});

			const rowClick = async ({ _id }) => {
				try {
					const { code, message, data } = await API.getCodeSnippet(_id);
					if (code === HttpResponseCode.OK) {
						id.value = _id;
						markdown.value = data.content;
					} else {
						ElMessage.error(message);
					}
				} catch (e) {
					console.error(e);
				}
			};

			const edit = async () => {
				router.push({
					name: "form",
					query: {
						_id: id.value,
					},
				});
			};

			return {
				markdown,
				edit,
				rowClick,
			};
		},
	});
</script>

<style lang="scss" scoped>
	.content {
		position: relative;
		overflow: auto;
		background-color: white;

		.fixed-button {
			position: fixed;
			bottom: 60px;
			right: 30px;
			z-index: 9999;
		}
	}
</style>