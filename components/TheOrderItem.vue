<template>
<b-row class="r-item mt-3">
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
            <b-form-input :disabled="!order.fulfillment_order_id==''" debounce="1000" v-model="item.design_id" @update="updateItem(item)"></b-form-input>
        </b-input-group>
        <b-row>
            <the-design-view :designid="item.design_id" :itemname="item.name"></the-design-view>
        </b-row>
    </b-col>
    <b-col v-show="enableFulfillment" v-if="item.name != 'Fast Shipping' && item.design_id > 0">

        <b-form-select :disabled="!order.fulfillment_order_id==''" v-model="item.style_id" @input="inputBlueprint(item.style_id)">
            <b-form-select-option :value="null">Select Style</b-form-select-option>
            <b-form-select-option v-for="option in options_blueprints" :key="option.id" :value="option.id">
                {{ option.title }}
            </b-form-select-option>
        </b-form-select>

        <b-form-select :disabled="!order.fulfillment_order_id==''" v-model="item.provider_id" class="mt-3" @input="inputProvider(item.style_id, item.provider_id)">
            <b-form-select-option :value="null">Select Provider</b-form-select-option>
            <b-form-select-option v-for="option in options_providers" :key="option.id" :value="option.providerId">
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
                <b-form-select-option v-for="(option, id) in options_variants" :key="option.id" :value="option.id">
                    {{getOptionVariantName(option)}}
                </b-form-select-option>
            </b-form-select>
        </b-input-group>
    </b-col>

    <b-modal hide-header v-model="modalViewImage" ok-only>
        <div style="text-align:center;  background:#c2c2c2">
            <b-img fluid :src="main_image"></b-img>
        </div>
    </b-modal>
    <b-modal v-model="dialog" @hidden="close" centered ok-title="Close" ok-only>
        <b-overlay :show="isEditLoading" no-wrap></b-overlay>
    </b-modal>
</b-row>
</template>

<script>
import Badges from '../pages/notifications/Badges.vue';
import TheDesignView from './TheDesignView.vue';
export default {
    props: ["order", "fulfillment_id", "item", "index", "order_id", "options_blueprints", "enableFulfillment", "enableCreateOrder"],
    components: {
        TheDesignView,
        Badges,
    },
    data() {
        return {
            user_role: '',
            isManualFulfill: false,
            isCompletedDialog: false,
            isUpdateVariant: false,
            modalViewImage: false,
            main_image: '',
            class_status: '',
            dialogUpdateStatus: false,
            dialog: false,
            isEditLoading: false,
            isShowSee: false,
            options_providers: [],
            options_variants: [],
            options_variants: [],
            shopId: null,
            styleId: null,
            variantId: null,
            edit_item_id: 0,
        };
    },
    computed: {

    },
    watch: {
        enableFulfillment(value) {
            if (value) {
                if (this.order.fulfillment_id !== 'other') {
                    this.user_role = this.$auth.user.role;
                    if (this.item.style_id !== '' && this.item.style_id !== undefined) {
                        this.inputBlueprint(this.item.style_id);
                        this.item.provider_id  = "";
                        if (this.item.provider_id !== '') {
                            this.item.variant_id = "";
                            this.inputProvider(this.item.style_id, this.item.provider_id)
                        }
                    }
                }
            }
        },
        fulfillment_id(value) {

            if (value !== 'other') {
                this.options_providers = []
                this.options_variants = []
                // if (this.item.style_id !== '' && this.item.style_id !== undefined && this.item.style_id !== null) {
                //     this.inputBlueprint(this.item.style_id);
                //     if (this.item.provider_id !== '') {
                //         this.inputProvider(this.item.style_id, this.item.provider_id)
                //     }
                // }
            } else {
                this.options_providers = []
                this.options_variants = []
            }
        }
    },
    mounted() {
        if (this.enableFulfillment) {
                if (this.order.fulfillment_id !== 'other') {
                    this.user_role = this.$auth.user.role;
                    if (this.item.style_id !== '' && this.item.style_id !== undefined) {
                        this.inputBlueprint(this.item.style_id);
                        if (this.item.provider_id !== '') {
                            this.inputProvider(this.item.style_id, this.item.provider_id)
                        }
                    }
                }
            }
    },
    methods: {
        getOptionVariantName(option) {
            let variantName = ''
            variantName = Object.keys(option.options).map(key => `${option.options[key]}`).join('/')
            return variantName;
            //return (option.options.color ? option.options.color : '') + (option.options.des ? option.options.des : '') + '/' + option.options.size;
        },
        viewMockup(url) {
            this.main_image = url;
            this.modalViewImage = true;
        },
        showTotalVariant(list) {
            if (list !== undefined)
                return list.length;
        },
        formatPrice(price) {
            return Number(price / 100).toFixed(2);
        },

        async inputBlueprint(style_id) {
            if (style_id !== null || style_id !== '') {
                this.options_providers = []
                this.options_variants = []
                this.getProviders(style_id);
            } else {
                this.options_providers = []
                this.options_variants = []
                this.item.provider_id = '';
                this.item.variant_id = '';
            }
        },
        async getProviders(blueprint) {
            if (blueprint && blueprint !== null && blueprint !== '') {
                let data = []
                this.options_providers = []
                await this.$axios.get('fulfillments/print_providers?blueprint=' + blueprint + "&fulfillment_id=" + this.order.fulfillment_id, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        if (this.order.fulfillment_id === 'printify') {
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
                        } else {
                            data = response.data;
                        }

                    })
                    .catch((error) => {
                        // this.makeToast('danger', error.message)
                    });
                this.options_providers = data
            }
        },

        async updateItem(item) {
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
        async inputProvider(blueprintId, providerId) {
            if (providerId !== '' && providerId !== null) {

                this.options_variants = []
                let data = []
                await this.$axios.get('fulfillments/variants?blueprint=' + blueprintId + '&provider=' + providerId + "&fulfillment_id=" + this.order.fulfillment_id, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.edit_item_id = 0
                        if (this.order.fulfillment_id == 'printify') {
                            data = response.data.variants.sort((a, b) => ((a.options.color ? a.options.color : '') + (a.options.des ? a.options.des : '') + a.id).localeCompare(((b.options.color ? b.options.color : '') + (b.options.des ? b.options.des : '') + b.id)));
                        } else {
                            if(this.order.fulfillment_id == 'dreamship'){
                                data = response.data.sort((a, b) => ((a.options.color ? a.options.color : '') + (a.options.des ? a.options.des : '') + a.id).localeCompare(((b.options.color ? b.options.color : '') + (b.options.des ? b.options.des : '') + b.id)));
                            }else{
                                if(this.order.fulfillment_id == 'burgerprints'){
                                    data = response.data.sort((a, b) => ((a.options.color ? a.options.color : '') + (a.options.des ? a.options.des : '')).localeCompare(((b.options.color ? b.options.color : '') + (b.options.des ? b.options.des : ''))));
                                }else
                                data = response.data;
                            }
                            
                        }
                    })
                    .catch((error) => {
                        this.edit_item_id = 0
                        //   this.makeToast('danger', error.message)
                    });
                this.options_variants = data;
            } else {
                this.options_variants = []
                this.item.variant_id = '';
            }
        },
        async inputVariant(item) {
            if (item.variant_id !== '' && item.provider_id !== '' && item.style_id !== '') {
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
                    .catch((error) => {
                        item.variant_id = '';
                        item.provider_id = '';
                        item.style_id = '';
                        this.edit_item_id = 0;
                        this.makeToast('danger', error.message)
                    });
                this.isUpdateVariant = false;
                this.edit_item_id = 0;
                this.enableCreateOrder();
            } else {
                this.options_variants = []
                this.edit_item_id = 0;
            }

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
.r-item {
    margin-top: 10px;
}
</style>
