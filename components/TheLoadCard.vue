<template>
<the-card v-if="item" :item.sync="item" :name="item.name" :thumbnail="item.thumbnail" :tags="item.tags" :created_user="item.created_user" :created_at="item.created_at"></the-card>
</template>

<script>
import TheCard from './TheCard.vue';
var FileSaver = require('file-saver');
export default {
    components: {
        TheCard
    },
    props: ['id'],
    data() {
        return {
            isLoading: false,
            item: null
        }
    },
    mounted() {
        // console.log('init')
        this.loadCard();
    },
    methods: {
        async loadCard() {
            this.isLoading = true;
            await this.$axios.get('/cards/' + this.id, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoading = true;
                    this.item = response.data;
                })
                .catch((error) => {
                    this.isLoading = true;
                    this.makeToast('danger', error.message)
                });
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || 'default'}`,
                variant: variant,
                solid: true
            })
        },
    },
}
</script>

