<template>
<b-container fluid>
    <b-row align-v="start">
        <b-col cols="auto">
            <b-button @click="createTemplate" block variant="primary">Create Template</b-button>
            <b-list-group style="position:relative; height:700px; overflow-y:scroll;">
                <b-list-group-item :style="selectItemAcitve(item)" v-for="item in list_templates" :key="item.id">
                    <b-link @click="initTemplate(item)">{{item.id}} | {{item.name}}</b-link>
                </b-list-group-item>
            </b-list-group>
        </b-col>
        <b-col v-show="edit_template">
            <div id="editor" class="panel-paint" :style="'transform-origin: top center;transform: scale('+stageSize.scale+');'">
                <v-stage ref="stageArea" :config="stageSize.front" @mousedown="handleStageMouseDown" @mouseup="handleStageMouseUp">
                    <v-layer ref="layer">
                        <v-group ref="imageGroup">
                            <div v-for="item in Object.values(v_objects)" :key="item.name">
                                <v-image v-if="item.type=='image'" :config="item" @transformend="handleTransformEnd" />
                            </div>
                        </v-group>
                        <v-transformer ref="transformer" />
                    </v-layer>
                </v-stage>
                <b-overlay :show="isLoadImage" opacity="0.4" no-wrap></b-overlay>
            </div>

        </b-col>
        <b-col cols="auto" v-if="edit_template">
            <b-card>
                <b-input-group>
                    <b-button @click="copyClipboard(edit_template.id)" variant="info">{{edit_template.id}}</b-button>
                    <b-input v-model="edit_template.name"></b-input>
                    <b-button variant="primary" @click="saveTemplate">Save</b-button>

                </b-input-group>
                <b-input-group prepend="SIZE">
                    <b-input type="number" v-model="stageSize.front.width" @input="scaleSize"></b-input>
                    <b-input type="number" v-model="stageSize.front.height" @input="scaleSize"></b-input>
                </b-input-group>
                <b-radio-group v-model="position">
                    <b-radio value="front">Front</b-radio>
                    <b-radio value="back">Back</b-radio>
                </b-radio-group>
                <b-input-group prepend="Zoom">
                    <b-input type="range" v-model="stageSize.scale" min="0" max="1" step="0.05"></b-input>
                </b-input-group>

                <b-row v-for="item in Object.values(v_objects)" :key="item.name">
                    <b-col v-if="item.position==position">
                        <label style="text-transform: uppercase;">{{item.name}}</label>
                        <b-input-group prepend="Url" v-if="item.type=='image' && item.image">
                            <b-input type="text" v-model="item.image.src" @input="updateImage(item)"></b-input>
                        </b-input-group>
                        <b-form-file v-model="fileUpload" @input="uploadFile(item)" placeholder="Choose a file or drop it here..." drop-placeholder="Drop file here..."></b-form-file>
                        <b-input-group prepend="X/Y">
                            <b-input type="number" v-model="item.x"></b-input>
                            <b-input type="number" v-model="item.y"></b-input>
                        </b-input-group>
                        <!-- <b-input-group prepend="Width/Height">
                            <b-input type="number" v-model="item.width"></b-input>
                            <b-input type="number" v-model="item.height"></b-input>
                        </b-input-group>
                        <b-input-group prepend="Scale X/Y">
                            <b-input type="number" v-model="item.scaleX"></b-input>
                            <b-input type="number" v-model="item.scaleY"></b-input>
                        </b-input-group> -->
                        <b-input-group prepend="Rotation">
                            <b-input type="number" v-model="item.rotation"></b-input>
                        </b-input-group>
                    </b-col>

                </b-row>
                <b-button variant="danger" style="margin-top:10px" block v-if="!isDialogDeleteTemplate" @click="isDialogDeleteTemplate=!isDialogDeleteTemplate">Delete Template</b-button>
                <b-button-group style="margin-top:10px; width:100%" v-else>
                    <b-button @click="deleteTemplate" variant="primary">Yes</b-button>
                    <b-button @click="isDialogDeleteTemplate=!isDialogDeleteTemplate" variant="dark">No</b-button>
                </b-button-group>
                <b-overlay :show="isLoadImage" opacity="0.4" no-wrap></b-overlay>
            </b-card>
        </b-col>

    </b-row>
    <b-overlay :show="isLoading" opacity="0.4" no-wrap></b-overlay>
</b-container>
</template>

<script>
import Konva from 'konva';
const width = window.innerWidth;
const height = window.innerHeight;

export default {
    data() {
        return {
            isDialogDeleteTemplate: false,
            isFront: true,
            imageProps: [],
            isLoadImage: false,
            isUploadImage: false,
            images: {},
            fileUpload: null,
            position: 'front',
            selectedNode: null,
            transformer: null,
            stageArea: null,
            list_templates: [],
            isLoading: false,
            edit_template: null,
            stageSize: {
                scale: 0.3,
                front: {
                    width: 2000,
                    height: 2000,
                    scale: 1,
                },
                back: {
                    width: 2000,
                    height: 2000,
                    scale: 1,
                }
            },
            v_objects: [],
            v_objectsfront: [],
            v_objectsback: [],
            count_load_image: 0,
        };
    },
    watch: {
        imageProps() {
            //this.registerImages();
        },

        position() {
            if (this.position == 'front') {
                this.v_objects = []
                this.v_objects = this.v_objectsfront;
            } else {
                this.v_objects = []
                this.v_objects = this.v_objectsback;

            }
            this.selectedNode = null;
            this.selectedImageName = '';
            this.updateTransformer();

        }
    },
    mounted() {
        this.getTemplates();
    },
    methods: {
        deleteTemplate() {
            this.isLoading = true;
            this.$axios.delete('/templates/' + this.edit_template.id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoading = false
                    this.makeToast('success', 'Delete Success')
                    this.isDialogDeleteTemplate = false;
                    location.reload();
                })
                .catch((error) => {
                     this.isLoading = false
                    this.makeToast('danger', 'Delete Failed! Try Again')
                });
                
        },
        selectItemAcitve(item) {
            return (this.edit_template != null && this.edit_template.id == item.id) ? 'background:#2d2d2d' : ''
        },
        async copyClipboard(message) {
            await navigator.clipboard.writeText(message);
            this.makeToast('success', 'Copied')
        },
        async scaleSize() {
            for (let i = 0; i < this.v_objectsfront.length; i++) {
                if (this.v_objectsfront[i].name == 'backgroundfront') {
                    this.v_objectsfront[i].scaleX = this.stageSize.front.width / 2000
                    this.v_objectsfront[i].scaleY = this.stageSize.front.height / 2000
                }
            }
            for (let i = 0; i < this.v_objectsback.length; i++) {
                if (this.v_objectsback[i].name == 'backgroundback') {
                    this.v_objectsback[i].scaleX = this.stageSize.front.width / 2000
                    this.v_objectsback[i].scaleY = this.stageSize.front.height / 2000

                }
            }
        },
        async createTemplate() {
            this.isLoading = true;
            this.edit_template = {
                id: 0,
                name: 'New Template',
                width: 2000,
                height: 2000
            }
            this.stageSize.front = {
                width: 2000,
                height: 2000
            }
            this.transformer = this.$refs.transformer.getStage();
            this.stageArea = this.$refs.stageArea.getStage();
            this.v_objects = []
            this.v_objectsfront = []
            this.v_objectsback = []
            this.setupFrontConfig();
            this.setupBackConfig();
            this.v_objects = this.v_objectsfront;
            await this.saveTemplate();
            this.getTemplates();

            this.isLoading = false;

        },
        async checkLoadingImage() {
            let stage = this.$refs.stageArea.getStage();
            console.log(stage.children)
            this.isLoadImage = true;
            while (this.count_load_image > 0) {
                await this.delay(1)
            }
            this.isLoadImage = false;
        },
        initTemplate(template) {

            this.isLoading = true;
            this.isLoadImage = true;

            this.stageSize.front.width = template.width;
            this.stageSize.front.height = template.height;
            this.edit_template = template;
            this.$axios.get('/templates/' + template.id + '/items', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.transformer = this.$refs.transformer.getStage();
                    this.stageArea = this.$refs.stageArea.getStage();
                    this.v_objects = []
                    this.v_objectsfront = []
                    this.v_objectsback = []
                    this.v_objectsfront = response.data.filter(x => x.position == 'front')
                    this.v_objectsback = response.data.filter(x => x.position == 'back')

                    this.setupFrontConfig();
                    this.setupBackConfig();
                    this.selectedNode = null;
                    this.selectedImageName = '';
                    this.updateTransformer();

                    this.isLoading = false;
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                    this.isLoading = false;
                });
            this.isLoadImage = false;
        },
        async getTemplates() {
            this.$axios.get('/templates', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.list_templates = response.data.data;
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        async saveTemplate() {
            this.isLoading = true;
            this.edit_template.width = this.stageSize.front.width;
            this.edit_template.height = this.stageSize.front.height;
            const json = JSON.stringify(this.edit_template);

            await this.$axios.post('/templates', json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {

                    this.edit_template = response.data;
                    this.makeToast('success', 'Created Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.saveTemplateItem(this.v_objectsfront);
            this.saveTemplateItem(this.v_objectsback);
            this.isLoading = false;
        },
        async saveTemplateItem(items) {
            this.isLoading = true;
            const json = JSON.stringify(Object.values(items));
            this.$axios.post('/templates/' + this.edit_template.id + '/items', json, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    for (let i = 0; i < items.length; i++) {
                        items[i].id = response.data[i].id;
                    }
                    this.makeToast('success', 'Save Item Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        updateImage(item) {
            this.isLoadImage = true;
            let index = Object.values(this.v_objects).findIndex(x => x.name == item.name);

            //this.$set(this.v_objects, index, null);
            let img = new Image();
            img.src = item.image.src;
            item.image = img;
            img.onload = () => {
                if (img.complete) {
                    this.isLoadImage = false
                }
            };
            this.$set(this.v_objects, index, item);
            this.$forceUpdate();
        },
        fullSize(item) {
            item.width = this.stageSize.width;
            item.height = this.stageSize.height;
        },
        activeObject(item) {
            let name = item.name;
            const rect = Object.values(this.v_objects).find(r => r.name === name);
            if (rect) {
                this.selectedImageName = name;
                const transformerNode = this.$refs.transformer.getStage();
                const stage = transformerNode.getStage();
                const selectedNode = stage.findOne("." + name);
                this.selectedNode = selectedNode
                // this.selectedNode.moveToTop();
            }
            this.updateTransformer();
        },
        handleTransformEnd(e) {

            const rect = Object.values(this.v_objects).find(
                (r) => r.name === this.selectedImageName
            );

            if (rect) {

                rect.x = e.target.x();
                rect.y = e.target.y();
                rect.rotation = e.target.rotation();
                rect.scaleX = e.target.scaleX();
                rect.scaleY = e.target.scaleY();

            }
        },
        handleStageMouseUp(e) {
            const name = e.target.name();
            const rect = Object.values(this.v_objects).find(r => r.name === name);

            if (rect) {
                rect.x = e.target.x();
                rect.y = e.target.y();
                rect.rotation = e.target.rotation();
                rect.scaleX = e.target.scaleX();
                rect.scaleY = e.target.scaleY();
                rect.width = e.target.width();
                // rect.width = e.target.width() * e.target.scaleX();
                // rect.height = e.target.height() * e.target.scaleY();
            }
        },

        handleStageMouseDown(e) {
            if (e.target === e.target.getStage()) {

                this.selectedImageName = "";
                this.selectedNode = null;
                this.updateTransformer();
                return;
            }
            const clickedOnTransformer =
                e.target.getParent().className === "Transformer";

            if (clickedOnTransformer) {
                return;
            }
            // find clicked rect by its name
            const name = e.target.name();
            const rect = Object.values(this.v_objects).find(r => r.name === name);
            if (rect) {
                rect.x = e.target.x();
                rect.y = e.target.y();
                rect.rotation = e.target.rotation();
                rect.scaleX = e.target.scaleX();
                rect.scaleY = e.target.scaleY();
                this.selectedImageName = name;
                const transformerNode = this.$refs.transformer.getStage();
                const stage = transformerNode.getStage();
                const selectedNode = stage.findOne("." + name);
                this.selectedNode = selectedNode
                // this.selectedNode.moveToTop();
            }
            this.updateTransformer();
        },
        updateTransformer() {
            const transformerNode = this.transformer;
            if (this.cropMode) {
                transformerNode.detach();
            } else if (this.selectedNode === transformerNode.node()) {
                return;
            } else if (this.selectedNode) {

                // this.selectedNode.moveToTop();
                transformerNode.attachTo(this.selectedNode);
            } else {
                // remove transformer
                transformerNode.detach();
            }
            transformerNode.getLayer().batchDraw();
        },
        async delay(second) {
            await new Promise(resolve => setTimeout(resolve, second * 1000));
        },
        setupFrontConfig() {
            this.count_load_image++;
            const url = 'http://cdn.shopify.com/s/files/1/0019/1843/5381/products/t-shirt-mockup_60e55f750cb35_600x.jpg?v=1654061231';
            let img = new Image();
            img.crossOrigin = "anonymous"
            let backgroundFront = this.v_objectsfront.find(x => x.name == 'backgroundfront');
            if (backgroundFront) {
                img.src = backgroundFront.url
            } else {
                img.src = url;
                backgroundFront = {
                    id: -1,
                    image: img,
                    position: 'front',
                    url: url,
                    draggable: false,
                    width: 2000,
                    height: 2000,
                    scaleX: 1,
                    scaleY: 1,
                    name: 'backgroundfront',
                    type: 'image',
                    rotation: 0,
                    x: 0,
                    y: 0
                }
            }
            img.onload = () => {
                this.count_load_image--;
            };
            backgroundFront.image = img;
            this.$set(this.v_objectsfront, 0, backgroundFront);
            this.count_load_image++;

            const urldesign = 'https://s3.us-east-1.amazonaws.com/stoecombucket/placeholder_20221023173751404.png';
            let imgdesign = new Image();
            imgdesign.crossOrigin = "anonymous"
            let designFront = this.v_objectsfront.find(x => x.name == 'designfront');
            if (designFront) {
                imgdesign.src = designFront.url;
            } else {
                imgdesign.src = urldesign;
                designFront = {
                    id: -2,
                    image: imgdesign,
                    url: urldesign,
                    draggable: true,
                    position: 'front',
                    width: 300,
                    height: 400,
                    scaleX: 1,
                    scaleY: 1,
                    name: 'designfront',
                    type: 'image',
                    rotation: 0,
                    x: 200,
                    y: 200
                }
            }
            imgdesign.onload = () => {

                this.count_load_image--;
            };
            designFront.image = imgdesign
            this.$set(this.v_objectsfront, 1, designFront);
            this.v_objects = this.v_objectsfront;

        },
        setupBackConfig() {
            const url = 'http://cdn.shopify.com/s/files/1/0019/1843/5381/products/t-shirt-mockup_60e55f750cb35_600x.jpg?v=1654061231';
            let img = new Image();
            img.crossOrigin = "anonymous"
            this.count_load_image++;
            let backgroundBack = this.v_objectsback.find(x => x.name == 'backgroundback');
            if (backgroundBack) {
                img.src = backgroundBack.url;
            } else {
                img.src = url;
                backgroundBack = {
                    id: -3,
                    image: null,
                    position: 'back',
                    url: url,
                    draggable: false,
                    width: 2000,
                    height: 2000,
                    scaleX: 1,
                    scaleY: 1,
                    name: 'backgroundback',
                    type: 'image',
                    rotation: 0,
                    x: 0,
                    y: 0
                }
            };
            img.onload = () => {

                this.count_load_image--;
            };
            backgroundBack.image = img
            this.$set(this.v_objectsback, 0, backgroundBack);

            const urldesign = 'https://s3.us-east-1.amazonaws.com/stoecombucket/placeholder_20221023173751404.png';
            let imgdesign = new Image();
            this.count_load_image++;
            imgdesign.crossOrigin = "anonymous"
            let designback = this.v_objectsback.find(x => x.name == 'designback');

            if (designback) {
                imgdesign.src = designback.url;
                designback.image = null;
            } else {
                imgdesign.src = urldesign;
                designback = {
                    id: -4,
                    image: null,
                    url: urldesign,
                    draggable: true,
                    position: 'back',
                    width: 300,
                    height: 300,
                    scaleX: 1,
                    scaleY: 1,
                    name: 'designback',
                    type: 'image',
                    rotation: 0,
                    x: 400,
                    y: 400
                }
            };
            imgdesign.onload = () => {

                this.count_load_image--;
            }
            designback.image = imgdesign
            this.$set(this.v_objectsback, 1, designback);
            this.checkLoadingImage();
        },
        async uploadFile(item) {
            this.isLoadImage = true;
            let formData = new FormData();
            formData.append('file', this.fileUpload);
            formData.append('name', 'deisng.png');
            await this.$axios.post('/files/s3upload',
                    formData, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                ).then((response) => {
                    this.isLoadImage = false;
                    item.url = response.data;
                    item.image.src = response.data;
                    this.updateImage(item);

                })
                .catch((error) => {
                    this.isLoadImage = false;
                });
        }

        // removeSelectedImage() {
        //     let newImageProps = this.imageProps.filter(
        //         url => url !== this.selectedImageName
        //     );
        //     this.$emit("update:image-props", newImageProps);

        //     this.$delete(this.images, this.selectedImageName);
        //     this.selectedNode = null;
        //     this.updateTransformer();

        //     // this.stageArea.draw();
        // }
    }
};
</script>

<style>
.panel-paint .konvajs-content canvas {
    border: 1px dashed #2d2d2d !important;
}
</style>
