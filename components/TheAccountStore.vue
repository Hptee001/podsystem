<template>
<b-card no-body>
    <b-card-header class="text-center">
        <h6>{{seller.fullname}}</h6>
    </b-card-header>
    <b-list-group>
        <b-list-group-item v-for="store in stores" :key="store.store" style="display:flex;">
            {{store.store}}
            <div style="width:90%; text-align:end">
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
export default {
    props: ['seller'],
    data() {
        return {
            stores: [],
            isLoading: false,
            storeName: '',
            isShowInputStore: false
        }
    },
    mounted() {
        this.initital();
    },
    methods: {
        initital() {
            this.getStores();
        },
        async getStores() {
            this.isLoading = true;
            await this.$axios.get('/accounts/' + this.seller.username + '/stores', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.stores = response.data;
                    this.isLoading = false;
                    console.log(this.stores)
                })
                .catch((error) => {
                    console.log(error)
                    this.isLoading = false;
                });
        },
        async addStore() {
            this.isLoading = true;
            await this.$axios.post('/accounts/' + this.seller.username + '/stores?storename=' + this.storeName.toLowerCase().trim(), {
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
            this.isShowInputStore = false;
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
