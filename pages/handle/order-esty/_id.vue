<template>
<div>
    <b-alert :show="isShowError" dismissible variant="danger" @dismissed="isShowError=true">
        {{ messageError }}
    </b-alert>
    <b-row>
        <div style="width:100%; display:inline-flex; margin-bottom:5px;">
            <div style="width:50%">
                <b-button variant="dark" @click="backMain">BACK</b-button>
            </div>
            <div style="width:90%; text-align:end;">
            </div>
        </div>
        <b-col v-if="dforder !== null" style="background:white; padding-top:15px;">
            <b-row>
                <b-col>
                    <p class="h5 mb-2">
                        <b-icon icon="shop"></b-icon> Store: {{dforder.store}} - Order: {{dforder.order_nbr}}
                    </p>
                    <div>Date: {{dforder.date}}</div>
                    <div>Payment Status: {{dforder.status}}</div>
                    <div>Fulfill Status: {{dforder.fulfill_status}}</div>
                </b-col>

            </b-row>

            <b-row>
                <b-col cols="8">
                    <b-row>
                        <b-col cols="12">
                            <p class="h4 mt-3">
                                <b-icon icon="truck"></b-icon> Tracking
                            </p>
                            <div>
                                <b-input-group prepend="" class="mt-3">
                                    <b-form-input v-model="dforder.tracking_carrier" placeholder="Carrier"></b-form-input>
                                    <b-form-input v-model="dforder.tracking_number" placeholder="Tracking Number"></b-form-input>
                                </b-input-group>
                                <b-input-group prepend="">
                                    <b-form-input v-model="dforder.tracking_url" placeholder="Tracking Url"></b-form-input>
                                    <b-input-group-append>
                                        <b-button variant="outline-success" @click="syncTracking(dforder)">
                                            <b-spinner v-show="isLoadingSave" variant="success" label="Spinning"></b-spinner>Sync
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </div>
                        </b-col>
                    </b-row>
                    <p class="h4 mt-3">
                        <b-icon icon="box-seam"></b-icon> Line Items
                    </p>
                    <b-list-group>
                        <b-list-group-item v-for="item in dforder.line_items" :key="item.id">
                            <b-row>
                                <b-col cols="4" style="min-width:60%;">
                                    <div>
                                        <b-icon icon="gear-wide"></b-icon>
                                        <b style="text-transform: uppercase;">{{item.status}}</b>
                                    </div>
                                    <div style="display: inline-flex; margin-top:10px;">
                                        <div style="padding-right:10px;">
                                            <img :src="item.image_src" width="50px" height="50px">
                                        </div>
                                        <div>
                                            <label>{{item.product_name}}</label>
                                            <label style="display:block"> SKU: {{item.product_sku}}</label>
                                            <label v-for="pa in item.properties" :key="pa.name" style="display:block">
                                                <div>{{pa.name}}:{{pa.value.toUpperCase()}}</div>
                                            </label>
                                        </div>

                                    </div>
                                </b-col>
                                <b-col cols="2" style="text-align-last:end;min-width:20%">
                                    <label>{{item.price}} x {{item.qty}}</label>
                                </b-col>
                                <b-col cols="2" style="text-align-last:end;min-width:20%">
                                    <label>{{item.price*item.qty - item.discount}}</label>
                                </b-col>
                            </b-row>
                            <b-row>
                                <b-col cols="12">

                                </b-col>
                            </b-row>
                        </b-list-group-item>
                    </b-list-group>

                    <b-row>
                        <b-col>
                            <b-card>
                                <b-card-header>
                                    <b-icon icon="credit-card-2-back"></b-icon> <b>Paid</b>
                                </b-card-header>
                                <b-card-body>
                                    <b-row>
                                        <b-col cols="3">
                                            Subtotal
                                        </b-col>
                                        <b-col cols="6">
                                            {{dforder.qty_items}} items
                                        </b-col>
                                        <b-col cols="3" style="text-align-last:end;">
                                            {{dforder.value - dforder.total_discounts - dforder.shipping_value}}
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col cols="3">
                                            Discount
                                        </b-col>
                                        <b-col cols="6">

                                        </b-col>
                                        <b-col cols="3" style="text-align-last:end;">
                                            {{dforder.total_discounts}}
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col cols="3">
                                            Shipping
                                        </b-col>
                                        <b-col cols="6">

                                        </b-col>
                                        <b-col cols="3" style="text-align-last:end;">
                                            {{dforder.shipping_value}}
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col cols="3">
                                            <b>Total</b>
                                        </b-col>
                                        <b-col cols="6">

                                        </b-col>
                                        <b-col cols="3" style="text-align-last:end;">
                                            <b>{{dforder.value}}</b>
                                        </b-col>
                                    </b-row>

                                </b-card-body>
                            </b-card>
                        </b-col>
                    </b-row>

                </b-col>
                <b-col cols="4">
                    <div style="display:block">
                        <p class="h4 mb-2">
                            <b-icon icon="person"></b-icon> Customer
                        </p>
                        <div>Email: {{dforder.billing.email}} </div>
                        <div>Phone: {{dforder.billing.phone}}</div>
                        <p class="h6 mb-2" style="padding-top:10px;">
                            <b-icon icon="truck"></b-icon> Shipping Address:
                        </p>
                        <div>{{dforder.shipping.first_name}} {{dforder.shipping.last_name}}</div>
                        <div>{{dforder.shipping.address_1}} {{dforder.shipping.address_2}}</div>
                        <div>{{dforder.shipping.city}}</div>
                        <div>{{dforder.shipping.state}}</div>
                        <div>{{dforder.shipping.postcode}}</div>
                        <div>{{dforder.shipping.country}}</div>
                        <label></label>
                    </div>

                </b-col>
            </b-row>

        </b-col>
    </b-row>
    <b-modal v-model="modalShowImage" title="View SVG">
        <object :data="df_url_svg"></object>
    </b-modal>
</div>
</template>

<script>
export default {
    data() {
        return {
            modalShowImage: false,
            df_url_svg: '',
            dforder: null,
            isLoadingSave: false,
            isShowError: false,
            messageError: '',
            order_status_options: [{
                    value: "pending",
                    text: 'Pending'
                },
                {
                    value: "paid",
                    text: 'Paid'
                },
                {
                    value: "processing",
                    text: 'Processing'
                },
                {
                    value: "on-hold",
                    text: 'On-hold'
                },
                {
                    value: "completed",
                    text: 'Completed'
                },
                {
                    value: "cancelled",
                    text: 'Cancelled'
                },
                {
                    value: "refunded",
                    text: 'Refunded'
                },
                {
                    value: "failed",
                    text: 'Failed'
                },
                {
                    value: "trash",
                    text: 'Trash'
                },
            ],
            fields_items: [{
                    key: 'position',
                    sortable: true
                },
                {
                    label: 'product_id',
                    key: 'product_id',
                    sortable: true
                },
                {
                    key: 'product_name',
                    sortable: true
                },
                {
                    key: 'product_variant_sku',
                    sortable: true
                },
                {
                    key: 'qty',
                    sortable: true
                },
                {
                    key: 'price',
                    sortable: true
                },
                {
                    key: 'value',
                    sortable: true
                },
                {
                    key: 'actions',
                    sortable: true,
                    tdClass: 'td-actions',
                    thClass: 'th-actions'
                },
            ],
        }

    },
    mounted() {
        console.log(this.$route.params)
        this.initialize();
    },
    methods: {
        downloadSvg() {

        },
        viewSvg(url_svg) {
            this.modalShowImage = true;
            this.df_url_svg = url_svg;
        },
        initialize() {
            this.$axios.get('/ordersesty/' + this.$route.params.id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.dforder = response.data
                    console.log(this.dforder)
                })
                .catch((error) => {});
        },
        saveItem(item) {
            this.isLoadingSave = true;
            const json = JSON.stringify(item);
            this.$axios.post('/orders/' + this.dforder.id + "/items/" + item.id, json, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoadingSave = false;
                })
                .catch((error) => {
                    this.isLoadingSave = false;
                    this.messageError = 'Failed!'
                    this.isShowError = true
                });
        },
        saveOrder(order) {
            if (order.id < 1) {
                order.id = 0;
                const json = JSON.stringify(order);
                this.$axios.post('/orders', json, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.dforder = response.data;
                        var i, j;
                        for (i = 0; i < this.dforder.line_items.length; i++) {
                            for (j = 0; j < this.dforder.line_items[i].meta_data.length; j++) {
                                if (this.dforder.line_items[i].meta_data[j].key === "personalize") {
                                    this.dforder.line_items[i].meta_data[j]["personalize"] = JSON.parse(this.dforder.line_items[i].meta_data[j].value);
                                }
                            }
                        }
                        console.log(this.dforder)
                    })
                    .catch((error) => {});
            } else {
                this.isLoadingSave = true;
                const json = JSON.stringify(this.dforder);
                this.$axios.post('/orders/' + this.dforder.id, json, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.isLoadingSave = false;
                    })
                    .catch((error) => {
                        this.isLoadingSave = false;
                        this.messageError = 'Failed!'
                        this.isShowError = true
                    });
            }
        },
        syncTracking(item) {
            const json = JSON.stringify(this.dforder);
            this.$axios.post('/orders/' + this.dforder.id + "/tracking", json, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoadingSave = false;
                })
                .catch((error) => {
                    this.isLoadingSave = false;
                    this.messageError = 'Failed!'
                    this.isShowError = true
                });
        },
        backMain() {
            this.$router.push("/handle/order-esty")
        }
    },
}
</script>

<style>

</style>
