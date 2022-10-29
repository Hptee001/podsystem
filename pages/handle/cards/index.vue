<template>
<div style="padding:10px; background:white;">

    <b-alert variant="danger" dismissible fade :show="isError" @dismissed="isError=false">
        Error: {{messageError}}
    </b-alert>
    <b-button v-if="!isbulkUpload" @click="isbulkUpload=true">Bulk Uploads</b-button>
    <b-button v-if="!isbulkUpload" @click="reloadData()" variant="success">
        <b-icon icon="arrow-clockwise"></b-icon>
    </b-button>

    <div v-if="!isbulkUpload">

    </div>
    <b-button v-else @click="isbulkUpload=false">Back</b-button>
    <CCard v-if="isbulkUpload">
        <CCardHeader>
            <b-form-file multiple :file-name-formatter="formatNames" @input="inputFiles" v-model="files"></b-form-file>
            <div style="margin:2px;"></div>
            <div v-for="(item,index) in items_upload" :key="index">
                <b-form @submit.prevent="uploadDesign(item)">
                    <b-row class="row-item-upload">
                        <b-col cols="2">
                            <label class="file-name">
                                {{item.file.name}}
                            </label>
                        </b-col>
                        <b-col cols="2">
                            <b-form-select v-model="item.seller" required :options="options_seller">
                                <template #first>
                                    <b-form-select-option :value="null" disabled>-- Please select a Seller --</b-form-select-option>
                                </template>
                            </b-form-select>
                        </b-col>
                        <b-col>
                            <b-button v-if="item.isUpload" variant="outline-primary" @click="editItem(item)">Edit</b-button>
                            <div v-else>
                                <b-spinner v-if="item.isUploading" small label="Uploading"></b-spinner>
                                <div v-else>
                                    <b-button type="submit" variant="outline-success">Upload</b-button>
                                    <b-button @click="removeDesign(item)" variant="outline-danger">X</b-button>
                                </div>

                            </div>

                        </b-col>
                    </b-row>
                </b-form>
            </div>
        </CCardHeader>
    </CCard>
    <div v-else>
        <b-row class="justify-content-md-center" style="padding:10px;">
            <b-col cols="2" style="display:flex; width:300px;" v-show="isShowSeachSeller">
                <label style="padding:5px;">Seller: </label>
                <b-form-select @input="getCards" v-model="searchseller" required :options="options_seller">
                    <template #first>
                        <b-form-select-option value="all">All</b-form-select-option>
                    </template>
                </b-form-select>
            </b-col>
            <b-col cols="2" style="display:flex;width:300px;">
                <label style="padding:5px;">Designer: </label>
                <b-form-select @input="getCards" v-model="searchdesigner" required :options="options_designer">
                    <template #first>
                        <b-form-select-option value="all">All</b-form-select-option>
                    </template>
                </b-form-select>
            </b-col>
            <b-col cols="auto" align-h="center">
                <b-input-group style="width:600px">
                    <b-form-radio-group id="radio-group-1" style="padding:5px" v-model="searchtype" name="radio-options">
                        <b-form-radio value="id">ID</b-form-radio>
                        <b-form-radio value="name" checked="name">Title</b-form-radio>
                    </b-form-radio-group>

                    <b-form-input @keydown.native="enterSearchFrom" v-model="searchvalue" style="width:auto"></b-form-input>
                    <b-input-group-append>
                        <b-button variant="info" @click="getCards">Search</b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-col>
        </b-row>
        <b-row class="justify-content-md-center">
            <b-col>
                <b-pagination style="margin-top:10px;" v-show="totalCards > perPage" v-model="currentPage" @input="onClickPagPage" :total-rows="totalCards" :per-page="perPage" last-number align="center"></b-pagination>
            </b-col>
        </b-row>
        <div v-if="isLoading" class="text-center">
            <b-spinner label="Spinning"></b-spinner>
            <b-spinner type="grow" label="Spinning"></b-spinner>
            <b-spinner variant="primary" label="Spinning"></b-spinner>
            <b-spinner variant="primary" type="grow" label="Spinning"></b-spinner>
            <b-spinner variant="success" label="Spinning"></b-spinner>
            <b-spinner variant="success" type="grow" label="Spinning"></b-spinner>
        </div>

        <b-row v-else class="justify-content-md-center">

            <b-col cols="auto" class="col-card" v-for="item in items" :key="item.id">

                <the-card :editCard="editItem" :updateCard="updateCard" :item.sync="item" :name="item.name" :thumbnail="item.thumbnail" :tags="item.tags" :created_user="item.created_user" :created_at="item.created_at"></the-card>
            </b-col>
        </b-row>

        <b-pagination v-model="currentPage" @input="onClickPagPage" :total-rows="totalCards" :per-page="perPage" last-number align="center"></b-pagination>
    </div>

    <!-- The modal -->

    <b-modal v-model="dialogDelete" @ok="deleteItemConfirm">Do you want delete this Design{{edititem.username}}?!</b-modal>
    <b-modal v-model="dialogDeleteAttachment" @ok="deleteAttachmentConfirm">Do you want delete this file?!</b-modal>
    <b-modal v-model="dialog" @hidden="close" centered ok-title="Close" size="lg" ok-only>
        <!-- <b-spinner v-if="isLoading" type="grow" label="Spinning"></b-spinner> -->

        <b-row>
            <b-col cols="8">
                <label>Date: {{edititem.created_at}}</label><br />
                <label>
                    <b-link @click="copyClipboard(edititem.name)" style="color:black">
                        <b-icon icon="files"> </b-icon> Title
                    </b-link>
                </label>
                <b-form-input v-model="edititem.name"></b-form-input>
                <CInput v-model="edititem.id" label="Sku" readonly />
                <label>
                    <b-icon icon="list-nested"></b-icon>Description:
                </label>
                <b-form-textarea v-model="edititem.description" debounce="500" rows="3" max-rows="20"></b-form-textarea>
                <label>
                    <b-icon icon="paperclip"></b-icon>Attachments
                </label>
                <div v-for="attachment in edit_attachments">
                    <b-row align-v="start">
                        <b-col cols="auto">
                            <img style="background:#d8dbe0" :src="attachment.thumbnail" height="100px" width="100px" />
                        </b-col>
                        <b-col>
                            <span>{{attachment.name}}</span>
                            <br />
                            <h6>{{attachment.type}} - {{attachment.created_user}}</h6>
                            <a :href="attachment.url" target="_blank">View Orginal</a>
                            <b-link @click="deleteAttachment(attachment)" style="color:red">Delete</b-link>
                        </b-col>
                    </b-row>
                </div>
                <b-form @submit.prevent="uploadAttachment">
                    <b-input-group class="mt-3">
                        <b-form-file style="width:auto" v-model="file" :state="Boolean(file)" placeholder="Choose a file" drop-placeholder="Drop file here..." required></b-form-file>
                        <b-form-select v-model="attachment_type" :options="options_design" required style="width:50px">
                        </b-form-select>
                        <b-input-group-append>
                            <b-spinner v-if="isUploadingAttachment" size="sm"></b-spinner>
                            <b-button v-else variant="outline-success" type="submit">Upload</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form>

            </b-col>
            <b-col cols="4">
                <label>
                    Type:
                </label>
                <b-form-select v-model="edititem.type" :options="options_type" placeholder="Select Type" style="margin-bottom:15px;"></b-form-select>
                <label>
                    <b-link @click="copyClipboard(edititem.tags)" style="color:black">
                        <b-icon icon="files"> </b-icon> Tags:
                    </b-link>
                </label>
                <b-form-tags input-id="tags-basic" v-model="edittag"></b-form-tags>
                <label>
                    Seller:
                </label>
                <b-form-select v-model="edititem.seller" :options="options_seller" placeholder="Select Seller" style="margin-bottom:15px;"></b-form-select>
                <label>
                    Designer:
                </label>
                <b-form-select v-model="edititem.designer" :options="options_designer" placeholder="Select Designer" style="margin-bottom:15px;"></b-form-select>
                <b-button @click="save" variant="success" block style="margin-top:10px">Save</b-button>
                <b-button @click="deleteItem" variant="danger" block style="margin-top:10px">Delete</b-button>
            </b-col>
        </b-row>
        <b-overlay :show="isEditLoading" no-wrap></b-overlay>
    </b-modal>
    <b-link @click="scrollToTop">
        <vue-fab style=" right: 3%;" :idx="fabItem.idx" :title="fabItem.title" :icon="fabItem.icon" :color="fabItem.color" :titleColor="fabItem.titleColor" :titleBgColor="fabItem.titleBgColor">

        </vue-fab>
    </b-link>
</div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import VueFab from 'vue-float-action-button'
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
            icon: 'login',
            activeIcon: 'login',
            size: 'normal',
            mainBtnColor: '#E64C3B',
            zIndex: 5,
            fabItem: {
                idx: 1,
                title: 'Go Top',
                icon: 'expand_less',
                color: '#C7D23B',
                titleColor: '#666',
                titleBgColor: '#FFF'
            },
            totalCards: 0,
            perPage: 50,
            currentPage: 1,
            isEditLoading: false,
            isShowSeachSeller: false,
            searchseller: 'all',
            searchdesigner: 'all',
            searchtype: 'name',
            searchvalue: '',
            isShowNextPage: false,
            files: [],
            file: null,
            isbulkUpload: false,
            isUploadingAttachment: false,
            tags: null,
            isShowTable: false,
            isLoading: false,
            isError: false,
            messageError: '',
            dialog: false,
            dialogDelete: false,
            dialogDeleteAttachment: false,
            members: [],
            option_members: [],
            attachment_type: null,
            current_attachment: null,
            options_design: [{
                    value: 'mockup',
                    text: 'Mockup'
                },
                {
                    value: 'design_front',
                    text: 'Design Front'
                },
                {
                    value: 'design_back',
                    text: 'Design Back'
                }
            ],
            options_seller: [],
            options_designer: [],
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
            options_tags: [],
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
            items_upload: [],
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
            },
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
        enterSearchFrom(event) {
            if (event.which === 13) {
                this.getCards();
            }
        },
        scrollToTop() {
            console.log('iok')
            window.scrollTo(0, 0);
        },
        async reloadData() {
            this.searchtype = 'name';
            this.searchvalue = '';
            await this.getCards();
        },

        async copyClipboard(message) {
            await navigator.clipboard.writeText(message);
            this.makeToast('success', 'Copied')
        },
        async downloadImage(url) {
            var base64 = await this.$axios
                .get(url, {
                    responseType: "arraybuffer"
                })
                .then(response =>
                    Buffer.from(response.data, "binary").toString("base64")
                );
            var img = new Image();
            img.src = "data:image/jpeg;base64, " + base64;
            return img;
        },
        async clickCard(id) {
            console.log('ok');
        },

        inputFiles(files) {
            if (files !== null) {
                this.items_upload = []
                for (let i = 0; i < files.length; i++) {
                    let obj = {
                        id: i,
                        seller: '',
                        name: Object.assign(files[i].name),
                        file: Object.assign(files[i]),
                        isUpload: false,
                        isUploading: false
                    }
                    console.log(obj.name)
                    this.items_upload.push(obj);
                }
            }
        },
        removeDesign(item) {
            console.log(item)
            this.items_upload = this.items_upload.filter(x => x.name != item.name);
        },
        uploadDesign(item) {
            item.isUpload = false;
            item.isUploading = true;
            const fd = new FormData();
            fd.append("seller", item.seller);
            fd.append("file", item.file);
            this.$axios.post('/cards/upload', fd, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then((response) => {
                    item.id = response.data.id;
                    item.isUploading = false;
                    item.isUpload = true;
                })
                .catch((error) => {
                    item.isUploading = false
                });
        },
        formatNames(files) {
            return files.length === 1 ? files[0].name : `${files.length} files selected`
        },
        async initialize() {
            this.isLoading = true
            this.isShowSeachSeller = this.$auth.user.role == "seller" ? false : true;
            await this.getCards();
            this.getSellers();
            this.getDesigners();
        },
        async onClickPagPage() {
            await this.getCards();
        },
        async getCards() {
            await this.$axios.get('/cards?page=' + this.currentPage + '&searchtype=' +
                    this.searchtype + '&searchvalue=' + this.searchvalue + '&searchseller=' +
                    this.searchseller + '&searchdesigner=' + this.searchdesigner, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                .then((response) => {
                    this.items = response.data.data
                    this.totalCards = response.data.total_cards;
                    this.perPage = 50;
                    if (this.items.length >= 50) {
                        this.isShowNextPage = true;
                    } else {
                        this.isShowNextPage = false;
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                    this.isLoading = false;
                    console.log(error);
                });
            window.scrollTo(0, 0);
        },
        getSellers() {
            this.isLoading = true
            this.$axios.get('/accounts/sellers', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {

                    this.options_seller = []
                    for (let i = 0; i < response.data.length; i++) {
                        let obj = {
                            value: response.data[i].username,
                            text: response.data[i].fullname,
                        }
                        this.options_seller.push(obj);
                    }
                    console.log(this.options_seller)
                    this.isLoading = false;
                })
                .catch((error) => {
                    console.log(error)
                    this.isLoading = false;
                });
        },
        getDesigners() {
            this.isLoading = true
            this.$axios.get('/accounts/designers', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {

                    this.options_designer = []
                    for (let i = 0; i < response.data.length; i++) {
                        let obj = {
                            value: response.data[i].username,
                            text: response.data[i].fullname,
                        }
                        this.options_designer.push(obj);
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.isLoading = false;
                });
        },

        async add() {
            this.dialog = !this.dialog
            this.editeditem = Object.assign(this.defaultitem);
            this.editeditem.id = 0;
            console.log(this.edititem)
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || 'default'}`,
                variant: variant,
                solid: true
            })
        },
        async save() {
            this.isEditLoading = true
            this.edititem.tags = this.edittag.join();
            if (this.edititem.id < 1) {
                this.edititem.id = 0;
                const json = JSON.stringify(this.edititem);
                await this.$axios.post('/cards', json, {
                        headers: {
                            // Overwrite Axios's automatically set Content-Type
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        console.log(response)
                        this.edititem = this.defaultitem;
                        this.makeToast('success', 'Saved')
                        this.initialize();
                    })
                    .catch(function (error) {
                        this.makeToast('danger', error.message)
                    });
            } else {
                const json = JSON.stringify(this.edititem);
                await this.$axios.put('/cards/' + this.edititem.id, json, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.isEditLoading = false;
                        this.makeToast('success', 'Saved')
                        for (let i = 0; i < this.items.length; i++) {
                            if (this.items[i].id == this.edititem.id) {
                                this.items[i] = null
                                this.items[i] = this.edititem;
                            }
                        }
                        //this.initialize();
                    })
                    .catch((error) => {
                        this.isEditLoading = false;
                        this.makeToast('danger', error.message)
                    });
                this.dialog = false;
            }
            this.isLoading = false;
        },
        async updateCard(item) {
            const json = JSON.stringify(item);
            await this.$axios.put('/cards/' + item.id, json, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    item = response.data
                    this.makeToast('success', 'Saved')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        async uploadAttachment() {
            this.isUploadingAttachment = true;
            const fd = new FormData();
            fd.append("type", this.attachment_type);
            fd.append("file", this.file);
            await this.$axios.post('/cards/' + this.edititem.id + '/attachments/upload', fd, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then((response) => {

                })
                .catch((error) => {

                });
            await this.getAttachments();
            if (this.attachment_type == 'design_front') {
                this.initialize();
            }
            this.file = null;
            this.attachment_type = null;
            this.isUploadingAttachment = false;
        },
        async getAttachments() {
            this.edit_attachments = []
            await this.$axios.get('/cards/' + this.edititem.id + '/attachments', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_attachments = response.data
                })
                .catch(function (error) {

                });
        },
        async editItem(item) {
            this.dialog = true
            this.isEditLoading = true;
            this.editedIndex = this.items.indexOf(item)
            this.edititem = Object.assign({}, item)
            this.getAttachments();
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
                    this.isEditLoading = false;
                })
                .catch(function (error) {
                    this.messageError = error.message;
                    this.isError = true;
                    this.isEditLoading = false;
                    console.log(error);
                });

        },
        deleteItem() {
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
                    this.items = this.items.filter(x => x.id != this.edititem.id);
                    this.dialog = false;
                    this.closeDelete()
                })
                .catch((error) => {
                    this.messageError = error.message;
                    this.isError = true;
                    this.isLoading = false;
                    console.log(error);
                });

        },
        deleteAttachment(attachment) {

            this.dialogDeleteAttachment = true
            this.current_attachment = attachment;
        },
        async deleteAttachmentConfirm() {
            this.isEditLoading = true;
            await this.$axios.delete('/cards/' + this.edititem.id + '/attachments/' + this.current_attachment.id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {})
                .catch(function (error) {

                });
            await this.getAttachments();
            this.dialogDeleteAttachment = false;
            this.isEditLoading = false;
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

.row-item-upload {
    padding: 2px;
}

.file-name {
    padding-top: 12px;
}

.p-3 {
    padding: 0rem !important;
}

.tdactions {
    min-width: 180px;
}

.fab-main-container {
    right: 3%;
}

.custom-select {
    color: black;
}
</style>
