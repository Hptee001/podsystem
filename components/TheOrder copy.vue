<template>
<div>
    <b-container class="mb-container">
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
                <b-link @click="copyClipboard(order.order_id)">#{{ order.order_id }}</b-link>  -
                <b-link v-if="!dialogUpdateStatus" @click="dialogUpdateStatus=!dialogUpdateStatus">
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
                <br/>
                Full Address: <span v-if="!checkDifferenceAddress" style="color:red"> {{ getFullAddress}}</span>
                <span v-else>{{ getFullAddress}}</span> 
                <br />
               
                <!-- Address: {{ order.customer_address }} {{ order.customer_address2 }}, {{ order.customer_city }},
                {{ order.customer_state }} {{ order.customer_zip }}
                <br />
                {{ order.customer_country }} 
                <br />-->
                <p v-show="order.customer_note!=''" class="p-customer-note">{{order.customer_note}}</p>
                
            </b-col>
            <b-col cols="8" v-show="enableFulfillment ">
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
                        <b-link :href="'https://printify.com/app/order/'+order.fulfillment_order_id" target="_blank">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
        
        <b-row>
            <b-col>
                <b-link  style="display:block" v-show="user_role!='seller'" @click="enableFulfillment = !enableFulfillment">Fulfilment: {{order.fulfillment_order_id}}</b-link>
                <div style="display:block"><label>Total: {{order.order_total}} Fee: {{showFee}} - after Fee: {{showAfterFee}}</label></div>
                <div style="display:block" v-show="order.fulfillment_order_id!=''">
                    <label>Items Cost: {{order.fulfillment_items_cost}} - Shipping Cost: {{order.fulfillment_ship_cost}} </label>
                </div>
                <the-tracking v-if="order.tracking_url != ''" :trackingdata="order.tracking_url"></the-tracking>
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
                        <b-button variant="success" @click="saveNote" size="sm" >Save</b-button>
                        <b-button variant="dark" @click="isEditNode=!isEditNode" size="sm" >Cancel</b-button>
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
                <b-link v-show="user_role!='seller'" v-if="!isManualFulfill" @click="isManualFulfill=!isManualFulfill"><b-badge variant="info">Manual Other Fulfill</b-badge></b-link>
                <div v-else>
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
                 <b-link :href="getDownloadInfoUrl"><b-badge variant="success">Download Order Info</b-badge></b-link>
            </b-col>
        </b-row>
        <b-row class="r-item mt-3" v-for="(item, index) in order.items" :key="item.id">
            <b-col cols="1" style="min-width:110px;">
                <b-link @click="viewMockup(item.image_src)">
                    <b-img :src="item.image_src" height="100"></b-img>
                </b-link>
            </b-col>
            <b-col cols="4">
                <span style="font-weight: 500">{{ item.name }}</span> <br />
                <span>Quantity: </span> {{ item.qty }}<br />
                <b-row>
                    <b-col>
                        <span style="white-space: pre-line"> {{ item.meta }}</span>
                    </b-col>
                </b-row>
            </b-col>
            <b-col cols="auto" v-if="item.name != 'Fast Shipping'">
                <b-input-group prepend="DesignId">
                    <b-form-input :disabled="!order.fulfillment_order_id==''" debounce="1000" v-model="item.design_id" @update="updateDesign(item)"></b-form-input>
                    <!-- <b-input-group-append>
                        <b-button :disabled="!order.fulfillment_order_id==''" variant="outline-info" @click="updateDesign(item)">Update</b-button>
                    </b-input-group-append> -->
                </b-input-group>
                <b-row>
                    <the-design-view :designid="item.design_id" :itemname="item.name"></the-design-view>
                </b-row>
            </b-col>
            <b-col v-show="enableFulfillment" v-if="item.name != 'Fast Shipping'">
                <b-form-select :disabled="!order.fulfillment_order_id==''" v-model="item.style_id" @change="inputBlueprint(item.style_id, index)">
                    <b-form-select-option :value="null">Select Style</b-form-select-option>
                    <b-form-select-option v-for="option in printify.options_blueprints" :key="option.id" :value="option.id">
                        {{ option.title }}
                    </b-form-select-option>
                </b-form-select>

                <b-form-select :disabled="!order.fulfillment_order_id==''" v-model="item.provider_id" class="mt-3" @change="inputProvider(item.style_id, item.provider_id, index)">
                    <b-form-select-option :value="null">Select Provider</b-form-select-option>
                    <b-form-select-option v-for="option in list_options_providers[index]" :key="option.id" :value="option.providerId">
                        {{ option.name }} - {{ option.location }} - From
                        {{ formatPrice(option.minPrice) }}$
                    </b-form-select-option>
                </b-form-select>
                <b-input-group prepend="Qty" class="mt-3">
                    <b-form-input :disabled="!order.fulfillment_order_id==''" style="max-width:70px; text-align:right;" :min="0" :max="item.qty" v-model="item.fulfillment_qty" @change="inputVariant(item)" debounce="500" type="number">
                    </b-form-input>
                    <b-spinner v-show="edit_item_id==item.id"></b-spinner>
                    <b-form-select v-show="edit_item_id!=item.id" :disabled="!order.fulfillment_order_id==''" v-model="item.variant_id" @change="inputVariant(item)">
                        <b-form-select-option :value="null">Select Option</b-form-select-option>
                        <b-form-select-option v-for="(option, id) in list_options_variants[index]" :key="option.id" :value="option.id">
                           
                            {{getOptionVariantName(option)}} 
                        </b-form-select-option>
                    </b-form-select>
                </b-input-group>
            </b-col>

        </b-row>
        <b-overlay :show="isEditLoading" no-wrap></b-overlay>
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
import TheTracking from './TheTracking.vue';
export default {
    props: ["id", "index", "order", "printify", "printifylength"],
    components: {
        TheLine,
        TheDesignView,
        TheTracking,
        Badges,
    },
    data() {
        return {
            user_role: '',
            isManualFulfill:false,
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
            options_shops: [],
            options_blueprints: [],
            list_options_providers: [],
            list_options_variants: [],
            options_variants: [],
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
            edit_item_id:0,

        };
    },
    computed: {
        showFee(){
            let fee =  0.065*(this.order.item_total+ this.order.discount_value) + 0.03*(this.order.item_total+ this.order.discount_value+this.order.shipping_value) + 0.25;
            return fee.toFixed(2);
        },
        showAfterFee(){
            let afterfee = this.order.order_total -  0.065*(this.order.item_total+ this.order.discount_value) + 0.03*(this.order.item_total+ this.order.discount_value+this.order.shipping_value) + 0.25;
            return afterfee.toFixed(2);
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
        getFullAddress(){
            return this.order.customer_fulladdress.replace(this.order.customer_fulladdress.split('\n')[0],'').replace('USPS Verified','');
        },
        getDownloadInfoUrl(){
            return this.$axios.defaults.baseURL +'reports/generalordersitems?order_id='+this.order.order_id;
        },
        checkDifferenceAddress(){
            let address = this.order.customer_name + this.order.customer_address + this.order.customer_address2+  this.order.customer_city  +  this.order.customer_state + this.order.customer_zip  + this.order.customer_country;
            let addressCompare = this.order.customer_fulladdress;
            address = address.replace(' ','').replace(/ /g,'')
            addressCompare =addressCompare.replace(/\n|\r/g , "").replace(' ','').replace(',','').replace('USPS Verified','').replace(/ /g,'')
           
            if(address == addressCompare)
              return true; 
            return false;
        }
    },
    watch: {

    },
    mounted() {
        this.options_blueprints = this.printify.options_blueprints;
        this.user_role = this.$auth.user.role;
        this.initialize();
    },
    methods: {
       
        getOptionVariantName(option){
            return  (option.options.color??'')+ (option.options.des??'') +'/' + option.options.size;
        },
        async initialize() {

            await this.getOrderItems();
            this.getStatusColor();
            if (this.order.fulfillment_order_id != '') {
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
            this.options_country = this.printify.country;
            for (let i = 0; i < this.printify.country.length; i++) {
                if (this.order.customer_country == this.printify.country[i].name) {
                    this.options_state = this.printify.country[i].states
                    this.shipCountry = this.printify.country[i].code;
                }
            }
            for (let i = 0; i < this.order.items.length; i++) {
                if (this.order.items[i].variant_id.length > 0) {
                    this.inputBlueprint(this.order.items[i].style_id, i);
                    this.inputProvider(this.order.items[i].style_id, this.order.items[i].provider_id, i);
                }
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
        changeProvider(item) {
            
        },
        async inputCountry() {
            this.options_state = this.printify.country.filter(x => x.code == this.shipCountry)[0].states
        },
        async inputBlueprint(blueprint, index) {
            for (let i = 0; i < index; i++) {
                if (i < this.list_options_providers.length)
                    this.list_options_providers.push([]);
            }
            this.list_options_providers[index] = []
            this.list_options_variants[index] = [];
            this.getProviders(blueprint, index);
            this.inputProvider(blueprint,this.order.items[index].provider_id, index);
        },
        async getOrderItems() {
            await this.$axios.get('ordersesty/' + this.order.order_id + '/items', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.order.items = response.data;

                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.enableCreateOrder();
           // console.log(this.isEnableCreateOrder) s
        },
        async getProviders(blueprint, index) {
            let data = []
            await this.$axios.get('printify/print_providers?blueprint=' + blueprint, {
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
                        data.push(obj);
                    }
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.$set(this.list_options_providers, index, data)
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
        saveManualFulfillOrder(){
            this.order.fulfillment_id= 'other';
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
        async inputProvider(blueprintId, providerId, index) {
            if(providerId!== ''){
                this.edit_item_id = this.order.items[index].id
                for (let i = 0; i < index; i++) {
                    if (i >= this.list_options_variants.length)
                        this.list_options_variants.push([]);
                }
                this.list_options_variants[index] = []
                let data = []
                await this.$axios.get('printify/variants?blueprint=' + blueprintId + '&provider=' + providerId, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.edit_item_id  = 0
                        data = response.data.variants.sort((a, b) => ((a.options.color??'') +(a.options.des??'') + a.id).localeCompare(((b.options.color??'')+(b.options.des??'') + b.id)));
                        
                    })
                    .catch((error) => {
                        this.edit_item_id  = 0
                    //   this.makeToast('danger', error.message)
                    });
                //this.list_options_variants[index] = data;

                this.$set(this.list_options_variants, index, data)
            }
        
        },
        async inputVariant(item) {
            if(item.variant_id !== '' && item.provider_id !== '' && item.style_id !== ''){
                console.log(item.variant_id)
            this.edit_item_id = item.id;
            const json = JSON.stringify(item);
            this.isUpdateVariant = true;
            await this.$axios.post('ordersesty/' + item.order_id + '/items/' + item.id, json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_item_id = 0;
                    this.makeToast('success', 'Saved')
                    //this.initialize();
                })
                .catch((error) =>{
                    item.variant_id = '';
                    item.provider_id = '';
                    item.style_id = '';
                    this.edit_item_id = 0;
                    this.makeToast('danger', error.message)
                });
            this.isUpdateVariant = false;
             this.edit_item_id = 0;
            this.enableCreateOrder();
            }else{
                  item.variant_id = '';
                    item.provider_id = '';
                    item.style_id = '';
                    this.edit_item_id = 0;
            }
            
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
        async updateOrderCost() {
            this.$axios.post('printify/orders-esty/' + this.order.order_id + '/update-cost-order/', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.order = response.data;
                    this.initialize();
                })
                .catch(function (error) {
                    this.makeToast('danger', error.message)
                });
        },
        async GetOrderFulfill() {
            if(this.order.fulfillment_id=='printify'){
                this.$axios.get('printify/fulfillment-orders/' + this.order.fulfillment_order_id, {
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
                ship_address2:this.shipAddress2,
                ship_city: this.shipCity,
                ship_state: this.shipState,
                ship_zip: this.shipZip,
                ship_country: this.shipCountry,
            }
            const json = JSON.stringify(obj);
            await this.$axios.post('printify/create-order', json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.order.fulfillment_order_id = response.data.id;

                    this.order_status = 'CREATED'
                    this.getStatusColor();
                    this.makeToast('success', 'Saved')

                    // this.initialize();
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            if (this.order.fulfillment_order_id != '') {
                //console.log('update cost')
                this.updateOrderCost();
            }
            this.isCreateOrderLoading = false;
        },
        filterProvider(id) {
            return this.printify.options_blueprints;
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

.r-item {
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
    background:#FBEAD8;
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
