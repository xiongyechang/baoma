<template>
    <div class="admin-page">
        <el-row class="admin-page-toolbar">
            <ToolBar @action="doAction"></ToolBar>
        </el-row>
        <el-row class="admin-page-content">
            <el-col :span="12">
                <textarea ref="textareaRef" v-model="form.content" class="editor scrollbar"></textarea>
            </el-col>
            <el-col class="page-content-row scrollbar" :span="12">
                <vue3-markdown-it ref="markdownEditorRef" :source='form.content' :plugins='plugins' />
            </el-col>
        </el-row>
        <el-dialog
        title="提示"
        v-model="dialogVisible"
        :append-to-body="true"
        width="30%">
        <el-form ref="markdownEditorRef" :model="form" :rules="rules" label-width="80px">
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
import { ref, reactive, computed, toRefs, onMounted } from 'vue'
import API from '@/api/api'
import CodeCategory from '@/components/code-category.vue'
import ToolBar from '@/components/toolbar.vue'
import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import { HttpResponseCode } from '@/constants/constants'
import { ElMessage  } from 'element-plus'
import { shell } from 'electron'
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
    components : { CodeCategory, ToolBar },
    props: {
        _id: String
    },
    setup(props, context) {

        const markdownEditorRef = ref(null)

        const textareaRef = ref(null)

        const _data = reactive({
            dialogVisible: false,
            list:[],
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

        const doAction = ({ action, data }) => {
            switch(action) {
                case 'save':_data.dialogVisible = true;break;
                case 'upload': 
                    if(!data){
                        console.log("上传失败")
                        return
                    }
                    const { fileName, filePath } = data;
                    const imageCode = `![${fileName}](${filePath})`;
                    const position = getCursortPosition(textareaRef.value)
                    _data.form.content = _data.form.content.slice(0, position)+ imageCode +_data.form.content.slice(position);break;
            }
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
            save,
            publish,
            doAction,
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
    background-color: lightgray;
}



.admin-page-content {
    height: calc(100% - 36px);
    overflow: hidden;
}

.page-content-row {
    height: 100%;
    padding: 0 10px 10px 10px;
    box-sizing: border-box;
    overflow: auto;
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
    resize: none;
}
</style>