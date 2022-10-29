<template>
<b-container fluid>
    <b-row>
        <b-col class="mcol" cols="1"></b-col>
        <b-col class="mcol" cols="1">{{record.store}}</b-col>
        <b-col class="mcol" cols="1">{{record.count_all}} ({{record.sales_all}})</b-col>
        <b-col class="mcol" cols="1">
            <b-link @click="isShowProducts = !isShowProducts">
                <b-badge size="sm">Products Details</b-badge>
            </b-link>
        </b-col>
    </b-row>
    <b-row class="justify-content-md-center mrow-product" :style="index%2>0?'background:rgb(239 239 239);':''" v-if="isShowProducts" v-for="(item, index) in items" :key="item.mockup">
        <b-col class="mcol" cols="1" style="min-width:80px;"><b-img height="75" :src="item.mockup"></b-img></b-col>
        <b-col class="mcol" cols="5">{{item.name}}</b-col>
        <b-col class="mcol" cols="1">{{item.qty}}</b-col>
    </b-row>
</b-container>
</template>

<script>
export default {
    props: ["record", "index", "fromdate", "todate"],
    data() {
        return {
            items: [],
            isShowProducts: false,
        }
    },
    mounted() {
        this.getProducts();
    },
    methods: {
        async getProducts() {
            await this.$axios.get("/reports/generalorders/products?store=" + this.record.store + "&fromdate=" + this.fromdate + "&todate=" + this.todate, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                    }
                })
                .then((response) => {
                    this.items = response.data;
                })
                .catch((error) => {});
        }
    },
}
</script>

<style>
.mrow-header {
    border-bottom: 1px solid #2d2d2d36;
    padding: 10px;
    font-weight: 500;
    text-align: center;
}
.mrow-product{
    margin: 5px;
    width: 100%;
    font-weight: 500;
}
.mrow {
    border-bottom: 1px solid #2d2d2d36;
    padding: 10px;
    text-align: center;
}

.mcol {
    text-align: center;
}
</style>
