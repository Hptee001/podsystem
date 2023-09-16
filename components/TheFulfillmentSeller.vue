<template>
<b-card no-body>
    <b-card-header class="text-center">
        <h6>{{fulfillment.username}}
        </h6>
    </b-card-header>
    <b-list-group>
        <b-list-group-item v-for="seller in listSellers" :key="seller.seller" style="display:flex;">
            <div style="width:80%;">
                {{seller.seller}}
            </div>
            <div style="width:20%; text-align:end">
                <b-button @click="removeSeller(seller.id)" variant="danger" size="sm">X</b-button>
            </div>
        </b-list-group-item>
    </b-list-group>
    <b-input-group v-if="isShowInputStore">
        <b-form-select v-model="inputSeller">
            <template #first>
                <b-form-select-option value="" disabled>-- Please select an option --</b-form-select-option>
            </template>
            <b-form-select-option v-for="item in options_seller" :key="item.id" :value="item.username">{{item.username}}</b-form-select-option>
        </b-form-select>
        <b-button variant="primary" @click="addSeller">Save</b-button>
    </b-input-group>
    <b-button v-else variant="outline-primary" block @click="isShowInputStore=!isShowInputStore">Add Seller</b-button>

    <b-overlay :show="isLoading" no-wrap></b-overlay>
</b-card>
</template>

<script>
import TheStatusStore from './TheStatusStore.vue';
export default {
    components: {
        TheStatusStore
    },
    props: ['fulfillment', 'platform'],
    data() {
        return {
            isShowDieStore: false,
            sellers: [],
            isLoading: false,
            inputSeller: '',
            isShowInputStore: false,
            options_seller: []
        }
    },
    computed: {
        listSellers() {
            return this.sellers;
        },
        countLive() {
            return Object.values(this.stores).filter(x => x.status !== 'Die').length;
        },
        countDie() {
            return Object.values(this.stores).filter(x => x.status == 'Die').length;
        }

    },
    mounted() {
        this.initital();
    },
    methods: {
        initital() {
            this.getSellers();
            this.getSellersByFulfillment();
        },
        async getSellers() {
            this.isLoading = true;
            await this.$axios
                .get("/accounts/sellers", {
                    headers: {
                        Authorization: this.$auth.getToken("local"),
                        "Content-Type": "application/json",
                    },
                })
                .then(async (response) => {
                    this.options_seller = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        async getSellersByFulfillment() {
            this.isLoading = true;

            await this.$axios.get('/fulfillmentsellers/byfulfillment?fulfillment=' + this.fulfillment.username, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.sellers = response.data;
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.isLoading = false;
                });
            console.log(this.sellers)
        },
        async addSeller() {
            this.isLoading = true;
            let data = {
                fulfillment: this.fulfillment.username,
                seller: this.inputSeller
            }
            await this.$axios.post('/fulfillmentsellers/', data, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoading = false;
                    this.initital();
                    this.makeToast('success', 'Saved')
                })
                .catch((error) => {
                    // console.log(error)
                    this.isLoading = false;
                    this.makeToast('danger', error)
                });
            this.isShowInputStore = false;
        },

        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        async removeSeller(id) {
            this.isLoading = true;
            await this.$axios.delete('/fulfillmentsellers/' + id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoading = false;
                    this.initital();
                    this.makeToast('success', 'Saved')
                })
                .catch((error) => {
                    console.log(error)
                    this.isLoading = false;
                    this.makeToast('danger', error)
                });
        }
    },
}
</script>

<style>
.b-container-accountstore {
    /* border-bottom: 1px solid #2d2d2d; */
}
</style>
