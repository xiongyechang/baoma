<template>
	<div class="toolbar">
		<span v-for="tool in toolbar" :key="tool.action" :id="tool.id" class="tool-icon" :title="tool.title">
			<el-popover
				v-if="tool.type === 'select'"
				trigger="hover"
				placement="bottom"
				:width="120"
				v-model:visible="visible">
					<p v-for="el in tool.children" :key="el.action" :id="el.id" class="image-action">{{ el.title }}</p>
					<template #reference>
						<i class="iconfont" :class="tool.icon"></i>
					</template>
			</el-popover>
			<i v-else class="iconfont" :class="tool.icon"></i>
		</span>
		<input type="file" accept="image/*" style="display: none;">
	</div>
</template>

<script>
	import { reactive, toRefs, onMounted, getCurrentInstance } from 'vue'
	import QiniuMixin from '@/mixins/qiniu'
	import path from 'path'

	const Actions = {
		Save: 'save',
		Link: 'link',
		Image: 'image',
		Download: 'download',
		UploadImage: 'uploadImage',
		AddImageLink: 'addImageLink',
		PreviewMode: 'previewMode'
	}

	export default {
		name: 'toolbar',
		mixins: [QiniuMixin],
		emits: {
			click: null,
			action(data){
				return Object.values(Actions).includes(data.action);
			}
		},
		setup (props, context) {

			const { ctx } = getCurrentInstance()

			const store = reactive({
				Actions,
				visible: false,
				toolbar: [{
					type: 'button',
					title: '保存',
					id: 'save-action-btn',
					icon: 'icon-save',
					action: Actions.Save
				}, {
					type: 'button',
					title: '链接',
					id: 'link-action-btn',
					icon: 'icon-link',
					action: Actions.Link
				}, {
					type: "select",
					title: '图片',
					id: 'image-action-btn',
					icon: 'icon-image',
					action: Actions.Image,
					children: [{
						type: 'button',
						title: '上传图片',
						id: 'upload-image-action-btn',
						icon: 'icon-image',
						action: Actions.UploadImage
					}, {
						type: 'button',
						title: '添加图片链接',
						id: 'add-image-action-btn',
						icon: 'icon-image',
						action: Actions.AddImageLink
					}]
				}, {
					type: 'button',
					title: '下载',
					id: 'download-action-btn',
					icon: 'icon-download',
					action: Actions.Download
				}],
			});

			onMounted(() => {

				const map = {
					[Actions.Save]: saveAction,
					[Actions.Link]: linkAction,
					[Actions.UploadImage]: uploadImageAction,
					[Actions.Download]: downloadAction
				}

				store.toolbar.forEach(function iter(el) {
					const btn = document.querySelector(`#${el.id}`);
					btn.addEventListener(`click`, map[el.action], false);
					return Array.isArray(el.children)&&el.children.length&&el.children.forEach(iter);
				});
			})

			const doAction = ({ action, data }) => {
	            ctx[`${action}Action`]&&ctx[`${action}Action`](data)
	        }

			// 上传图片
	        const uploadImageAction = async () => {
	            const inputDOM = document.querySelector('input[type="file"]')
	            if(inputDOM){
	                inputDOM.onchange = async event => {
	                    const file = event.target.files[0]
	                    if (file) {
	                        const fileUrl = await ctx.uploadToQiniu(file)
	                        const basename = path.basename(fileUrl)
	                        context.emit('action', {
	                        	action: 'upload',
	                        	data: {
	                        		filePath: fileUrl,
	                        		fileName: basename
	                        	}
	                        })
	                    }
	                }

	                inputDOM.click()
	            }
	        }

			// 保存
	        const saveAction = data => {
	        	context.emit('action', {
	        		action: Actions.Save
	        	})
	        }

			// 下载
			const downloadAction = data => {
				console.log(data);
			}

			// 锚点链接
			const linkAction = data => {
				console.log(data);
			}

			return {
				...toRefs(store),
				doAction,
	            saveAction,
				uploadImageAction,
				downloadAction,
				linkAction
			}
		}
	}
</script>

<style lang="scss" scoped>
.toolbar {
	padding: 0 10px;
	height: 36px;
    line-height: 36px;
}

.tool-icon {
    display: inline-block;
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    box-sizing: border-box;
    position: relative;
	cursor: pointer;
}

.tool-icon:hover {
    background: #e7e7e7;
}

.image-action {
    padding: 5px 0;
    cursor: pointer;
}

.image-action:hover{
    color: var(--primary-color);
}

.iconfont {
    font-size: 22px;
}
</style>