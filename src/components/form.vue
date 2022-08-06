<template>
    <HtmlMarkdown :value="form.content" @save="onSave"></HtmlMarkdown>
</template>

<script>
import { 
    reactive,
    toRefs,
    getCurrentInstance,
    defineAsyncComponent,
} from 'vue'
import API from '@/api/api'
import CodeCategory from '@/components/code-category.vue'
import ToolBar from '@/components/toolbar.vue'
import { HttpResponseCode } from '@/constants/constants'
import { ElMessage, ElNotification } from 'element-plus'
import Empty from './empty.vue'

export default {
    name: "form",
    components : { 
        CodeCategory,
        ToolBar,
        HtmlMarkdown: defineAsyncComponent({
             // 工厂函数
            loader: () => import('@/components/html-markdown'),
            errorComponent: Empty,
            loadingComponent: Empty,
            delay: 0,
            timeout: 3000,
            // 定义组件是否可挂起 | 默认值：true
            suspensible: false,
            onError(error, retry, fail, attempts) {
                if (error.message.match(/fetch/) && attempts <= 3) {
                    // 请求发生错误时重试，最多可尝试 3 次
                    retry()
                } else {
                    // 注意，retry/fail 就像 promise 的 resolve/reject 一样：
                    // 必须调用其中一个才能继续错误处理。
                    fail()
                }
            }
        })
    },
    props: {
        _id: String,
        category: String,
    },
    setup(props) {

        const instance = getCurrentInstance();

        console.log(instance);

        const store = reactive({
            dialogVisible: false,
            list:[],
            form: {
                _id: '',
                title: '',
                disabled: false,
                category: props.category,
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

        store.form._id = props._id;

        const getCodeSnippet = async _id => {
            try {
                const { code, message, data } = await API.getCodeSnippet(_id);
                if (code === HttpResponseCode.OK) {
                    store.form = data;
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
                    store.list = formatData(rows)
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
                    store.categories = rows
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

        const onSave = async (value) => {
            store.form.content = value;
            const request = store.form._id ? API.updateCodeSnippet : API.addCodeSnippet
            try {
                const reg = /^# (.*)\n?/
                if(reg.test(store.form.content)){
                    store.form.title = RegExp.$1
                }
                const { code, message, data} = await request(store.form)
                if (code === HttpResponseCode.OK) {
                    Object.assign(store.form, {
                        _id: data._id,
                    });
                    ElNotification({
                        message,
                        duration: 3000,
                        type: 'success',
                        offset: 100
                    });
                } else {
                    ElMessage.error(message)
                }
            } catch (error) {
                console.error(error)
            }
        }

        if(props._id){
            getCodeSnippet(props._id)
        }

        getCodeSnippets()

        getCodeCategories()

        return {
            ...toRefs(store),
            getCodeSnippet,
            getCodeSnippets,
            getCodeCategories,
            onSave,
        }

    }
}
</script>

<style lang="css" scoped>
</style>