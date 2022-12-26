<template>
<b-card no-body>
    <b-card-header class="text-center">
        <h6>{{seller.fullname}}
            <b-link variant="outline-primary" @click="isShowDieStore=!isShowDieStore">
                <b-icon :icon="'eye'"></b-icon>
            </b-link>
            <b-badge variant="success"> Live {{countLive}}</b-badge> <b-badge variant="dark"> Die {{countDie}}</b-badge>
        </h6>
    </b-card-header>
    <b-list-group>
        <b-list-group-item v-for="store in liststores" :key="store.store" v-show="checkShowDieStore(store)" style="display:flex;">
            <div style="width:80%;">
                {{store.status}}
                <b-link :href="platform=='etsy'?'https://www.etsy.com/shop/'+store.store:''" target="_blank">
                    {{store.store}}

                    <the-status-store v-if="platform=='etsy'" :store="store" :updateStatus="updateStatus"></the-status-store>
                </b-link>
            </div>

            <div style="width:20%; text-align:end">
                <b-button @click="removeStore(store.id)" variant="danger" size="sm">X</b-button>
            </div>
        </b-list-group-item>
    </b-list-group>
    <b-input-group v-if="isShowInputStore">
        <b-form-input v-model="storeName" placeholder="Store Name"></b-form-input>
        <b-button variant="primary" @click="addStore">Save</b-button>
    </b-input-group>
    <b-button v-else variant="outline-primary" block @click="isShowInputStore=!isShowInputStore">Add Store</b-button>

    <b-overlay :show="isLoading" no-wrap></b-overlay>
</b-card>
</template>

<script>
import TheStatusStore from './TheStatusStore.vue';
export default {
    components: {
        TheStatusStore
    },
    props: ['seller', 'platform'],
    data() {
        return {
            isShowDieStore: false,
            stores: [],
            isLoading: false,
            storeName: '',
            isShowInputStore: false
        }
    },
    computed: {
        liststores() {
            return this.stores;
        },
        countLive(){
            return Object.values(this.stores).filter(x=>x.status !=='Die').length;
        },
        countDie(){
            return Object.values(this.stores).filter(x=>x.status =='Die').length;
        }

    },
    mounted() {
        this.initital();
    },
    methods: {
        checkShowDieStore(store) {
            if (this.isShowDieStore)
                return true;
            return store.status !== 'Die'
        },
        initital() {
            this.getStores();
        },
        async getStores() {
            this.isLoading = true;
            await this.$axios.get('/accounts/' + this.seller.username + '/stores?platform=' + this.platform, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.stores = response.data;
                    for (let i = 0; i < this.stores.length; i++) {
                        this.stores[i].status = ''
                    }
                    this.isLoading = false;
                    // console.log(this.stores)
                })
                .catch((error) => {
                    // console.log(error)
                    this.isLoading = false;
                });
        },
        async addStore() {
            this.isLoading = true;
            await this.$axios.post('/accounts/' + this.seller.username + '/stores?platform=' + this.platform + '&storename=' + this.storeName.toLowerCase().trim(), {
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
        async updateStatus(store, status) {
            console.log(store)
            for (let i = 0; i < this.stores.length; i++) {
                if (this.stores[i].store == store.store) {

                    this.stores[i].status = status
                    this.$set(this.stores, i, this.stores[i])
                    break;
                }
            }

        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        async removeStore(id) {
            this.isLoading = true;
            await this.$axios.delete('/accounts/' + this.seller.username + '/stores/' + id, {
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
