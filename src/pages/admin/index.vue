<template>
    <div>
        <tree-table :treeData="treeData" :default-expanded-keys="defaultExpandedKeys"></tree-table>
    </div>
</template>

<script>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import API from '@/api/api'
import randomstring from 'randomstring'
import TreeTable from '@/components/tree-table.vue'
import { HttpResponseCode } from '@/constants/constants';
const ADD_ID_LENGTH = 8; // 添加的节点 _id 的长度
export default {
    name: "admin",
    components: { TreeTable },
    setup() {
        let treeData = ref([])
        let defaultExpandedKeys = ref([])
        const getCodeCategories = async () => {
            try {
                const { code, message, data } = await API.getCodeCategories();
                if (code === HttpResponseCode.OK) {
                    const { rows } = data;

                    const _id = randomstring.generate({
                        capitalization: 'lowercase',
                        length: ADD_ID_LENGTH
                    })

                    defaultExpandedKeys.value.push(_id)

                    treeData.value = [{
                        _id,
                        title: '全部',
                        avatar: 'https://cdn.xiongyechang.com/01y2y1pi-all.png',
                        editable: false,
                        children: rows.map(item => ({
                            ...item,
                            editable: false
                        }))
                    }]

                } else {
                    ElMessage.error(message);                    
                }
            } catch (error) {
                console.error(error);
            }
        }

        getCodeCategories()

        return {
            treeData,
            defaultExpandedKeys,
            getCodeCategories
        }
    }
}
</script>