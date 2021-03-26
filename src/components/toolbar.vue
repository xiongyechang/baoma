<template>
	<div class="toolbar">
		<span v-for="tool in toolbar" class="tool-icon" @click="doAction({
			action: tool.action
		})" :key="tool.icon" :title="tool.title">
			<el-popover
				v-if="tool.action === 'image'"
				trigger="hover"
				placement="bottom"
				:width="120"
				v-model:visible="visible">
					<p class="image-action" @click="doAction({
						action: 'imageActionUpload'
					})">
					上传图片
					<input type="file" accept="jpg,png,gif,webp,jpeg,avif" style="display: none;">
					</p>
					<p class="image-action" @click="doAction({
						action: tool.action
					})">添加图片链接</p>
					<template #reference>
						<i class="iconfont" :class="tool.icon"></i>
					</template>
			</el-popover>
			<i v-else class="iconfont" :class="tool.icon"></i>
		</span>
	</div>
</template>

<script>
	import { reactive, toRefs, getCurrentInstance } from 'vue'
	import QiniuMixin from '@/mixins/qiniu'
	import path from 'path'

	const Actions = {
		Save: 'save',
		Link: 'link',
		Image: 'image',
		Download: 'download',
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

			const _data = reactive({
				Actions,
				visible: false,
				toolbar: [{
					title: '保存',
					icon: 'icon-save',
					action: 'save'
				}, {
					title: '链接',
					icon: 'icon-link',
					action: 'link'
				}, {
					title: '图片',
					icon: 'icon-image',
					action: 'image'
				}, {
					title: '下载',
					icon: 'icon-download',
					action: 'download'
				}],
			})

			const doAction = ({ action, data }) => {
	            ctx[`${action}Action`]&&ctx[`${action}Action`](data)
	        }

	        const imageAction = data => {
	            console.log(data)
	        }

	        const linkAction = data => {
	            console.log(data)
	        }

	        const imageActionUploadAction = async data => {
	            const inputDOM = document.querySelector('.image-action input[type="file"]')
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

	        const imageActionUrlAction = data => {
	            console.log(data)
	        }


	        const saveAction = data => {
	        	context.emit('action', {
	        		action: Actions.Save
	        	})
	        }

	        const previewModeAction = data => {
            	// document.querySelector('.page-content-row').style.display = 'none';
        	}

			return {
				...toRefs(_data),
				doAction,
	            imageAction,
	            imageActionUploadAction,
	            imageActionUrlAction,
	            linkAction,
	            saveAction,
	            previewModeAction
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