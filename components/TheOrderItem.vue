<template>
<div>
    <b-row>
        <b-col>
            <b-form-select :disabled="!order.fulfillment_order_id==''" v-model="order.fulfillment_id" @input="inputFulfillment(order.fulfillment_id)">
                <b-form-select-option :value="">Select Fulfilment</b-form-select-option>
                <b-form-select-option v-for="option in options_fulfillments" :key="option.id" :value="option.id">
                    {{ option.title }}
                </b-form-select-option>
            </b-form-select>
        </b-col>
    </b-row>
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
        <b-col v-show="enableFulfillment" v-if="item.name != 'Fast Shipping'">

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
    </b-row>
    <b-overlay :show="isEditLoading" no-wrap></b-overlay>
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
export default {
    props: ["order", "item", "index", "order_id", "printify", "printifylength", "enableFulfillment", "enableCreateOrder"],
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
            options_fulfillments: [{
                    id: 'printify',
                    title: 'Printify'
                },
                {
                    id: 'other',
                    title: 'Other'
                }
            ],
            options_blueprints: [],
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

    },
    mounted() {
        this.options_blueprints = this.printify.options_blueprints;
        this.user_role = this.$auth.user.role;
        if (this.item.style_id !== '' && this.item.style_id !== undefined) {
            this.inputBlueprint(this.item.style_id);
            if (this.item.provider_id !== '') {
                this.inputProvider(this.item.style_id, this.item.provider_id)
            }
        }

    },
    methods: {
        getOptionVariantName(option) {
            let variantName = ''
            variantName = Object.keys(option.options).map(key => `${key}: ${option.options[key]}`).join('/')
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
        async inputFulfillment(fulfillment_id) {
            if (fulfillment_id == 'printify') {
                this.options_blueprints = this.printify.options_blueprints;
            } else {
                this.options_blueprints = [];
                this.item.style_id = '';
                this.item.provider_id = '';
                this.item.variant_id = '';
            }
        },
        async inputBlueprint(style_id) {
            if (style_id !== null || style_id !== '') {
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
                await this.$axios.get('printify/print_providers?blueprint=' + blueprint, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        console.log(data)
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
                await this.$axios.get('printify/variants?blueprint=' + blueprintId + '&provider=' + providerId, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.edit_item_id = 0
                        data = response.data.variants.sort((a, b) => ((a.options.color ? a.options.color : '') + (a.options.des ? a.options.des : '') + a.id).localeCompare(((b.options.color ? b.options.color : '') + (b.options.des ? b.options.des : '') + b.id)));

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
