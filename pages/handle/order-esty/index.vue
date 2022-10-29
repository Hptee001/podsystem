<template>
<div style="padding: 10px; ">

    <b-alert variant="danger" dismissible fade :show="isError" @dismissed="isError = false">
        Error: {{ messageError }}
    </b-alert>
    <b-container style="background:white; padding-top:10px; margin-bottom:2px;">
        <b-row class="justify-content-md-center" style="width:100%">
           
            <b-col class="text-right" cols="auto">
                <b-input-group>
                    <b-form-select style="width:150px;" v-model="searchSeller" @input="inputSelectSeller">
                        <b-form-select-option value="ALL">ALL Sellers</b-form-select-option>
                        <b-form-select-option v-for="seller in options_seller" :key="seller.id" :value="seller.username">{{seller.fullname}}</b-form-select-option>
                    </b-form-select>
                    <b-form-select style="width:150px;" @input="searchFrom" v-model="searchStore">
                        <b-form-select-option value="ALL">ALL Stores</b-form-select-option>
                        <b-form-select-option v-for="store in options_stores" :key="store.store" :value="store.store">{{store.store}}</b-form-select-option>
                    </b-form-select>
                </b-input-group>
            </b-col>
            <b-col class="text-right" cols="auto">
                <b-form-radio-group id="radio-filter" v-model="filterBy" style="padding:5px;" name="radio-filter">
                    <b-form-radio value="item_name" checked="item_name">Item/Customer Name</b-form-radio>
                    <b-form-radio value="order_id">Order ID</b-form-radio>
                </b-form-radio-group>
            </b-col>

            <b-col cols="2">
                <b-form-input @keydown.native="enterSearchFrom" v-model="searchValue"></b-form-input>
            </b-col>
            <b-col cols="auto" style="padding-left:0px; ">
                <b-button-group>
                    <b-button style="width:150px" @click="searchFrom" block variant="primary">Search</b-button>
                    <b-button v-if="!isbulkUpload" @click="reloadData()" variant="success">
                        <b-icon icon="arrow-clockwise"></b-icon>
                    </b-button>
                </b-button-group>
            </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
            <b-col cols="8" style="margin-top:10px;">
                <b-input-group>
                    <b-button variant="outline-dark" @click="getOrderByDate(0)">Today</b-button>
                    <b-button variant="outline-dark" @click="getOrderByDate(-1)">Yesterday</b-button>
                    <b-button variant="outline-dark" @click="getOrderByDate(-7)">7 Days</b-button>
                    <b-button variant="outline-dark" @click="getOrderByDate(-30)">30 Days</b-button>
                    <b-form-datepicker v-model="fromdate" @input="getOrders()" placeholder="From Date" locale="en-US" :date-format-options="{ weekday: 'short', month: 'short' }"></b-form-datepicker>
                    <b-form-datepicker v-model="todate" @input="getOrders()" placeholder="To Date" locale="en-US" :date-format-options="{ weekday: 'short', month: 'short' }"></b-form-datepicker>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
            <b-col cols="auto" style="margin:5px;">
                <b-link @click="onClickBadgeStatus(status)" v-for="status in options_status" :key="status.name">
                    <b-badge pill :class="(status.active?'badge-status-active':'badge-status') +' ' +status.color">{{status.label}} {{status.count_orders}}</b-badge>
                </b-link>
            </b-col>
        </b-row>
    </b-container>
    <b-row v-show="isSearchLoading" class="justify-content-md-center">
        <b-col cols="auto">
            <b-spinner variant="warning">

            </b-spinner>
        </b-col>
    </b-row>
    <b-row class="justify-content-md-center">
        <b-col cols="auto">
            <b-input-group prepend="Show" class="b-show-perpage" style=" margin-top:10px;">

                <b-form-select style="width:70px" v-model="perPage" @input="getOrders">
                    <b-form-select-option value="5">5</b-form-select-option>
                    <b-form-select-option value="20">20</b-form-select-option>
                    <b-form-select-option value="50">50</b-form-select-option>
                </b-form-select>
            </b-input-group>

        </b-col>
        <b-col cols="auto">
            <b-pagination style="margin-top:10px;" v-show="totalCards > perPage" v-model="currentPage" @input="onClickPagPage" :total-rows="totalCards" :per-page="perPage" last-number align="center"></b-pagination>
        </b-col>
    </b-row>

    <the-order v-if="!isLoading" v-for="(order, index) in items" :key="order.id" :id="order.id" :order="order" :printify="printify" :printifylength="printifylength">

    </the-order>
    <b-pagination v-model="currentPage" @input="onClickPagPage" :total-rows="totalCards" :per-page="perPage" last-number align="center"></b-pagination>

    <b-link @click="scrollToTop">
        <vue-fab style="right: 3%" :idx="fabItem.idx" :title="fabItem.title" :icon="fabItem.icon" :color="fabItem.color" :titleColor="fabItem.titleColor" :titleBgColor="fabItem.titleBgColor">
        </vue-fab>
    </b-link>
    <!-- <b-overlay :show="isLoading" no-wrap></b-overlay> -->
</div>
</template>

<script>
import moment from 'moment';
import Treeselect from "@riophae/vue-treeselect";
import VueFab from "vue-float-action-button";
// import the styles
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import TheOrder from '../../../components/TheOrder.vue';
const defaultSortCompare = (a, b, sortBy) => {
    return toString(a[sortBy]).localeCompare(toString(b[sortBy]), undefined, {
        numeric: true,
    });
};
export default {
    components: {
        TheOrder
    },
    data() {
        return {
            searchStore: 'ALL',
            searchSeller: 'ALL',
            filterBy: 'item_name',
            searchValue: '',
            order_status: 'ALL',
            fromdate: '',
            todate: '',
            icon: "login",
            activeIcon: "login",
            size: "normal",
            mainBtnColor: "#E64C3B",
            zIndex: 5,
            fabItem: {
                idx: 1,
                title: "Go Top",
                icon: "expand_less",
                color: "#C7D23B",
                titleColor: "#666",
                titleBgColor: "#FFF",
            },
            totalCards: 0,
            perPage: 20,
            currentPage: 1,
            isSearchLoading: false,
            isEditLoading: false,
            isShowSeachSeller: false,
            isShowNextPage: false,
            files: [],
            file: null,
            isbulkUpload: false,
            isUploadingAttachment: false,
            tags: null,
            isShowTable: false,
            isLoading: false,
            isLoadingPrintify: false,
            isError: false,
            messageError: "",
            dialog: false,
            members: [],
            option_members: [],
            stores: [],
            options_stores: [],
            options_seller: [],
            options_designer: [],
            options_tags: [],
            items: [],
            orders: [],
            editedIndex: -1,
            printifylength: 0,
            edititem: {
                id: -1,
            },
            printify: {
                const_blueprints: [6, 12, 706, 1015, 77, 49, 80, 48, 41, 39, 880, 988, 420, 157, 32, 580, 34, 31, 561, 586, 599, 617, 33,964,610,1039,600,146,1141],
                options_blueprints: [],
                options_providers: [],
                options_variants: [],
                country: [],
                state: []
            },
            options_status: [{
                    label: "ALL",
                    name: "ALL",
                    color: "status-all",
                    active: true,
                    count_orders: 0
                }, {
                    label: "NEW",
                    name: "NEW",
                    color: "status-new",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "CREATED",
                    name: "CREATED",
                    color: "status-created",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "IN_PRODUCTION",
                    name: "IN_PRODUCTION",
                    color: "status-inproduction",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "SHIPPED",
                    name: "SHIPPED",
                    color: "status-shipped",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "COMPLETED",
                    name: "COMPLETED",
                    color: "status-completed",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "CANCEL",
                    name: "CANCEL",
                    color: "status-cancel",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "HAS_ISSUES",
                    name: "HAS_ISSUES",
                    color: "status-issues",
                    active: false,
                    count_orders: 0
                },
                {
                    label: "OUT_OF_STOCK",
                    name: "OUT_OF_STOCK",
                    color: "status-outstock",
                    active: false,
                    count_orders: 0
                }
            ],
        };
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? "New Card" : "Edit Card";
        },
    },
    watch: {
        dialog(val) {
            val || this.close();
        },
        dialogDelete(val) {
            val || this.closeDelete();
        },
    },
    mounted() {
        this.initialize();
    },
    methods: {
        getOrderByDate(nbrday) {
            this.fromdate = moment().add(nbrday, 'days').format('YYYY-MM-DD');
            this.todate = moment().add(nbrday, 'days').format('YYYY-MM-DD');
            if (nbrday == -1)
                this.todate = moment().add(nbrday, 'days').format('YYYY-MM-DD');
            if(nbrday < -1){
                this.todate = moment().format('YYYY-MM-DD');
            }
            this.getOrders();
        },
        enterSearchFrom(event) {
            if (event.which === 13) {
                this.searchFrom();
            }
        },
        onClickBadgeStatus(status) {
            this.options_status.map(function (x) {
                x.active = false;
                return x
            });
            status.active = true;
            this.order_status = status.name
            this.getOrders();
        },
        async searchFrom() {
            this.getOrders();
        },
        async onClickPagPage() {
            await this.getOrders();
        },
        showDate(date) {
            return date.split("T")[0];
        },
        scrollToTop() {
            window.scrollTo(0, 0);
        },
        async reloadData() {
            // this.searchStore = 'ALL';
            // this.searchSeller = 'ALL';
            // this.filterBy = 'item_name';
            // this.searchValue = '';
            // this.order_status = 'ALL';
            // this.fromdate = ''
            // this.todate = ''
            await this.getOrders();

        },
        async initialize() {
            this.isLoading = true;
            this.isShowSeachSeller = this.$auth.user.role == "seller" ? false : true;
            await this.getCountryState();
            this.getBlueprints();
            await this.getOrders();
            this.getSellers();
            this.getStores();
            this.getDesigners();

        },
        inputSelectSeller() {
            this.options_stores = this.stores.filter(x => (x.username == this.searchSeller || this.searchSeller == 'ALL'));
            this.searchFrom();
        },
        async getCountryState() {
            await this.$axios.get('printify/country-states', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.printify.country = response.data
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        async getBlueprints() {
            await this.$axios.get('printify/blueprints', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.printify.options_blueprints = response.data;
                    this.printify.options_blueprints = this.printify.options_blueprints.filter(x => this.printify.const_blueprints.includes(x.id));
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            //this.getProviders(1);
        },
        async getProviders() {
            this.printify.options_providers = [];
            for (let i = 0; i < this.printify.const_blueprints.length; i++) {
                let data = null;
                let blueprint = this.printify.const_blueprints[i];
                this.$axios.get('printify/print_providers?blueprint=' + blueprint, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        for (let j = 0; j < response.data.printProviders.length; j++) {
                            let obj = {
                                blueprintId: blueprint,
                                providerId: response.data.printProviders[j].id,
                                minPrice: response.data.printProviders[j].minPrice,
                                name: response.data.printProviders[j].name,
                                location: response.data.printProviders[j].location.country,
                            }
                            this.printify.options_providers.push(obj);
                        }
                        this.printifylength = this.printify.options_providers.length;
                    })
                    .catch((error) => {
                        this.makeToast('danger', error.message)
                    });
            }
        },
        async getOrders() {
            this.isSearchLoading = true;
            this.items = []
            console.log(this.searchValue)
            let query1 = '&filterby=' + this.filterBy + '&searchvalue=' + this.searchValue
            let query2 = '&searchstore=' + this.searchStore + '&searchseller=' + this.searchSeller;
            let query3 = '&fromdate=' + this.fromdate + '&todate=' + this.todate;
            await this.$axios
                .get("/ordersesty?page=" + this.currentPage +
                    '&limit=' + this.perPage + query1 + query2 + query3 + '&status=' + this.order_status, {
                        headers: {
                            Authorization: this.$auth.getToken("local"),
                            "Content-Type": "application/json",
                        },
                    })
                .then((response) => {
                    this.items = response.data.data;
                    this.totalCards = response.data.total_count;
                    if (this.items.length >= this.perPage) {
                        this.isShowNextPage = true;
                    } else {
                        this.isShowNextPage = false;
                    }
                    for (let i = 0; i < this.options_status.length; i++) {
                        if (this.options_status[i].name == 'ALL')
                            this.options_status[i].count_orders = response.data.count_new + response.data.count_created + response.data.count_in_production +
                            response.data.count_shipped + response.data.count_cancel + response.data.count_has_issues + response.data.count_out_of_stock
                        if (this.options_status[i].name == 'NEW')
                            this.options_status[i].count_orders = response.data.count_new
                        if (this.options_status[i].name == 'CREATED')
                            this.options_status[i].count_orders = response.data.count_created
                        if (this.options_status[i].name == 'IN_PRODUCTION')
                            this.options_status[i].count_orders = response.data.count_in_production
                        if (this.options_status[i].name == 'SHIPPED')
                            this.options_status[i].count_orders = response.data.count_shipped
                        if (this.options_status[i].name == 'CANCEL')
                            this.options_status[i].count_orders = response.data.count_cancel
                        if (this.options_status[i].name == 'HAS_ISSUES')
                            this.options_status[i].count_orders = response.data.count_has_issues
                        if (this.options_status[i].name == 'OUT_OF_STOCK')
                            this.options_status[i].count_orders = response.data.count_out_of_stock
                        if (this.options_status[i].name == 'COMPLETED')
                            this.options_status[i].count_orders = response.data.count_completed
                    }

                    this.isLoading = false;
                    this.isSearchLoading = false;
                })
                .catch((error) => {
                    this.makeToast("danger", error.message);
                    this.isLoading = false;
                    this.isSearchLoading = false;
                    console.log(error);
                });
            window.scrollTo(0, 0);
        },
        async getStores() {
            this.isLoading = true;
            await this.$axios.get('/accounts/stores', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.stores = response.data;
                    this.options_stores = this.stores;
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log(error)
                    this.isLoading = false;
                });
        },
        getSellers() {
            this.isLoading = true;
            this.$axios
                .get("/accounts/sellers", {
                    headers: {
                        Authorization: this.$auth.getToken("local"),
                        "Content-Type": "application/json",
                    },
                })
                .then((response) => {
                    this.options_seller = response.data;
                    // for (let i = 0; i < response.data.length; i++) {
                    //     let obj = {
                    //         value: response.data[i].username,
                    //         text: response.data[i].fullname,
                    //     };
                    //     this.options_seller.push(obj);
                    // }
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log(error);
                    this.isLoading = false;
                });
        },
        getDesigners() {
            this.isLoading = true;
            this.$axios
                .get("/accounts/designers", {
                    headers: {
                        Authorization: this.$auth.getToken("local"),
                        "Content-Type": "application/json",
                    },
                })
                .then((response) => {
                    this.options_designer = [];
                    for (let i = 0; i < response.data.length; i++) {
                        let obj = {
                            value: response.data[i].username,
                            text: response.data[i].fullname,
                        };
                        this.options_designer.push(obj);
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.isLoading = false;
                });
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        async editItem(item) {
            this.$router.push("/handle/order-esty/" + item.id);
        },
    },
};
</script>

<style>
.b-show-perpage .input-group-prepend .input-group-text {
    background: white;
}

.row-item-upload {
    padding: 2px;
}

.file-name {
    padding-top: 12px;
}

.p-3 {
    padding: 0rem !important;
}

.tdactions {
    min-width: 180px;
}

.fab-main-container {
    right: 3%;
}

.custom-select {
    color: black;
}

.badge-status {
    width: 120px;
    padding: 5px;
    margin-right: 10px;

}

.badge-status-active {
    width: 120px;
    padding: 10px;
    margin-right: 10px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 50%);
}

.status-all {
    color: rgb(255, 255, 255);
    background-color: #2d2d2d;
}

.status-new {
    color: #fff;
    background-color: #0096FF;
}

.status-created {
    color: #fff;
    background-color: #EF5B0C;
}

.status-inproduction {
    color: #fff;
    background-color: #377D71;
}

.status-shipped {
    color: #fff;
    background-color: #5BB318;
}

.status-cancel {
    color: #fff;
    background-color: #7A4495;
}

.status-issues {
    color: #fff;
    background-color: #A10035;
}

.status-outstock {
    color: #fff;
    background-color: #B9005B;
}

.status-completed {
    color: #fff;
    background-color: #003a9d;
}
</style>
