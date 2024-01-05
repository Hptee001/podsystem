<template lang="">
<div class="col-sm-12 mytable" style="margin-bottom:10px;">
    <div class=''>
        <div>
            <b-row style="padding-top:10px">
                <b-col align-v="center">
                    <b-button variant="outline-secondary" @click="loadReportToday()">Today</b-button>
                    <b-button variant="outline-secondary" @click="loadReportYesterday()">Yesterday</b-button>
                    <b-button variant="outline-secondary" @click="loadReportThisMonth()">This Month</b-button>
                    <b-button variant="outline-secondary" @click="loadReportLastMonth()">Last Month</b-button>
                </b-col>
            </b-row>
            <b-row>
                <b-col><label for="example-datepicker">From Date</label>
                    <b-form-datepicker id="fromdate-datepicker" v-model="input.fromdate" class="mb-2"></b-form-datepicker>
                </b-col>
                <b-col><label for="example-datepicker">To Date</label>
                    <b-form-datepicker id="todate-datepicker" v-model="input.todate" class="mb-2"></b-form-datepicker>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-form-select v-model="platform" label="Platform" @change="loadReport()">
                        <b-form-select-option value="%">All</b-form-select-option>
                        <b-form-select-option value="etsy">Etsy</b-form-select-option>
                        <b-form-select-option value="tiktok">Tiktok</b-form-select-option>
                        <b-form-select-option value="burgerprints">Burgerprints</b-form-select-option>
                    </b-form-select>
                </b-col>
                <b-col align-self="end">
                    <b-button block variant="outline-secondary" @click="loadReport()">Load</b-button>
                </b-col>
            </b-row>
        </div>
    </div>
    <div style="display: flex; padding-top:10px;">
        <b-spinner v-show="loading" variant="primary"></b-spinner>
        <b-spinner v-show="loading" variant="secondary"></b-spinner>
        <b-spinner v-show="loading" variant="success"></b-spinner>
        <b-spinner v-show="loading" variant="danger"></b-spinner>
        <b-spinner v-show="loading" variant="warning"></b-spinner>
        <b-spinner v-show="loading" variant="info"></b-spinner>
        <b-spinner v-show="loading" variant="light"></b-spinner>
        <b-spinner v-show="loading" variant="dark"></b-spinner>
    </div>

    <TheCustomTableReportOrder v-for="(item, index) in itemsgroup" :key="item.seller" :index="index" :record="item" :fromdate="input.fromdate" :todate="input.todate" :platform="platform"></TheCustomTableReportOrder>
</div>
</template>

<script>
import moment from 'moment';
// import the component
import TheCustomTableReportOrder from '~/components/TheCustomTableReportOrder.vue';
import Treeselect from '@riophae/vue-treeselect';
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
const defaultSortCompare = (a, b, sortBy) => {
    return toString(a[sortBy]).localeCompare(toString(b[sortBy]), undefined, {
        numeric: true
    });
};
export default {
    components: {
        Treeselect,
        TheCustomTableReportOrder,
    },
    data() {
        return {
            value: null,
            // define options
            options_tree: [{
                id: 'a',
                label: 'a',
                children: [{
                    id: 'aa',
                    label: 'aa',
                }, {
                    id: 'ab',
                    label: 'ab',
                }],
            }],
            platform: 'etsy',
            isadmin: false,
            loading: false,
            csv: null,
            fieldsgroups: [{
                    key: 'seller',
                    thClass: 'mytbheader',
                    class: 'mycodeproduct',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'revenue',
                    key: 'revenue',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'fee',
                    key: 'fee',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'base cost',
                    key: 'base_cost',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'profit',
                    key: 'profit',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    key: 'show_details',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                }
            ],
            fields: [{
                    label: 'Date',
                    key: 'date',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                }, {
                    label: 'Seller',
                    key: 'seller',
                    class: 'mytbthumbnail',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Clone',
                    key: 'count_clone',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Redesign',
                    key: 'count_redesign',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Total Design',
                    key: 'count_design',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },

            ],
            items: [],
            itemsgroup: [],
            input: {
                todate: '',
                fromdate: ''
            },
            total: {
                count_clone: 0,
                count_redesign: 0,
                count_design: 0
            },
            options_seller: [],
        }
    },
    watch: {
        input: {
            handler: function (val, oldVal) {

            },
            deep: true
        }
    },
    computed: {
        netprofitclass() {
            if (this.total.profit < 0) return 'itemvalue text-red'
            else return 'itemvalue text-green'
        },
    },
    layout: 'dashboard',
    async mounted() {

        this.loading = true;
        var today = new Date();
        Date.prototype.addDays = function (days) {
            this.setDate(this.getDate() + parseInt(days));
            return this;
        };
        today = today
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;
        this.input.todate = today;
        this.input.fromdate = today;
        await this.getSellers();
        this.loadReportThisMonth();
        //this.loadReport(this.input.fromdate, this.input.todate)
    },
    methods: {
        loadReportToday() {
            var today = new Date();
            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };
            today = today
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;
            this.input.todate = today;
            this.input.fromdate = today;
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        loadReportYesterday() {
            var today = new Date();
            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };
            today = today.addDays(-1)
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;
            this.input.todate = today;
            this.input.fromdate = today;
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        loadReportThisMonth() {
            var today = new Date();
            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };

            var fromdate = today
            var dd = String(fromdate.getDate()).padStart(2, '0');
            var mm = String(fromdate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = fromdate.getFullYear();
            fromdate = yyyy + '-' + mm + '-01';

            var todate = yyyy + '-' + mm + '-' + dd;

            this.input.todate = todate;
            this.input.fromdate = fromdate;
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        loadReportLastMonth() {
            this.input.fromdate = moment().add(-1, 'months').startOf('month').format('YYYY-MM-DD')
            this.input.todate = moment().add(-1, 'months').endOf('month').format('YYYY-MM-DD')
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        sortingChanged(a, b, key) {
            if (key == "estprofit") {
                return a["estprofit"] - b["estprofit"] // ? -1 : a["estprofit"] > b["estprofit"] ? 1 : 0

            }
        },
        rowClass(item, type) {
            if (!item || type !== 'row') return
            if (item.estprofit < 0) return 'text-red'
            if (item.estprofit > 0) return 'text-green'
        },
        async getSellers() {
            this.isLoading = true
            await this.$axios.get('/accounts/sellers', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.options_seller = []
                    for (let i = 0; i < response.data.length; i++) {
                        let obj = {
                            value: response.data[i].username,
                            text: response.data[i].fullname,
                        }
                        this.options_seller.push(obj);
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.isLoading = false;
                });
        },
        loadReport(fromdate, todate) {
            this.loading = true;
            this.items = []
            this.itemsgroup = []
            this.$axios.get("/reports/generalorders?fromdate=" + this.input.fromdate + "&todate=" + this.input.todate + "&platform=" + this.platform, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                    }
                })
                .then((response) => {
                    this.loading = false;
                    this.items = response.data;

                    for (let i = 0; i < this.options_seller.length; i++) {
                        var obj = {
                            seller: this.options_seller[i].value,
                            revenue: 0,
                            fee: 0,
                            profit: 0,
                            base_cost: 0,
                            count_new: 0,
                            count_created: 0,
                            count_in_production: 0,
                            count_shipped: 0,
                            count_completed: 0,
                            count_cancel: 0,
                            count_has_issues: 0,
                            count_out_of_stock: 0,
                            count_all: 0,

                            details: []
                        };
                        for (let j = 0; j < this.items.length; j++) {
                            if (this.items[j].seller == obj.seller) {
                                obj.revenue += this.items[j].revenue;
                                obj.fee += this.items[j].fee,
                                    obj.base_cost += this.items[j].base_cost;
                                obj.count_new += this.items[j].count_new;
                                obj.count_created += this.items[j].count_created;
                                obj.count_in_production += this.items[j].count_in_production;
                                obj.count_shipped += this.items[j].count_shipped;
                                obj.count_completed += this.items[j].count_completed;
                                obj.count_cancel += this.items[j].count_cancel;
                                obj.count_has_issues += this.items[j].count_has_issues;
                                obj.count_out_of_stock += this.items[j].count_out_of_stock;
                                obj.count_all += this.items[j].count_all;
                                this.items[j].sales_all = 0;
                                obj.details.push(this.items[j]);
                            }
                        }
                        obj.profit = obj.revenue - obj.base_cost - obj.fee;
                        this.itemsgroup.push(obj);
                    }
                    console.log(this.itemsgroup)
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
.itemvalue {
    width: 39%;
    display: inline-block;
    text-align-last: end;
    font-weight: 600;
    font-size: medium;
}

.itemlabel {
    width: 60%;
    display: inline-block;
    font-weight: 600;
    font-size: medium
}

.mytable {
    border-radius: 10px;
    margin-bottom: 10px;
    border: 1px solid gray;
    padding: 25px;
    background: white;
}

.mytbheader {
    text-transform: uppercase;
    color: #6e7a81;
    text-align: center;
}

.mytd {
    padding-right: 10px;
    text-align: center;
    text-transform: uppercase;
    padding-top: 25px;
}

.mytdnumber {
    text-align: center;
}

.mytdtext {
    text-align: center;
}

.mycodeproduct {
    padding-top: 25px;
    max-width: 100px;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
}

.mytbthumbnail {
    width: 60px;
}

.text-red {
    color: red;
}

.text-green {
    color: green;
}
</style>
