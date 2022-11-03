<template>
<b-container fluid>
    <b-row>
        <b-col cols="3" style="min-width:300px; "  v-for="seller in options_seller" :key="seller.id">
            <the-account-store :seller="seller">

            </the-account-store>
        </b-col>
    </b-row>
</b-container>
</template>

<script>
import TheAccountStore from '../../components/TheAccountStore.vue';
export default {
    components: {
        TheAccountStore
    },
    data() {
        return {
            options_seller: [],
            isLoading: false,
        }
    },
    mounted() {
        this.getSellers();
    },
    methods: {
        async getSellers() {
            this.isLoading = true
            await this.$axios.get('/accounts/sellers', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.options_seller = response.data
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log(error)
                    this.isLoading = false;
                });
        },
    },
}
</script>

<style>

</style>
