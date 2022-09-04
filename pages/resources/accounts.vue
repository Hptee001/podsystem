<template>
<div>
    <!-- Alert -->
    <b-alert variant="danger" dismissible fade :show="isError" @dismissed="isError=false">
        Error: {{messageError}}
    </b-alert>
    <div v-if="isLoading" class="text-center">
        <b-spinner label="Spinning"></b-spinner>
        <b-spinner type="grow" label="Spinning"></b-spinner>
        <b-spinner variant="primary" label="Spinning"></b-spinner>
        <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner>
        <b-spinner variant="success" label="Spinning"></b-spinner>
        <b-spinner variant="success" type="grow" label="Spinning"></b-spinner>
    </div>
    <CCard>
        <CCardHeader>
            <b-row style="margin:0px;">
                 <b-col cols="auto" class="p-3" style="padding:0px;margin:0px;">
                    <b-button variant="success" @click="add()">Add Account</b-button>
                </b-col>
                <b-col cols="auto" class="mr-auto p-3"></b-col>
            </b-row>
        </CCardHeader>
        <b-table responsive striped hover :items="items" :fields="fields">
            <template #cell(actions)="row">
                <b-button variant="outline-primary" size="sm" @click="editItem(row.item, row.index, $event.target)" class="mr-1">
                    <b-icon-pencil-square></b-icon-pencil-square> Edit
                </b-button>
                <b-button variant="outline-danger" size="sm" @click="deleteItem(row.item, row.index, $event.target)" class="mr-1">
                    <b-icon-trash></b-icon-trash> Delete
                </b-button>
            </template>
        </b-table>
    </CCard>

    <!-- The modal -->

    <b-modal v-model="dialogDelete" @ok="deleteItemConfirm">Do you want delete this account{{edititem.username}}?!</b-modal>
    <b-modal v-model="dialog" @hidden="close" @ok="save" centered title="Account">
        <b-spinner v-if="isLoading" type="grow" label="Spinning"></b-spinner>

        <CInput v-model="edititem.fullname" label="Full Name" placeholder="Catherin R" />
        <CInput v-model="edititem.username" label="User name" placeholder="catherin01" :readonly="edititem.id>0" />
        <CInput v-model="edititem.password" label="Password" placeholder="Password" />
        <CSelect :value.sync="edititem.role" label="Role" :options="options_roles" placeholder="Select Option" />
        <CRow>
            <CCol>
                Status: <b>{{ edititem.status }}</b>
                <b-form-checkbox v-model="edititem.status" size="lg" value="active" unchecked-value="deactive" name="check-button" switch>
                </b-form-checkbox>
            </CCol>
            <CCol>
            </CCol>
        </CRow>
    </b-modal>
</div>
</template>

<script>
export default {
    data() {
        return {
            isLoading: false,
            isError: false,
            messageError: '',
            dialog: false,
            dialogDelete: false,
            members: [],
            option_members: [],
            options_roles: [{
                    value: 'admin',
                    lablel: 'Admin'
                },
                {
                    value: 'seller',
                    lablel: 'Seller'
                },
                 {
                    value: 'designer',
                    lablel: 'Designer'
                },
                {
                    value: 'fulfillment',
                    lablel: 'Fulfillment'
                },
            ],
            fields: [{
                    label: 'Id',
                    key: 'id'
                },
                {
                    label: 'Username',
                    key: 'username'
                },
                {
                    label: 'Fullname',
                    key: 'fullname'
                },
                {
                    label: 'Status',
                    key: 'status'
                },
                {
                    label: 'Role',
                    key: 'role'
                },
                {
                    label: 'Actions',
                    key: 'actions',
                    tdClass: 'tdactions'
                }
            ],
            items: [],
            editedIndex: -1,
            defaultitem: {
                id: -1,
                username: "",
                fullname: "",
                password: "",
                status: "active",
                role: "",
            },
            edititem: {
                id: -1,
                username: "",
                fullname: "",
                password: "",
                status: "active",
                role: ""
            }
        }
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'New Account' : 'Edit Account'
        },

    },
    watch: {
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
    },
    mounted() {
        this.initialize();
    },
    methods: {

        initialize() {
            this.isLoading = true
            this.$axios.get('/accounts', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.items = response.data
                    this.isLoading = false;
                })
                .catch(function (error) {
                    this.messageError = error.message;
                    this.isError = true;
                    console.log(error);
                });
        },
        async add() {
            this.dialog = !this.dialog
            this.editeditem = Object.assign(this.defaultitem);
            this.editeditem.id = 0;
            console.log(this.edititem)
        },
        async save(bvModalEvt) {
            this.isLoading = true
            console.log(this.edititem.sellers)
            console.log(this.edititem);
            if (this.edititem.id < 1) {
                this.edititem.id = 0;
                const json = JSON.stringify(this.edititem);
                this.$axios.post('/accounts', json, {
                        headers: {
                            // Overwrite Axios's automatically set Content-Type
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        console.log(response)
                        this.edititem = this.defaultitem;
                        this.dialog = false;
                        this.initialize();
                        //this.$router.go()
                    })
                    .catch(function (error) {
                        this.messageError = error.message;
                        this.isError = true;
                        this.isLoading = false;
                        console.log(error);
                    });
            } else {
                const json = JSON.stringify(this.edititem);
                this.$axios.put('/accounts/' + this.edititem.id, json, {
                        headers: {
                            // Overwrite Axios's automatically set Content-Type
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        console.log(response.data)
                        this.dialog = false;
                        this.initialize();
                        //this.$router.go()
                    })
                    .catch(function (error) {
                        this.messageError = error.message;
                        this.isError = true;
                        this.isLoading = false;
                        console.log(error);
                    });
            }
        },
        async editItem(item) {
            this.isLoading = true;
            this.editedIndex = this.items.indexOf(item)
            this.edititem = Object.assign({}, item)

            await this.$axios.get('/accounts/' + item.id, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    console.log(response.data)
                    this.edititem = response.data
                    console.log(this.item)
                    this.isLoading = false;
                    //this.$router.go()
                })
                .catch(function (error) {
                    this.messageError = error.message;
                    this.isError = true;
                    this.isLoading = false;
                    console.log(error);
                });

            this.dialog = true
        },
        deleteItem(item) {
            this.editedIndex = this.items.indexOf(item)
            this.edititem = Object.assign({}, item)
            this.dialogDelete = true
        },
        deleteItemConfirm() {
            this.$axios.delete('/accounts/' + this.edititem.id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    console.log(response.data)
                    this.initialize();
                    this.closeDelete()
                })
                .catch(function (error) {
                    this.messageError = error.message;
                    this.isError = true;
                    this.isLoading = false;
                    console.log(error);
                });

        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.edititem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeDelete() {
            this.dialogDelete = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
    },
}
</script>

<style>
.form-control {
    color: black;
}

.form-control:focus {
    color: black;
}

.p-3 {
    padding: 0rem !important;
}

.tdactions {
    min-width: 180px;
}
</style>
