<template>
<div style="display:inline">
    <b-spinner v-if="isLoading"></b-spinner>
    <span v-else> - {{status}}</span>
</div>
</template>

<script>
export default {
    props: ['store'],
    data() {
        return {
            stores: [],
            isLoading: false,
            status:''
        }
    },
    mounted() {
        this.checkStore();
    },
    methods: {
        async checkStore() {
            this.isLoading = true;
            await this.$axios.get('/accounts/stores/'+this.store+'/check', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.status = response.data  
                })
                .catch((error) => {
                    console.log(error)
                    this.isLoading = false;
                });
                this.isLoading = false;
        },
    }
}
</script>

<style>

</style>
