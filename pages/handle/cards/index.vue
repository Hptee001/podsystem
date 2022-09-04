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
    <CCard v-if="isbulkUpload">
        <CCardHeader>
            <b-form-file multiple :file-name-formatter="formatNames" v-model="files"></b-form-file>
            <div v-for="file in files" :key="file.name">
                {{file.name}}
            </div>
        </CCardHeader>
    </CCard>
    <CCard v-else>
        <CCardHeader>
            <b-row style="margin:0px;">
                <b-col cols="auto" class="p-3" style="padding:0px;margin:0px;">
                    <b-button variant="success" @click="add()">Add Card</b-button>
                </b-col>
                <b-col cols="auto" class="mr-auto p-3"></b-col>
            </b-row>
        </CCardHeader>
        <b-row>
            <b-col class="col-card" v-for="item in items" :key="item.id" @click="editItem(item)">
                <the-card :name="item.name" :tags="item.tags" :created_user="item.created_user" :created_at="item.created_at"></the-card>
            </b-col>
        </b-row>
        <b-table v-if="isShowTable" responsive striped hover :items="items" :fields="fields">
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
    <b-modal v-model="dialog" @hidden="close" @ok="save" centered cancel-title="Close" size="lg">
        <b-spinner v-if="isLoading" type="grow" label="Spinning"></b-spinner>
        <b-row>
            <b-col cols="8">
                <CInput v-model="edititem.name" label="Title" />
                <CInput v-model="edititem.sku" label="Sku" />
                <label>
                    <b-icon icon="list-nested"></b-icon>Description:
                </label>
                <b-form-textarea v-model="edititem.description" debounce="500" rows="3" max-rows="20"></b-form-textarea>
                <label>
                    <b-icon icon="paperclip"></b-icon>Attachments
                </label>
                <b-list-group>
                    <b-list-group-item v-for="attachment in edit_attachments" :key="attachment.id">
                        <b-row align-v="start">
                            <b-col cols="auto">
                                <img :src="attachment.url" height="100px" width="100px" />
                            </b-col>
                            <b-col>
                                <label>{{attachment.name}}</label>
                                <h6>{{attachment.created_user}}</h6>
                                <small>{{attachment.created_at}}</small>
                            </b-col>
                        </b-row>
                    </b-list-group-item>
                </b-list-group>
                <div>
                    <b-form-file v-model="file" ref="file-input" class="mb-2"></b-form-file>
                </div>

            </b-col>
            <b-col cols="4">
                <label>
                    Type:
                </label>
                <b-form-select v-model="edititem.type" :options="options_type" placeholder="Select Type" style="margin-bottom:15px;"></b-form-select>

                <label>
                    Tags:
                </label>
                <b-form-tags input-id="tags-basic" v-model="edittag"></b-form-tags>
            </b-col>
        </b-row>

    </b-modal>
</div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import TheCard from '../../../components/TheCard.vue'
const defaultSortCompare = (a, b, sortBy) => {
    return toString(a[sortBy]).localeCompare(toString(b[sortBy]), undefined, {
        numeric: true
    });
};
export default {
    components: {
        TheCard
    },
    data() {
        return {
            files: [],
            file:null,
            isbulkUpload: true,
            tags: null,
            isShowTable: false,
            isLoading: false,
            isError: false,
            messageError: '',
            dialog: false,
            dialogDelete: false,
            members: [],
            option_members: [],
            options_type: [{
                    value: 'clone',
                    text: 'Clone'
                },
                {
                    value: 'redesign',
                    text: 'Redesign'
                },
            ],
            edit_attachments: [{
                    id: 1,
                    name: 'design.png',
                    url: 'https://80steess3.imgix.net/production/products/DNGN249/1974-dungeons-dragons-t-shirt.master.png',
                    created_at: '2022-09-03T19:22:33',
                    created_user: 'phuong_designer',
                },
                {
                    id: 2,
                    name: 'mockup.png',
                    url: 'https://80steess3.imgix.net/production/products/DNGN249/1974-dungeons-dragons-t-shirt.master.png',
                    created_at: '2022-09-03T19:22:33',
                    created_user: 'phuong_designer',
                }
            ],
            options_tags: [{
                    'id': 'dog',
                    'label': 'dog'
                },
                {
                    'id': 'meo',
                    'label': 'meo'
                },
                {
                    'id': 'cat',
                    'label': 'cat'
                }
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
                name: "",
                sku: "",
                description: "",
                type: "active",
                tags: "",
                tags_array: "",
            },
            edittag: [],
            edititem: {
                id: -1,
                name: "",
                sku: "",
                description: "",
                type: "active",
                tags: "",
                tags_array: "",
            }
        }
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'New Card' : 'Edit Card'
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
        clickCard(id) {
            console.log(id);
        },
        formatNames(files) {
            return files.length === 1 ? files[0].name : `${files.length} files selected`
        },
        initialize() {
            this.isLoading = true
            this.$axios.get('/cards', {
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
            this.edititem.tags = this.edittag.join();
            if (this.edititem.id < 1) {
                this.edititem.id = 0;
                const json = JSON.stringify(this.edititem);
                this.$axios.post('/cards', json, {
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
                    })
                    .catch(function (error) {
                        this.messageError = error.message;
                        this.isError = true;
                        this.isLoading = false;
                        console.log(error);
                    });
            } else {
                const json = JSON.stringify(this.edititem);
                this.$axios.put('/cards/' + this.edititem.id, json, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        console.log(response.data)
                        this.dialog = false;
                        this.initialize();
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

            await this.$axios.get('/cards/' + item.id, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    console.log(response.data)
                    this.edititem = response.data
                    this.edittag = this.edititem.tags.split(',')
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
            this.$axios.delete('/cards/' + this.edititem.id, {
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

.col-card {
    min-width: 300px;
    max-width: 300px;
}
</style>
