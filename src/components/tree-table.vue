<template>
	<div class="grid">
		<div>
			<el-row :gutter="10" style="padding: 5px 5px 5px 25px; height: 48px">
				<el-col>
					<el-button
						type="primary"
						size="mini"
						icon="el-icon-plus"
						@click="appendToTree"
						>添加</el-button
					>
					<el-button
						type="success"
						size="mini"
						icon="el-icon-edit-outline"
						@click="updateCategory"
						>更新</el-button
					>
					<el-button
						type="danger"
						size="mini"
						icon="el-icon-remove"
						@click="removeCategories"
						>删除</el-button
					>
				</el-col>
			</el-row>
			<el-tree
				ref="treeRef"
				:indent="0"
				:data="treeData"
				:props="treeOptions"
				node-key="_id"
				show-checkbox
				:expand-on-click-node="false"
				:default-expanded-keys="defaultExpandedKeys"
				:highlight-current="true"
				@node-click="nodeClickHandler"
				v-loading="!treeData.length"
			>
				<template class="custom-tree-node" #default="{ data }">
					<template v-if="data.editable">
						<!-- 出发了点击事件,所以报错了 -->
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
								@click.stop="setCategoryAvatar(data)"
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
				<el-col :span="4">
					<el-button
						type="primary"
						size="mini"
						icon="el-icon-plus"
						@click="addCodeSnippet"
						>添加</el-button
					>
					<el-button
						type="danger"
						size="mini"
						icon="el-icon-remove"
						@click="removeCodeSnippets"
						>删除</el-button
					>
				</el-col>
				<el-col :span="12"></el-col>
				<el-col :span="8">
					<el-input size="mini" placeholder="请输入搜索词" v-model="keyword">
					</el-input>
				</el-col>
			</el-row>
			<el-table
				:data="tableData"
				border
				stripe
				highlight-current-row
				:row-class-name="rowClass"
				@selection-change="selectionChange"
				size="mini"
				height="100%"
				v-loading="tableLoading"
			>
				<el-table-column type="selection" width="40"></el-table-column>
				<el-table-column type="" label="类型" width="50">
					<template #default="scope">
						<img
							:src="getCategoryAvatar(scope.row.category)"
							alt=""
							width="20"
							height="20"
						/>
					</template>
				</el-table-column>
				<el-table-column type="" label="编号" width="50">
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
							@click="updateCodeSnippet(scope.row)"
							type="text"
							size="small"
							>更新</el-button
						>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				size="mini"
				@current-change="currentPageChange"
				@size-change="currentSizeChange"
				background
				:current-Page="page"
				:page-size="limit"
				:page-sizes="[5, 10, 20, 40, 60, 100]"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
				class="table-widget-bottom"
			></el-pagination>
		</div>
	</div>
</template>

<script>
	import { ref, reactive, toRefs, getCurrentInstance } from "vue";

	import API from "@/api/api";
	import randomstring from "randomstring";
	import qiniuMixin from "@/mixins/qiniu";
	import dayjs from "dayjs";
	import { HttpResponseCode } from "@/constants/constants";
	import { ElMessage } from "element-plus";
	import { useRoute, useRouter } from "vue-router";
	import UtilsMixin from "@/mixins/utils";

	const ADD_ID_LENGTH = 8; // 添加的节点 _id 的长度

	export default {
		name: "tree-table",
		props: {
			treeData: Array,
			treeOptions: Object,
			tableColumns: {
				type: Array,
			},
			defaultExpandedKeys: Array,
		},
		mixins: [qiniuMixin, UtilsMixin],
		setup(props, context) {
			// 获取路由器实例
			const router = useRouter();
			// route是响应式对象,可监控器变化
			const route = useRoute();

			const tableLoading = ref(false);

			const _data = reactive({
				selectedTreeNode: null, // 点击树节点后才会有值
				selectedCodeSnippet: null,
				tableData: [],
				page: 1,
				limit: 20,
				total: 0,
				keyword: "",
				multipleSelection: [],
			});

			const treeRef = ref(null);

			const { ctx } = getCurrentInstance();

			const rowClass = ({ row }) => (row.disabled ? "code-snippet-disabled" : "");

			const nodeClickHandler = (data, node) => {
				_data.selectedTreeNode = node;
				getCodeSnippetsByCategory(data._id);
			};

			const getCodeSnippets = async () => {
				try {
					const {
						code,
						message,
						data: { rows, count },
					} = await API.getCodeSnippets(_data.page, _data.limit);
					if (code === HttpResponseCode.OK) {
						_data.tableData = rows;
						_data.total = count;
					} else {
						ElMessage.error(message);
					}
				} catch (error) {
					console.error(error);
				}
			};

			const getCodeSnippetsByCategory = async (_id) => {
				tableLoading.value = true;
				const root = treeRef.value.root.childNodes[0];
				let response = null;
				try {
					if (_id === root.data._id) {
						response = await API.getCodeSnippets(_data.page, _data.limit);
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

			const deleteRow = (row) => {
				console.log(row);
			};

			const appendToTree = () => {
				const root = treeRef.value.root.childNodes[0];
				treeRef.value.append(
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
				); // root 是指树的第一级节点
			};

			const updateCategory = () => {
				const selectedTreeNode = treeRef.value.getCheckedNodes();
				if (selectedTreeNode.length !== 1) {
					ElMessage.warning("必须选择一项");
				} else {
					selectedTreeNode.forEach((node) => {
						node.editable = true;
					});
				}
			};

			const removeCategories = () => {
				const selectedTreeNode = treeRef.value.getCheckedNodes();
				if (selectedTreeNode.length) {
					const reqs = selectedTreeNode.map((category) => {
						return API.removeCategory(category);
					});
					Promise.all(reqs)
						.then(() => {
							selectedTreeNode.forEach((node) => {
								treeRef.value.remove(node);
							});
						})
						.catch(console.error);
				}
			};

			const doCategoryAction = async (category, event) => {
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
							title: event.target.value,
							editable: false,
						});
					} else {
						ElMessage.error(message);
					}
				} catch (error) {
					console.error(error);
				}
			};

			const setCategoryAvatar = async (data) => {
				const fileUploadDOM = document.getElementById(`${data._id}`);
				fileUploadDOM.addEventListener(
					"change",
					async (event) => {
						const file = event.target.files[0];
						const avatar = await ctx.uploadToQiniu(file);
						Reflect.set(data, "avatar", avatar);
						await API.updateCategory(data);
					},
					false
				);
				fileUploadDOM.click();
			};

			const currentPageChange = (page) => {
				_data.page = page;
				if (_data.selectedTreeNode) {
					getCodeSnippetsByCategory(_data.selectedTreeNode.data._id);
				} else {
					getCodeSnippets();
				}
			};

			const currentSizeChange = (size) => {
				_data.limit = size;
				if (_data.selectedTreeNode) {
					getCodeSnippetsByCategory(_data.selectedTreeNode.data._id);
				} else {
					getCodeSnippets();
				}
			};

			const addCodeSnippet = () => {
				if (!_data.selectedTreeNode) {
					ElMessage({
						type: `warning`,
						message: `请先选择一个树节点【除了全部节点之外】`
					})
					return;
				} else {
					if(_data.selectedTreeNode.data.title === `全部`) {
						ElMessage({
							type: `warning`,
							message: `请先选择一个树节点【除了全部节点之外】`
						});
						return;
					};
				}
				const { _id: category } = _data.selectedTreeNode.data;
				_data.selectedCodeSnippet = null;

				router.push({
					name: "form",
					query: {
						category
					}
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
								getCodeSnippets();
							}
							ElMessage({
								type: 'success',
								message: `删除成功`
							})
						})
						.catch(console.error);
				}
			};
			const updateCodeSnippet = (codesnippet) => {
				_data.selectedCodeSnippet = codesnippet;
				router.push({
					name: "form",
					query: {
						_id: codesnippet._id,
					},
				});
			};
			const selectionChange = (list) => {
				_data.multipleSelection = list.map(({ _id }) => _id);
			};

			getCodeSnippets();

			return {
				treeRef,
				tableLoading,
				...toRefs(_data),
				dayjs,
				rowClass,
				nodeClickHandler,
				getCodeSnippets,
				getCodeSnippetsByCategory,
				deleteRow,
				appendToTree,
				updateCategory,
				removeCategories,
				doCategoryAction,
				setCategoryAvatar,
				currentPageChange,
				currentSizeChange,
				addCodeSnippet,
				removeCodeSnippets,
				updateCodeSnippet,
				selectionChange,
			};
		},
	};
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
</style>