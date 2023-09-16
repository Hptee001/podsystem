<template>
<b-container fluid>
    <b-row>
        <b-col cols="3" style="min-width:300px; " v-for="fulfillment in options_fulfillment" :key="fulfillment.id">
            <the-fulfillment-seller v-bind:fulfillment="fulfillment">

            </the-fulfillment-seller>
        </b-col>
    </b-row>
</b-container>
</template>

<script>
import TheFulfillmentSeller from '../../components/TheFulfillmentSeller.vue';
export default {
    components: {
        TheFulfillmentSeller
    },
    data() {
        return {
            options_fulfillment: [],
            isLoading: false,
            platform: 'etsy'
        }
    },
    mounted() {
        this.getSellers();
    },
    methods: {
        async getSellers() {
            this.isLoading = true
            await this.$axios.get('/accounts/fulfillments', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.options_fulfillment = response.data
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
