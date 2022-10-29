<template>
<b-container fluid class="record-container">
    <b-row v-if="index==0" class="mrow-header">
        <b-col cols="1">SELLER</b-col>
        <b-col cols="1"></b-col>
        <b-col cols="1">ALL ORDERS</b-col>
        <b-col cols="1">NEW</b-col>
        <b-col cols="1">CREATED</b-col>
        <b-col cols="1" style="min-width:150px">IN PRODUCTION</b-col>
        <b-col cols="1">SHIPPED</b-col>
        <b-col cols="1">COMPLETED</b-col>
        <b-col cols="1">CANCEL</b-col>
        <b-col cols="1">HAS ISSUES</b-col>
        <b-col cols="1" style="min-width:150px">OUT OF STOCK</b-col>

    </b-row>
    <b-row class="mrow-seller">
        <b-col class="mcol-seller" cols="1">{{record.seller}}</b-col>
        <b-col cols="1">STORE</b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_all}}<span v-show="record.count_all>0"> ({{total.all}})</span> </b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_new}}<span v-show="record.count_new>0"> ({{total.new}})</span> </b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_created}}<span v-show="record.count_created>0"> ({{total.created}})</span></b-col>
        <b-col class="mcol-seller" style="min-width:150px" cols="1">{{record.count_in_production}} <span v-show="record.count_in_production>0"> ({{total.in_production}})</span></b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_shipped}}<span v-show="record.count_shipped>0"> ({{total.shipped}})</span></b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_completed}} <span v-show="record.count_completed>0">({{total.completed}})</span> </b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_cancel}}<span v-show="record.count_cancel>0"> ({{total.cancel}})</span> </b-col>
        <b-col class="mcol-seller" cols="1">{{record.count_has_issues}}<span v-show="record.count_has_issues>0"> ({{total.has_issues}})</span> </b-col>
        <b-col class="mcol-seller" style="min-width:150px" cols="1">{{record.count_out_of_stock}} <span v-show="record.count_out_of_stock>0">({{total.out_of_stock}})</span></b-col>

    </b-row>
    <b-row class="mrow" v-for="detail in record.details" :key="detail.store">
        <the-custom-report-store-products v-if="detail.sales_all>0" :record="detail" :fromdate="fromdate" :todate="todate"></the-custom-report-store-products>
    </b-row>
    <b-row class="mrow-extra">
        <b-col cols="auto">Revenue: <label>{{formatPrice(record.revenue)}}</label></b-col>
        <b-col cols="auto">Fee: <label>{{formatPrice(record.fee)}}</label></b-col>
        <b-col cols="auto">Base Cost: <label>{{formatPrice(record.base_cost)}}</label></b-col>
        <b-col cols="auto">Profit: <label>{{formatPrice(record.profit)}}</label></b-col>
    </b-row>
</b-container>
</template>

<script>
import TheCustomReportStoreProducts from './TheCustomReportStoreProducts.vue';
export default {
    components: {
        TheCustomReportStoreProducts
    },
    props: ["record", "index", "fromdate", "todate"],
    data() {
        return {
            items: [],
            itemsgroup: [],
            total: {
                new: 0,
                created: 0,
                in_production: 0,
                shipped: 0,
                completed: 0,
                cancel: 0,
                has_issues: 0,
                out_of_stock: 0,
                all: 0,
            }
        }
    },
    mounted() {
        this.getSales();
    },
    methods: {
        formatPrice(price) {
            return parseFloat(price).toFixed(2);
        },
        async getSales() {
            await this.$axios.get("/reports/generalorders/sales?seller=" + this.record.seller + "&fromdate=" + this.fromdate + "&todate=" + this.todate, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                    }
                })
                .then((response) => {
                    this.loading = false;
                    this.items = response.data;
                    for (let i = 0; i < this.items.length; i++) {
                        this.total.new += this.items[i].count_new;
                        this.total.created += this.items[i].count_created;
                        this.total.in_production += this.items[i].count_in_production;
                        this.total.shipped += this.items[i].count_shipped
                        this.total.completed += this.items[i].count_completed
                        this.total.cancel += this.items[i].count_cancel;
                        this.total.has_issues += this.items[i].count_has_issues;
                        this.total.out_of_stock += this.items[i].count_out_of_stock;
                        this.total.all += this.items[i].count_all;

                        for (let j = 0; j < this.record.details.length; j++) {
                            if (this.record.details[j].store == this.items[i].store) {
                                this.record.details[j].sales_all = this.items[i].count_all
                                console.log(this.record.details[j])
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.loading = false;
                });
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

.mrow {
    border-bottom: 1px solid #2d2d2d36;
    padding: 10px;
    text-align: center;
}

.mrow-extra{
    margin: 5px;
}
.mrow-extra label{
    font-weight: 500;
}
.mrow-header-store {
    border-bottom: 1px solid #2d2d2d36;
    padding: 10px;
    text-align: center;
}

.mrow-seller {
    border-bottom: 1px solid #2d2d2d36;
    padding: 10px;
    font-weight: 500;
    text-align: center;
    background: #e7e7e7;
}

.mcol {
    text-align: center;
}

.mcol-seller {
    text-align: center;
}

.record-container {
    margin-bottom: 5px;
}

.mcol {
    text-align: center;
}
</style>
