<template>
<div>
    <b-container class="mb-container">
        <b-overlay :show="isEditLoading">
            <b-row>
                <b-col align-self="end" style="text-align:end;">
                    <b-button variant="dark" v-if="!isCompletedDialog" @click="isCompletedDialog=!isCompletedDialog" size="sm" style="border-radius:25px;">Complete Order</b-button>
                    <div v-else style="padding-top:10px;padding-bottom:5px;">
                        <label>Do you want complete order?</label>
                        <b-button-group>
                            <b-button variant="dark" @click="isCompletedDialog=!isCompletedDialog">
                                No
                            </b-button>
                            <b-spinner v-if="isCloneOrderLoading" variant="primary"></b-spinner>
                            <b-button v-else variant="primary" @click="completeOrder">
                                Yes?
                            </b-button>
                        </b-button-group>
                    </div>
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="4">
                    <b-badge pill variant="dark">{{ order.seller }}</b-badge><b> - {{ order.store }}</b>
                    <br />
                    {{ order.customer_name }}
                    <br />
                    <b-link @click="copyClipboard(order.order_id)">#{{ order.order_id }}</b-link> -
                    <b-badge v-show="$auth.user.role =='seller'" :class="class_status">{{ order.order_status }} </b-badge>
                    <b-link v-show="$auth.user.role !=='seller'" v-if="!dialogUpdateStatus" @click="dialogUpdateStatus=!dialogUpdateStatus">
                        <b-badge :class="class_status">{{ order.order_status }} </b-badge>
                    </b-link>
                    <b-input-group v-else style="width:150px; display:inline-flex;">
                        <b-form-select v-model="order.order_status" size="sm" @input="inputOrderStatus">
                            <b-form-select-option value="null" disabled>Select Order Status</b-form-select-option>
                            <b-form-select-option v-for="status in options_status" :key="status.name" :value="status.name">{{status.label}}</b-form-select-option>

                        </b-form-select>
                        <b-button size="sm" @click="dialogUpdateStatus=!dialogUpdateStatus">X</b-button>
                    </b-input-group>
                    -
                    {{ showDate }}
                    <br />
                    <b-link style="color:#2d2d2d; text-decoration: underline;" @click="isShowFullAdress=!isShowFullAdress">Full Address:</b-link>  <span v-if="!checkDifferenceAddress" style="color:red"> {{ getFullAddress}}</span>
                    <span v-else>{{ getFullAddress}}</span>
                    <br/>
                     <span v-show="isShowFullAdress">{{ order.customer_fulladdress}}</span>
                    <br />

                    <!-- Address: {{ order.customer_address }} {{ order.customer_address2 }}, {{ order.customer_city }},
                {{ order.customer_state }} {{ order.customer_zip }}
                <br />
                {{ order.customer_country }} 
                <br />-->
                    <p v-show="order.customer_note!=''" class="p-customer-note">{{order.customer_note}}</p>
                    <b-link style="display:block" v-show="user_role!='seller'" @click="enableFulfillment = !enableFulfillment">Fulfilment: <span v-show="order.fulfillment_order_id">{{order.fulfillment_id}} :</span> {{order.fulfillment_order_id}}</b-link>
                    <div style="display:block"><label>Total: {{showTotal}} Fee: {{showFee}} - after Fee: {{showAfterFee}}</label></div>
                    <div style="display:block" v-show="order.fulfillment_order_id!=''">
                        <label>Items Cost: {{order.fulfillment_items_cost}} - Shipping Cost: {{order.fulfillment_ship_cost}} </label>
                    </div>
                    <the-tracking v-if="order.tracking_url != ''" :trackingdata="order.tracking_url"></the-tracking>
                </b-col>
                <b-col cols="8" v-show="enableFulfillment " style="margin-bottom:10px;">
                    <b-badge pill variant="info">Fulfillment</b-badge><b> - Shipping Info</b>
                    <b-row>
                        <b-col cols="3" style="padding-right:0px">
                            <b-input v-model="shipFirstName" placeholder="First Name"></b-input>
                        </b-col>
                        <b-col cols="3">
                            <b-input v-model="shipLastName" placeholder="Last Name"></b-input>
                        </b-col>
                        <b-col cols="6" style="padding-bottom:5px;">
                            <b-input-group prepend="Order label">
                                <b-form-input v-model="orderLabel" placeholder="Order Label"></b-form-input>
                            </b-input-group>
                        </b-col>
                    </b-row>
                    <b-row>
                        <b-col cols="3" style="padding-right:0px">
                            <b-input v-model="shipAddress" placeholder="Address"></b-input>
                        </b-col>
                        <b-col cols="3">
                            <b-input v-model="shipAddress2" placeholder="Address 2"></b-input>
                        </b-col>
                        <b-col cols="3" style="padding-right:0px">
                            <b-input v-model="shipCity" placeholder="City"></b-input>
                        </b-col>
                        <b-col cols="3">
                            <b-input v-model="shipZip" placeholder="Zip"></b-input>
                        </b-col>
                    </b-row>
                    <b-row style="margin-top:5px;">
                        <b-col cols="3" style="padding-right:0px">
                            <b-form-select v-model="shipCountry" @input="inputCountry">
                                <b-select-option v-for="country in options_country" :key="country.id" :value="country.code">{{country.name}}</b-select-option>
                            </b-form-select>
                        </b-col>
                        <b-col cols="3">
                            <b-form-select v-if="options_state.length>0" v-model="shipState">
                                <b-select-option v-for="state in options_state" :key="state.id" :value="state.code">{{state.name}}</b-select-option>
                            </b-form-select>
                            <b-form-input v-else v-model="shipState" placeholder="Region/State"></b-form-input>
                        </b-col>

                        <b-col cols="2">
                            <b-spinner v-if="isCreateOrderLoading" size="sm"></b-spinner>
                            <b-spinner v-if="isCreateOrderLoading" variant="success" size="sm"></b-spinner>
                            <b-spinner v-if="isCreateOrderLoading" variant="warning" size="sm"></b-spinner>
                            <b-button v-else v-show="order.fulfillment_order_id=='' && isEnableCreateOrder && !isUpdateVariant" variant="primary" @click="createOrder">Create Order</b-button>
                        </b-col>
                        <b-col cols="4" style="text-align:center;">
                            <b-link v-if="order.fulfillment_id == 'teescape'" :href="'https://teescape.com/active/shopify/ShopifyOrders.asp'" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                            <b-link v-if="order.fulfillment_id.includes('printify')" :href="'https://printify.com/app/order/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                            <b-link v-if="order.fulfillment_id == 'dreamship'" :href="'https://app.dreamship.com/app/orders/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                            <b-link v-if="order.fulfillment_id == 'burgerprints'" :href="'https://pro.burgerprints.com/dropship/orders/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                            <b-link v-if="order.fulfillment_id == 'printhigh'" :href="'https://seller.printhigh.com/order/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                            <b-link v-if="order.fulfillment_id == 'gearment'" :href="'https://account.gearment.com/order/show/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                            <b-link v-if="order.fulfillment_id == 'otbzone'" :href="'https://dashboard.otbzone.com/s/orders/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                        
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-link style="display:block" v-show="!isEditNode" @click="isEditNode=!isEditNode">
                        <b-badge v-show="order.note==''" variant="primary">Create Note</b-badge>
                        <p v-show="order.note!=''" class="p-note">{{order.note}}</p>
                    </b-link>
                    <div v-show="isEditNode">
                        <b-form-textarea id="trnote" v-model="order.note" placeholder="Enter something..." rows="3" max-rows="6"></b-form-textarea>
                        <b-button-group style="width:100%;">
                            <b-button variant="success" @click="saveNote" size="sm">Save</b-button>
                            <b-button variant="dark" @click="isEditNode=!isEditNode" size="sm">Cancel</b-button>
                        </b-button-group>

                    </div>

                </b-col>
                <b-col>
                    <div v-if="user_role!='seller'">
                        <b-link v-if="!isCloneOrder" style="display:block" @click="isCloneOrder=!isCloneOrder">
                            <b-badge pill variant="dark">Clone This Order</b-badge>
                        </b-link>
                        <div v-else style="padding-top:10px;padding-bottom:5px;">
                            <label>Do you want create a clone order?</label>
                            <b-button-group style="width:100%;">
                                <b-button variant="dark" @click="isCloneOrder=!isCloneOrder">
                                    No
                                </b-button>
                                <b-spinner v-if="isCloneOrderLoading" variant="primary"></b-spinner>
                                <b-button v-else variant="primary" @click="cloneOrder">
                                    Yes?
                                </b-button>
                            </b-button-group>
                            <br />
                            <label v-if="order_clone!= null">
                                <b-link @click="copyClipboard(order_clone.order_id)">Clone ID: {{order_clone.order_id}}</b-link>
                            </label>
                        </div>
                    </div>
                </b-col>
                <b-col cols="auto">
                    <b-link v-show="user_role!='seller'" v-if="!isManualFulfill" @click="isManualFulfill=!isManualFulfill">
                        <b-badge variant="info">Manual Other Fulfill</b-badge>
                    </b-link>
                    <div v-else>
                        <b-row style="width:100%; margin:15px;">
                            <b-col cols="12">
                                <b-input-group>
                                    <span style="padding-top:5px; padding-right:10px;">Fulfillment By: </span>
                                    <b-form-select style="display:inline" v-model="order.fulfillment_id">
                                        <b-form-select-option :value="null">Select Fulfilment</b-form-select-option>
                                        <b-form-select-option v-for="option in options_fulfillment" :key="option.id" :value="option.id">
                                            {{ option.title}}
                                        </b-form-select-option>
                                    </b-form-select>
                                    <!-- <b-button v-if="order.fulfillment_id == 'printify'" @click="updateOrderCost">Get Cost Order</b-button> -->
                                </b-input-group>

                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-form-group label="Fulfillment Order ID">
                                    <b-input v-model="order.fulfillment_order_id"></b-input>
                                </b-form-group>
                                <b-form-group label="Fulfillment Item Cost">
                                    <b-input v-model="order.fulfillment_items_cost" type="number"></b-input>
                                </b-form-group>

                            </b-col>
                            <b-col>
                                <b-form-group label="Fulfillment Ship Cost">
                                    <b-input v-model="order.fulfillment_ship_cost" type="number"></b-input>
                                </b-form-group>
                                <b-form-group label="Tracking Url">
                                    <b-input v-model="order.tracking_url" placeholder="Format: Carrier|Number|Link"></b-input>
                                </b-form-group>

                            </b-col>
                            <b-button-group style="width:100%; padding:15px;">
                                <b-button @click="saveManualFulfillOrder" variant="primary">Save</b-button>
                                <b-button @click="isManualFulfill=!isManualFulfill">Cancel</b-button>
                            </b-button-group>
                        </b-row>
                    </div>
                </b-col>
                <b-col style="text-align:right;">
                    <b-link :href="getDownloadInfoUrl">
                        <b-badge variant="success">Download Order Info</b-badge>
                    </b-link>
                </b-col>
            </b-row>
            <b-row v-show="enableFulfillment">
                <b-col cols="8"></b-col>
                <b-col cols="4">
                    <b-input-group>
                        <span style="padding-top:20px; padding-right:10px;">Fulfillment By: </span>
                        <b-form-select style="display:inline" :disabled="!order.fulfillment_order_id==''" v-model="order.fulfillment_id" @input="changeFulfillment" class="mt-3">
                            <b-form-select-option :value="null">Select Fulfilment</b-form-select-option>
                            <b-form-select-option v-for="option in options_fulfillment" :key="option.id" :value="option.id">
                                {{ option.title}}
                            </b-form-select-option>
                        </b-form-select>
                    </b-input-group>
                </b-col>
            </b-row>
            <the-order-item v-for="(item, index) in order.items" :key="item.id" :order="order" :fulfillment_id="order.fulfillment_id" :item="item" :options_blueprints="options_blueprints" :enableFulfillment="enableFulfillment" :enableCreateOrder="enableCreateOrder"></the-order-item>

        </b-overlay>
    </b-container>
    <b-modal hide-header v-model="modalViewImage" ok-only>
        <div style="text-align:center;  background:#c2c2c2">
            <b-img fluid :src="main_image"></b-img>
        </div>
    </b-modal>
    <b-modal v-model="dialog" @hidden="close" centered ok-title="Close" ok-only>
        <b-overlay :show="isEditLoading" no-wrap></b-overlay>
    </b-modal>

</div>
</template>

<script>
import Badges from '../pages/notifications/Badges.vue';
import TheDesignView from './TheDesignView.vue';
import TheLine from "./TheLine.vue";
import TheOrderItem from './TheOrderItem.vue';
import TheTracking from './TheTracking.vue';
export default {
    props: ["id", "index", "order", "updateFulfillment"],
    components: {
        TheLine,
        TheDesignView,
        TheTracking,
        Badges,
        TheOrderItem,
    },
    data() {
        return {
            user_role: '',
            isShowFullAdress:false,
            isManualFulfill: false,
            isCompletedDialog: false,
            isUpdateVariant: false,
            isEnableCreateOrder: false,
            isEditNode: false,
            isCloneOrderLoading: false,
            isCloneOrder: false,
            modalViewImage: false,
            main_image: '',
            class_status: '',
            dialogUpdateStatus: false,
            dialog: false,
            enableFulfillment: false,
            isEditLoading: false,
            isCreateOrderLoading: false,
            isShowSee: false,
            isShowFullDescr: false,
            reason: null,
            message: "",
            order_clone: null,
            options_fulfillment: [{
                    id: 'printify',
                    title: 'printify'
                },
                {
                    id: 'printify2',
                    title: 'OTB Printify'
                },
                 {
                    id: 'teescape',
                    title: 'teescape'
                },
                {
                    id: 'dreamship',
                    title: 'dreamship'
                },
                {
                    id: 'burgerprints',
                    title: 'burgerprints'
                },
                 {
                    id: 'printhigh',
                    title: 'printhigh'
                },
                  {
                    id: 'gearment',
                    title: 'gearment'
                },
                 {
                    id: 'otbzone',
                    title: 'otbzone'
                },
                 {
                    id: 'merchize',
                    title: 'merchize'
                },
                {
                    id: 'printway',
                    title: 'printway'
                },
                {
                    id: 'other',
                    title: 'other'
                },
            ],
            options_state: [],
            options_country: [],
            options_status: [{
                    label: "NEW",
                    name: "NEW",
                    color: "status-new",
                },
                {
                    label: "CREATED",
                    name: "CREATED",
                    color: "status-created",
                },
                {
                    label: "IN_PRODUCTION",
                    name: "IN_PRODUCTION",
                    color: "status-inproduction",
                },
                {
                    label: "SHIPPED",
                    name: "SHIPPED",
                    color: "status-shipped",
                },
                {
                    label: "COMPLETED",
                    name: "COMPLETED",
                    color: "status-completed",
                },
                {
                    label: "CANCEL",
                    name: "CANCEL",
                    color: "status-cancel",
                },
                {
                    label: "HAS_ISSUES",
                    name: "HAS_ISSUES",
                    color: "status-issues",
                },
                {
                    label: "OUT_OF_STOCK",
                    name: "OUT_OF_STOCK",
                    color: "status-outstock",
                },
                {
                    label: "TRASH",
                    name: "TRASH",
                    color: "status-trash",
                },
            ],
            fulfillment_order_id: '',
            shopId: null,
            styleId: null,
            variantId: null,
            orderLabel: null,
            shipFirstName: null,
            shipLastName: null,
            shipAddress: null,
            shipAddress2: null,
            shipCity: null,
            shipZip: null,
            shipState: null,
            shipCountry: null,
            edit_item_id: 0,
            options_blueprints: [],
            printify: {
                const_blueprints: [145, 184, 1296,1256,632, 1268, 478, 750, 1307, 598, 6, 11, 12, 706, 1015, 77, 49, 80, 48, 41, 39, 880, 988, 420, 157, 32, 580, 34, 31, 561, 586, 599, 617, 33, 964, 610, 1039, 600, 146, 1141, 1094, 81, 800, 571, 945, 603, 400, 562, 627, 314, 638],
                options_blueprints: [],
                options_providers: [],
                options_variants: [],
                country: [],
                state: []
            },
        };
    },
    computed: {
        showFulfillmentOrderId() {
            if (this.order.fulfillment_order_id) {
                return this.order.fulfillment_order_id;
            }
            return this.fulfillment_order_id;
        },
        showFee() {
            if(this.order.platform=='burgerprints'){
                let fee = 0.05 * (this.order.order_total);
                return fee.toFixed(2);
            }else
            {
                let fee = 0.065 * (this.order.item_total + this.order.discount_value) + 0.03 * (this.order.item_total + this.order.discount_value + this.order.shipping_value) + 0.25;
                return fee.toFixed(2);
            }
        },
        showTotal() {
            return this.order.order_total.toFixed(2);
        },
        showAfterFee() {
            if(this.order.platform=='burgerprints'){
               let afterfee = this.order.order_total - 0.05 *this.order.order_total;
                return afterfee.toFixed(2);
            }else{
                let afterfee = this.order.order_total - 0.065 * (this.order.item_total + this.order.discount_value) + 0.03 * (this.order.item_total + this.order.discount_value + this.order.shipping_value) + 0.25;
                return afterfee.toFixed(2);
            }
        },
        showTime() {
            return (
                this.order.created_at.split("T")[0] +
                " " +
                this.order.created_at.split("T")[1].split(":")[0] +
                ":" +
                this.item.created_at.split("T")[1].split(":")[1]
            );
        },
        showDate() {
            return this.order.order_date.split("T")[0];
        },
        getFullAddress() {
            let address = this.order.customer_fulladdress.replace(this.order.customer_fulladdress.split('\n')[0], '').replace('USPS Verified', '');
            if(address.length < 20)
                return this.order.customer_fulladdress;
            return address+ ' ' + this.order.customer_country;
        },
        getDownloadInfoUrl() {
            return this.$axios.defaults.baseURL + 'reports/generalordersitems?order_id=' + this.order.order_id;
        },
        checkDifferenceAddress() {
            let address = this.order.customer_name + this.order.customer_address + this.order.customer_address2 + this.order.customer_city + this.order.customer_state + this.order.customer_zip + this.order.customer_country;
            let addressCompare = this.order.customer_fulladdress;
            address = address.replace(' ', '').replace(/ /g, '')
            addressCompare = addressCompare.replace(/\n|\r/g, "").replace(' ', '').replace(',', '').replace('USPS Verified', '').replace(/ /g, '')

            if (address == addressCompare)
                return true;
            return false;
        }
    },
    watch: {
        async enableFulfillment(value) {
            if (value) {
                this.isEditLoading = true;
                await this.getCountryState();
                this.getBlueprints();
                this.options_country = this.printify.country;
                for (let i = 0; i < this.printify.country.length; i++) {
                    if (this.order.customer_country == this.printify.country[i].name) {
                        this.options_state = this.printify.country[i].states
                        this.shipCountry = this.printify.country[i].code;
                    }
                }

                if (this.order.fulfillment_order_id != '' && this.order.fulfillment_id.includes('printify')) {
                    this.GetOrderFulfill();
                } else {

                    this.shipFirstName = this.order.customer_name.split(' ')[0]
                    this.shipLastName = this.order.customer_name.split(' ')[this.order.customer_name.split(' ').length - 1]
                    this.shipAddress = this.order.customer_address;
                    this.shipAddress2 = this.order.customer_address2;
                    this.orderLabel = this.order.store + '-' + this.order.order_id;
                    this.shipCity = this.order.customer_city;
                    this.shipState = this.order.customer_state;
                    this.shipZip = this.order.customer_zip;
                }
                this.isEditLoading = false;
            }
        },
        order() {
            this.isEditLoading = false;
            this.initialize();
        }
    },
    mounted() {
        this.user_role = this.$auth.user.role;
        this.initialize();
    },
    methods: {
        getOptionVariantName(option) {
            return (option.options.color ? option.options.color : '') + (option.options.des ? option.options.des : '') + '/' + option.options.size;
        },
        async initialize() {
            await this.getOrderItems();
            this.getStatusColor();
        },
        changeFulfillment() {
            this.updateOrder();
            this.getBlueprints();
        },
        async getCountryState() {
            if (this.order.fulfillment_id !== 'other') {
                await this.$axios.get('fulfillments/country-states' + "?fulfillment_id=" + this.order.fulfillment_id, {
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
            }

        },
        async getBlueprints() {
            this.options_blueprints = [];
            if (this.order.fulfillment_id !== 'other') {
                await this.$axios.get('fulfillments/blueprints' + "?fulfillment_id=" + this.order.fulfillment_id, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        if (this.order.fulfillment_id.includes("printify")) {
                            this.printify.options_blueprints = response.data;
                            this.printify.options_blueprints = this.printify.options_blueprints.filter(x => this.printify.const_blueprints.includes(x.id));
                            this.options_blueprints = Object.assign(this.printify.options_blueprints);
                        } else {
                            if (this.order.fulfillment_id == "teescape") {
                                let teescape_df = ['5000', '3001C', '5000L', '2400', '3005', '3480', '18500', '18000', '4424', '4411']
                                this.options_blueprints = response.data.filter(x => teescape_df.includes(x.id));
                            } else {
                                if (this.order.fulfillment_id == "dreamship") {
                                    this.options_blueprints = response.data.filter(x => x.title.includes('Ornament') || x.title.includes('Yard Sign'));
                                } else {
                                    if (this.order.fulfillment_id == "burgerprints") {
                                        this.options_blueprints = response.data.filter(x => x.title.includes('Kid') || x.title.includes('Tee') || x.title.includes('Unisex') 
                                        || x.title.includes('Men')|| x.title.includes('Women') || x.title.includes('Sweat')|| x.title.includes('Shirt'));
                                    } else {
                                         if (this.order.fulfillment_id == "printway") {
                                            this.options_blueprints = response.data.filter(x => x.title.includes('Mug') || x.title.includes('Tumbler') || x.title.includes('Bottle'));
                                        }else
                                        this.options_blueprints = response.data;
                                    }
                                }
                            }

                        }
                    })
                    .catch((error) => {
                        this.makeToast('danger', error.message)
                    });
            }
        },
        completeOrder() {
            this.order.order_status = 'COMPLETED';
            this.updateOrder();
            this.isCompletedDialog = !this.isCompletedDialog;
        },
        saveNote() {
            this.updateOrder();
            this.isEditNode = !this.isEditNode;
        },
        getStatusColor() {
            this.class_status = this.options_status.filter(x => x.name == this.order.order_status)[0].color
        },
        viewMockup(url) {
            this.main_image = url;
            this.modalViewImage = true;
        },

        inputOrderStatus() {
            this.updateOrder();
            this.getStatusColor();
            this.dialogUpdateStatus = !this.dialogUpdateStatus;
        },
        showDialogUpdateStatus() {
            this.dialogUpdateStatus = true;
        },
        showTotalVariant(list) {
            if (list !== undefined)
                return list.length
        },
        formatPrice(price) {
            return Number(price / 100).toFixed(2);
        },
        async inputCountry() {
            this.options_state = this.printify.country.filter(x => x.code == this.shipCountry)[0].states
        },
        async getOrderItems() {
            this.isEditLoading = true;
            await this.$axios.get('ordersesty/' + this.order.order_id + '/items', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.order.items = response.data;
                    this.isEditLoading = false;
                })
                .catch((error) => {
                    this.isEditLoading = false;
                    this.makeToast('danger', error.message)
                });
            this.enableCreateOrder();
            // console.log(this.isEnableCreateOrder) s
        },
        async cloneOrder() {
            this.isCloneOrderLoading = true;
            await this.$axios.post('ordersesty/' + this.order.id + '/clone', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.order_clone = response.data;
                    this.isCloneOrderLoading = false;
                    this.makeToast('success', 'Saved')
                })
                .catch((error) => {
                    this.isCloneOrderLoading = false;
                    // console.log(error)
                    this.makeToast('danger', error.response.data)
                });

        },
        saveManualFulfillOrder() {
            this.isManualFulfill = !this.isManualFulfill;
            this.updateOrder();
        },
        async updateOrder() {
            this.isEditLoading = true;
            const json = JSON.stringify(this.order);
            await this.$axios.post('ordersesty/' + this.order.id, json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isEditLoading = false;
                    this.makeToast('success', 'Saved')
                    //this.initialize();
                })
                .catch((error) => {

                    this.isEditLoading = false;
                    this.makeToast('danger', error.message)
                });
        },
        async updateDesign(item) {
            const json = JSON.stringify(item);
            await this.$axios.post('ordersesty/' + item.order_id + '/items/' + item.id, json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.makeToast('success', 'Saved')
                    //this.initialize();
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        enableCreateOrder() {
            this.isEnableCreateOrder = true;
            for (let i = 0; i < this.order.items.length; i++) {
                if (this.order.items[i].variant_id == '') {
                    //  console.log(this.order.items[i])
                    this.isEnableCreateOrder = false;
                }
            }
            //console.log(this.isEnableCreateOrder)
        },

        async GetOrderFulfill() {
            if (this.order.fulfillment_id.includes('printify')) {
                this.$axios.get('fulfillments/fulfillment-orders/' + this.order.fulfillment_order_id + "?fulfillment_id=" + this.order.fulfillment_id, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        let fulfillment_order = response.data;
                        this.orderLabel = fulfillment_order.metadata.shop_order_label
                        this.shipFirstName = fulfillment_order.address_to.first_name;
                        this.shipLastName = fulfillment_order.address_to.last_name;
                        this.shipAddress = fulfillment_order.address_to.address1;
                        this.shipAddress2 = fulfillment_order.address_to.address2;
                        this.shipCity = fulfillment_order.address_to.city;
                        this.shipState = fulfillment_order.address_to.region;
                        this.shipZip = fulfillment_order.address_to.zip;
                        for (let i = 0; i < this.printify.country.length; i++) {
                            if (fulfillment_order.address_to.country == this.printify.country[i].name) {
                                this.options_state = this.printify.country[i].states
                                this.shipCountry = this.printify.country[i].code;
                            }
                        }
                    })
                    .catch(function (error) {
                        this.makeToast('danger', error.message)
                    });
            }

        },
        async createOrder() {
            this.isCreateOrderLoading = true;
            let obj = {
                id: this.order.id,
                order_label: this.orderLabel,
                firstname: this.shipFirstName,
                lastname: this.shipLastName,
                ship_address: this.shipAddress,
                ship_address2: this.shipAddress2,
                ship_city: this.shipCity,
                ship_state: this.shipState,
                ship_zip: this.shipZip,
                ship_country: this.shipCountry,
            }
            const json = JSON.stringify(obj);
            await this.$axios.post('fulfillments/create-order' + "?fulfillment_id=" + this.order.fulfillment_id, json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {

                    this.isCreateOrderLoading = false;
                    this.isEditLoading = true;
                    this.updateFulfillment(this.order, response.data.fulfillment_order_id, 'CREATED');
                    this.getStatusColor();
                    this.makeToast('success', 'Saved')
                })
                .catch((error) => {
                    this.isCreateOrderLoading = false;
                    let message = JSON.stringify(error.response.data) + '';
                    this.makeToast('danger', message)
                });
            // if (this.order.fulfillment_order_id != '') {
            //     //console.log('update cost')
            //     this.updateOrderCost();
            // }
            this.isCreateOrderLoading = false;
        },

        showMeta(meta) {
            return meta;
        },
        async downloadFile() {
            let dataurl = this.item.design_front; // 'https://80steess3.imgix.net/production/products/STRNG032/hellfire-club-stranger-things-raglan-baseball-shirt.master.png';

            var filename = dataurl.substring(dataurl.lastIndexOf("/") + 1);
            FileSaver.saveAs(this.item.design_front, filename);
        },
        async copyClipboard(message) {
            await navigator.clipboard.writeText(message);
            this.makeToast("success", "Copied");
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        close() {
            this.dialog = false;

        },
        showEditDialog() {
            this.dialog = true;
            this.getShop();
        },
    },
};
</script>

<style>
.mb-container {
    background: white;
    padding: 25px;
    margin-bottom: 1px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 22%);
    margin-bottom: 10px;
    margin-top: 10px;
}

.p-note {
    color: #2d2d2d;
    background: #bfd8ee;
    border-radius: 10px;
    padding: 10px;
    text-align: start;
    white-space: pre-line;
    margin-bottom: 0;
}

.p-customer-note {
    color: #2d2d2d;
    background: #FBEAD8;
    border-radius: 10px;
    padding: 10px;
    text-align: start;
    white-space: pre-line;
    margin-bottom: 0;
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

.status-trash {
    color: #fff;
    background-color: #2d2d2d;
}

.form-control {

    color: #2d2d2d;

}
</style>
