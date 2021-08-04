export default {
    methods: {
        getCategoryAvatar(category) {
            return category&&category.avatar||'';
        }
    }
}