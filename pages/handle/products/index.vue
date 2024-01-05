<template>
<div>
    <div class="sticky-div">
        <b-row align-h="between">
            <b-col cols="1">
                <b-button variant="success" @click="onClickCreateItem">New</b-button>
            </b-col>
            <b-col>
                <b-input-group>
                    <b-form-select v-if="role == 'admin'" style="max-width:150px;" v-model="searchSeller" @input="inputSelectSeller">
                        <b-form-select-option value="all">ALL Sellers</b-form-select-option>
                        <b-form-select-option v-for="seller in options_seller" :key="seller.id" :value="seller.username">{{seller.fullname}}</b-form-select-option>
                    </b-form-select>
                    <b-form-input v-model="searchValue" placeholder="Type to Search"></b-form-input>
                    <b-input-group-append>
                        <b-button variant="success" @click="onClickSearch">Search</b-button>
                        <b-button variant="primary" @click="onClickClear">Clear</b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-col>
            <b-col cols="3">
                <b-input-group>
                    <b-select v-model="template_id">
                        <b-select-option :value="null" disabled>Please select an option</b-select-option>
                        <b-select-option v-for="template in templates" :key="template.id" :value="template.id">{{template.name}}</b-select-option>
                    </b-select>
                    <b-button variant="success" @click="onClickExport">Export</b-button>
                </b-input-group>
            </b-col>
        </b-row>
    </div>

    <CCard>

        <b-table responsive striped hover :items="items" :busy="isTableBusy" :fields="fields">
            <template #table-busy>
                <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
            </template>
            <template #head(selected)="scope">
                <b-checkbox v-model="selectAll" />
            </template>
            <template #cell(selected)="row">
                <b-checkbox v-model="row.item.selected" />
            </template>
            <template #cell(images_src)="row">
                <div style="display:inline-flex;">
                    <img v-for="img in row.item.images_src.split(',')" :src="img" style="max-height: 50px; margin:5px;" @click="viewImage(img)" />
                </div>
            </template>
            <template #cell(actions)="row">
                <b-button variant="outline-primary" size="sm" @click="onClickEditItem(row.item, row.index, $event.target)" class="mr-1">
                    <b-icon-pencil-square></b-icon-pencil-square> Edit
                </b-button>
                <b-button v-if="row.item.handle" variant="outline-success" size="sm" @click="onClickUploadBurgerprints(row.item, row.index, $event.target)" class="mr-1">
                    <b-icon-upload></b-icon-upload> Upload
                </b-button>
                <b-link style="margin-top:10px;" target="_blank" v-if="row.item.product_id" :href="'https://dash.burgerprints.com/admin/products/'+row.item.product_id" class="mr-1">
                    <b-icon-eye></b-icon-eye> View
                </b-link>
                <b-popover triggers="hover" :target="'btn_delete_'+row.item.id" placement="bottom" :popover-style="{background: '#ffffff'}">
                    <b-button :id="'btn_delete_'+row.item.id" variant="outline-danger" size="sm" @click="onDeleteItem(row.item, row.index, $event.target)" class="mr-1">
                        <b-icon-trash></b-icon-trash> Yes
                    </b-button>
                </b-popover>
                <b-button v-if="!row.item.platform" :id="'btn_delete_'+row.item.id" variant="outline-danger" size="sm" class="mr-1">
                    <b-icon-trash></b-icon-trash> Delete
                </b-button>
            </template>
        </b-table>
        <b-pagination v-model="currentPage" :total-rows="totalRecords" :per-page="perPage" last-number align="center"></b-pagination>
    </CCard>
    <b-modal hide-header v-model="modalViewImage" ok-only>
        <div style="text-align:center;  background:#c2c2c2">
            <b-img fluid :src="main_image"></b-img>
        </div>
    </b-modal>
    <b-modal v-model="modalData" ok-only size="lg" centered title="Product Info" hide-footer>
        <div style="text-align:center;  background:#c2c2c2" v-if="selectItem">
            <TheProduct :data_id="selectItem.id" :Ok="handleOk"></TheProduct>
        </div>
    </b-modal>

</div>
</template>

<script>
import TheProduct from "../../../components/TheProduct.vue";
export default {
    components: {
        TheProduct
    },
    data() {
        return {
            role:'',
            searchSeller:'all',
            options_seller:[],
            listUpload: [],
            modalDataClone: false,
            modalViewImage: false,
            main_image: '',
            isTableBusy: false,
            modalData: false,
            isEdit: false,
            selectItem: null,
            searchValue: "",
            items: [],
            currentPage: 1,
            perPage: 10,
            selectAll: false,
            templates: [],
            template_id: null,
            fields: [{
                    label: "",
                    key: "selected",
                },
                {
                    label: "Id",
                    key: "id",
                },
                {
                    label: "Thumbnail",
                    key: "images_src",
                },
                {
                    label: "Title",
                    key: "title",
                },
                {
                    label: "total_sales",
                    key: "total_sales",
                },
                {
                    label: "platform",
                    key: "platform",
                },
                 {
                    label: "User",
                    key: "created_user",
                },
                {
                    label: "created_at",
                    key: "created_at",
                },

                {
                    label: "Actions",
                    key: "actions",
                    tdClass: "tdactions",
                },
            ],
        };
    },
    computed: {
        listItems() {
            return this.items;
        },
        listTemplates() {
            return this.templates;
        },
        isBusy() {
            return this.$store.state.product.isBusy;
        },
        pageSizeOptions() {
            return ["5", "10", "20", "30", "40", "50"];
        },
        totalRecords() {
            return this.$store.state.product.pagination.total;
        },

    },
    watch: {
        selectAll() {
            if (this.items)
                this.items.forEach(item => {
                    item.selected = this.selectAll
                })
        },

        currentPage(page) {
            this.onLoadData();
        },
        perPage(value) {
            this.onLoadData();
        },
    },
    async mounted() {
        await this.onLoadData();
        await this.onloadTemplates();
        this.role = this.$auth.user.role.toLowerCase();
        if(this.role == 'admin'){
            this.getSellers();
        }
    },
    methods: {
         async getSellers() {
            await this.$axios
                .get("/accounts/sellers", {
                    headers: {
                        Authorization: this.$auth.getToken("local"),
                        "Content-Type": "application/json",
                    },
                })
                .then(async (response) => {
                    this.options_seller = response.data;
                    if (this.$auth.user.role == 'fulfillment') {
                        let result = await this.$store.dispatch('fulfillmentseller/Index', {
                            page: 1,
                            limit: 100
                        });
                        this.options_seller = this.options_seller.filter(x => result.findIndex(s => s.seller == x.username) >= 0)
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        inputSelectSeller(){
            this.onLoadData();
        },
        viewImage(image_src) {
            this.main_image = image_src
            this.modalViewImage = true
        },
        async onLoadData() {
            this.isTableBusy = true;
            this.items = await this.$store.dispatch("product/GetList", {
                page: this.currentPage,
                limit: this.perPage,
                searchValue: this.searchValue,
                searchSeller: this.searchSeller,
            });
            this.items = this.items.map((item) => ({
                ...item,
                selected: false
            }));
            this.isTableBusy = false;
            console.log(this.$store.state.product.isBusy);
        },
        async onClickSearch() {
            this.onLoadData();
        },
        async onClickClear() {
            this.searchValue = "";
            this.currentPage = 1;
            this.onLoadData();
        },
        async onloadTemplates() {
            this.templates = await this.$store.dispatch("tiktoktemplate/GetList", {
                page: 1,
                limit: 100,
            });

            console.log(this.templates)
        },
        checkListUpload(id) {
            console.log(this.listUpload.includes(id))
            return this.listUpload.includes(id);
        },
        onClickCreateItem() {
            this.selectItem = {
                id: 0,
            };
            this.isEdit = false;
            this.modalData = true;
        },
        onClickEditItem(item) {
            this.selectItem = item;
            this.isEdit = true;
            this.modalData = true;
        },
        onClickUploadBurgerprints(item) {
            this.selectItem = item;
            this.isEdit = true;
            this.modalData = true;
        },
        async handleOk(item) {

            if (this.isEdit) {
                await this.$store.dispatch("product/Update", {
                    id: item.id,
                    data: item,
                });
            } else {
                await this.$store.dispatch("product/Create", {
                    data: item,
                });
            }
            this.modalData = false;
            this.onLoadData();
        },
        handleCancel() {
            this.modalData = false;
        },
        onDeleteItem(item) {
            console.log(item);
        },
        onClickExport() {
            if (this.template_id) {
                let products = this.items.filter(x => x.selected);
                let product_ids = products.map(x => x.id).join(',');
                window.open(
                    this.$axios.defaults.baseURL + 'products/templates/' + this.template_id + '?product_ids=' + product_ids,
                    '_blank' // <- This is what makes it open in a new window.
                );
            }
        },
        async onClickPagPage() {
            await this.onLoadData();
        },
        async onClickDelete(item) {
            console.log(item);
            await this.$store.dispatch("product/Delete", {
                id: item.id,
            });
            this.onLoadData();
        },
    },
};
</script>

<style scoped>
</style>
