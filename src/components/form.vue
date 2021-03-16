<template>
    <div class="admin-page">
        <el-row class="admin-page-toolbar">
            <span v-for="tool in toolbar" class="tool-icon" @click.stop.prevent="doAction({
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
                            action: 'imageActionUrl'
                        })">添加图片链接</p>
                        <template #reference>
                            <i class="iconfont" :class="tool.icon"></i>
                        </template>
                </el-popover>
                <i v-else class="iconfont" :class="tool.icon"></i>
            </span>
        </el-row>
        <el-row class="admin-page-content">
            <el-col :span="12">
                <textarea ref="textareaRef" v-model="form.content" class="editor"></textarea>
            </el-col>
            <el-col :span="12">
                <vue3-markdown-it ref="markdownEditorRef" :source='form.content' :plugins='plugins' />
            </el-col>
        </el-row>
        <el-dialog
        title="提示"
        v-model="dialogVisible"
        :append-to-body="true"
        width="30%">
        <el-form ref="markdownEditorRef" :model="form" :rules="rules" label-width="80px">
            <!-- <el-form-item label="标题" prop="title" required>
                <el-input type="text" v-model="form.title" required></el-input>
            </el-form-item> -->
            <el-form-item label="禁用" prop="disabled" required>
                <el-select filterable v-model="form.disabled" style="width: 100%;" placeholder="是否禁用">
                    <el-option v-for="item of disabledList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="分类" prop="category" required>
                <el-select filterable v-model="form.category" style="width: 100%;" placeholder="请选择分类">
                    <el-option v-for="item of categories" :key="item._id" :label="item.title" :value="item._id">
                        <code-category :data="item"></code-category>
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="关联" prop="relations">
                <el-select filterable multiple v-model="form.relations" style="width: 100%;" placeholder="请选择相关项">
                    <el-option v-for="item of list" :key="item._id" :label="item.title" :value="item._id">
                        <code-category :data="item"></code-category>
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="publish">确 定</el-button>
            </span>
          </template>
    </el-dialog>
    </div>
</template>

<script>
import { ref, reactive, computed, toRefs, getCurrentInstance, onMounted } from 'vue'
import API from '@/api/api'
import CodeCategory from '@/components/code-category.vue'
import _ from 'lodash'
import xss from 'xss'
import fs from 'fs'
import path from 'path'
import { HttpResponseCode } from '@/constants/constants'
import QiniuMixin from '@/mixins/qiniu'
import { ElMessage,  } from 'element-plus'
import { clipboard, shell, remote } from 'electron'
import markdownItMultimdTable from 'markdown-it-multimd-table'
import markdownItAbbr from 'markdown-it-abbr'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItDeflist from 'markdown-it-deflist'
import markdownItEmoji from 'markdown-it-emoji'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItHighlightjs from 'markdown-it-highlightjs'
import markdownItIns from 'markdown-it-ins'
import markdownItMark from 'markdown-it-mark'
import markdownItSub from 'markdown-it-sub'
import markdownItSup from 'markdown-it-sup'
import markdownItTaskLists from 'markdown-it-task-lists'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'


export default {
    name: "admin",
    components : { CodeCategory },
    mixins: [QiniuMixin],
    props: {
        _id: String
    },
    setup(props, context) {

        const { ctx } = getCurrentInstance()

        const markdownEditorRef = ref(null)

        const textareaRef = ref(null)

        const _data = reactive({
            visible: false,
            dialogVisible: false,
            list:[],
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
            plugins: [{ 
                plugin: markdownItMultimdTable
            }, {
                plugin: markdownItAbbr
            }, {
                plugin: markdownItAnchor
            }, {
                plugin: markdownItDeflist
            }, {
                plugin: markdownItEmoji
            }, {
                plugin: markdownItFootnote
            }, {
                plugin: markdownItHighlightjs
            }, {
                plugin: markdownItIns
            }, {
                plugin: markdownItMark
            }, {
                plugin: markdownItSub
            }, {
                plugin: markdownItSup
            }, {
                plugin: markdownItTaskLists
            }, {
                plugin: markdownItTocDoneRight
            }],
            form: {
                _id: '',
                title: '',
                disabled: false,
                category: '',
                relations: [],
                content: ''
            },
            rules: {
                category: [{ required: true, trigger: "blur", message: "请选择分类" }],
                content: [{ required: true, trigger: "blur", message: "请输入内容" }]
            },
            categories: [],
            disabledList: [{
                label: "是",
                value: true
            }, {
                label: "否",
                value: false
            }]
        })

        _data.form._id = props._id;

        const getCodeSnippet = async _id => {
            try {
                const { code, message, data } = await API.getCodeSnippet(_id);
                if (code === HttpResponseCode.OK) {
                    _data.form = data;
                } else {
                    ElMessage.error(message);
                }
            } catch (error) {
                console.error(error);
            }
        }

        const getCodeSnippets = async (page = 1, limit = 20) => {
            try {
                const { code, message, data: { rows } } = await API.getCodeSnippets(page, limit)
                if (code === HttpResponseCode.OK) {
                    _data.list = formatData(rows)
                } else {
                    ElMessage.error(message)
                }
            } catch (error) {
                console.error(error)
            }
        }

        const getCodeCategories = async () => {
            try {
                const { code, message, data: { rows } } = await API.getCodeCategories()
                if (code === HttpResponseCode.OK) {
                    _data.categories = rows
                } else {
                    ElMessage.error(message)
                }
            } catch (error) {
                console.error(error)
            }
        }

        const formatData = rows => {
            return rows.map(row => ({
                ...row,
                avatar: row.category.avatar
            }))
        }

        const markdownClicked = event => {
            event.preventDefault();
            const element = event.target;
            if(element && element.tagName.toLowerCase() === 'a'){
                shell.openExternal(element.href)
            }
        }

        const saveMarkdown = () => {
            fs.writeFileSync("./markdown.md", _data.form.content);
        }

        const addImg = async (pos, file) => {
          try {
            const fileURL = await ctx.uploadToQiniu(file);
            // const editor = this.$refs["mavon-editor"];
            // editor.$img2Url(pos, fileURL);
          } catch (error) {
            console.error(error)
          }
        }

        const save = html => {
            if(!html.trim()) {
                ElMessage.warning("文章内容不能为空")
                return
            }
            try{
                localStorage.setItem("lastest-note", html)
                ElMessage.success("草稿保存成功")
            }catch{
                ElMessage.error("草稿保存失败")
            }
        }

        const publish = () => {
            markdownEditorRef.value.validate(async valid => {
                if (valid) {
                    const request = _data.form._id ? API.updateCodeSnippet : API.addCodeSnippet
                    try {
                        const reg = /^# ([\u4e00-\u9fa5_a-zA-Z0-9]+)\n?/
                        if(reg.test(_data.form.content)){
                            _data.form.title = RegExp.$1
                        }
                        const { code, message, data} = await request(_data.form)
                        if (code === HttpResponseCode.OK) {
                            ElMessage.success(message)
                            Object.assign(_data.form, data)
                        } else {
                            ElMessage.error(message)
                        }
                    } catch (error) {
                        console.error(error)
                    }

                } else {
                    return false;
                }
            });
        }

        const doAction = ({ action, data }) => {
            ctx[`${action}Action`]&&ctx[`${action}Action`](data)
        }

        const imageAction = data => {
            console.log(data)
        }

        const imageActionUploadAction = async() => {
            const inputDOM = document.querySelector('.image-action input[type="file"]')
            if(inputDOM){
                
                inputDOM.onchange = async event => {
                    const file = event.target.files[0]
                    if (file) {
                        const fileUrl = await ctx.uploadToQiniu(file)
                        const basename = path.basename(fileUrl)
                        const imageCode = `![${basename}](${fileUrl})`
                        const position = getCursortPosition(textareaRef.value)
                        _data.form.content = _data.form.content.slice(0, position)+ imageCode +_data.form.content.slice(position)
                    }
                }

                inputDOM.click()
            }
        }

        const imageActionUrlAction = data => {
            console.log(data)
        }


        const saveAction = data => {
            _data.dialogVisible = true
        }


        const getCursortPosition = obj => {
            var cursorIndex = 0;
            if (document.selection) {
                // IE Support
                obj.focus();
                var range = document.selection.createRange();
                range.moveStart('character', -obj.value.length);
                cursorIndex = range.text.length;
            } else if (obj.selectionStart || obj.selectionStart==0) {
                // another support
                cursorIndex = obj.selectionStart;
            }
            return cursorIndex;
        }

        if(props._id){
            getCodeSnippet(props._id)
        }

        getCodeSnippets()

        getCodeCategories()

        return {
            markdownEditorRef,
            textareaRef,
            ...toRefs(_data),
            getCodeSnippet,
            getCodeSnippets,
            getCodeCategories,
            formatData,
            markdownClicked,
            saveMarkdown,
            addImg,
            save,
            publish,
            doAction,
            imageAction,
            imageActionUploadAction,
            imageActionUrlAction,
            saveAction,
            getCursortPosition
        }

    }
}
</script>

<style lang="css" scoped>
.admin-page {
    height: 100%;
    width: 100%;
    text-align: left;
}

.admin-page-toolbar {
    height: 36px;
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

.admin-page-content {
    height: calc(100% - 36px);
}

.row {
    display: flex;
    margin: 0 !important;
}

.row1 {
    padding: 10px;
    background: lightblue;
}

.row2 {
    height: calc(100% - 0px);
}

.row2-col1 {
    padding: 0 !important;
    margin: 0 !important;
    height: 100%;
}

.opt {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 40px;
    border-bottom: 1px solid #f2f6fc;
    padding: 1px 10px;
}

.editor {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
    font-size: 18px;
    line-height: 1.5em;
    color: #333;
    padding: 10px;
    box-sizing: border-box;
}
</style>