<template>
<div v-if="data">
    <b-overlay :show="isBusy" rounded="sm">
        <b-container style="background:white;">
            <b-row>
                <b-col>
                    <b-input-group>
                        <b-input v-model="link_etsy" placeholder="Etsy Link"></b-input>
                        <b-button variant="primary" @click="GetInfoFromEtsyLink()">Get Info</b-button>
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="1">
                    <label>Name</label>
                </b-col>
                <b-col>
                    <b-input v-model="data.title" placeholder="product name"></b-input>
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="1">
                    <label>Handle</label>
                </b-col>
                <b-col>
                    <b-input v-model="data.handle" placeholder="product handle"></b-input>
                </b-col>
            </b-row>
            <b-row style="margin-top:10px;">
                <b-col cols="1">
                    <label>Images</label>
                </b-col>
                <b-col style="text-align: left; display:inline-flex;">
                    <b-row>
                        <b-card no-body v-for="img in images" :key="img" style="display:flex;position: relative; margin:5px;">
                            <div>
                                <b-img style="margin-left:5px;" :src="img" height="100" width="100"></b-img>
                            </div>
                            <div style="border-radius: 5px; border: 1px solid;border-color: #cdcdcd; position: absolute;top: 0;right:0; background:white;">
                                <b-link @click="DeleteImage(img)">
                                    <b-icon icon="x" variant="danger"></b-icon>
                                </b-link>

                            </div>
                        </b-card>
                        <b-card no-bodyclass="custom-box-upload">
                            <b-spinner v-if="isUploading"></b-spinner>
                            <b-icon v-else icon="plus" style="width: 100%; height: 100%; padding:0px; top:25%;" class="border rounded p-2" @click="clickUploadFile()"></b-icon>
                        </b-card no-body>
                    </b-row>
                    <div>

                    </div>

                    <b-form-file id="fuploadfile" multiple v-model="files" style="display:none;" accept="image/*" class="mt-3" plain @input="uploadFile()"></b-form-file>
                </b-col>
            </b-row>
            <b-row align-h="end" style="margin-top:10px;">
                <b-col v-if="data.handle && data.id > 0">
                    <b-input-group>
                        <label style="margin-top:10px; margin-right:5px;">Product Clone ID : </label>
                        <b-input v-model="product_id_clone" placeholder="Product ID Clone Burgerpints"></b-input>
                        <b-button variant="outline-success" size="sm" @click="onClickUploadBurgerprints()" class="mr-1">
                            <b-icon-upload></b-icon-upload> Upload Bugerprints
                            <b-spinner v-if="isUploadingBurgerprints" style=" width: 15px; height: 15px;"></b-spinner>
                        </b-button>
                        <b-link style="margin-top:10px;" target="_blank" v-if="data.product_id" :href="'https://dash.burgerprints.com/admin/products/'+data.product_id">View Product</b-link>
                    </b-input-group>

                </b-col>
                <b-col style="text-align: end;" cols="2">
                    <b-button variant="info" @click="Ok(data)">Save</b-button>
                </b-col>
            </b-row>
        </b-container>
    </b-overlay>

</div>
</template>

<script>
export default {
    props: ["data_id", "Ok", "Delete"],
    data() {
        return {
            files: null,
            data: null,
            isUploading: false,
            isUploadingBurgerprints: false,
            product_id_clone: 'A20957-549',
            link_etsy: '',
        };
    },
    mounted() {
        this.loadData();
    },
    computed: {
        isBusy() {
            return this.$store.state.product.isBusy;
        },
        images() {
            if (this.data.images_src == '') {
                return [];
            }
            return this.data.images_src.split(",");
        },
    },
    methods: {
        async uploadFile() {
            console.log(this.files);
            this.isUploading = true;
            for (let i = 0; i < this.files.length; i++) {
                let formData = new FormData();
                formData.append('file', this.files[i]);
                formData.append('name', this.files[i].name);
                await this.$axios.post('/files/s3upload',
                        formData, {
                            headers: {
                                Authorization: this.$auth.getToken('local'),
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    ).then((response) => {
                        console.log(response.data);
                        let images = this.data.images_src.split(',');
                        images.push(response.data);
                        this.data.images_src = images.filter(x => x != '').join(',');
                    })
                    .catch((error) => {});
            }
            this.isUploading = false;
        },
        clickUploadFile() {
            document.getElementById("fuploadfile").click();
        },
        DeleteImage(img) {
            let images = this.data.images_src.split(',');
            images = images.filter(x => x != img);
            if (images.length == 0) {
                this.data.images_src = '';
            } else
                this.data.images_src = images.join(',');
        },
        async GetInfoFromEtsyLink() {
            this.data = await this.$store.dispatch("product/GetInfoFromEtsy", {
                url: this.link_etsy,
            });
        },
        async onClickUploadBurgerprints(item) {
            try {
                this.isUploadingBurgerprints = true;
                await this.$store.dispatch("product/Update", {
                    id: this.data.id,
                    data: this.data,
                });

                await this.$store.dispatch("product/UploadProductBurgerprints", {
                    product_id: this.data.id,
                    product_id_clone: this.product_id_clone,
                    handle: this.data.handle,
                });
            } catch {

            }
            this.isUploadingBurgerprints = false;
            this.loadData();
        },
        async loadData() {
            if (this.data_id > 0) {
                this.data = await this.$store.dispatch("product/Detail", {
                    id: this.data_id,
                });
                if(this.data.product_id){
                    this.product_id_clone = this.data.product_id;
                }
            } else {
                this.data = {
                    title: "",
                    images_src: "",
                };
            }
        },
    },
};
</script>

<style>
.custom-box-upload {
    width: 100px;
    height: 100px;
    margin-left: 5px;
}
</style>
