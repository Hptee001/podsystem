<template>
<div>
    <b-spinner v-if="isLoading" variant="primary" small type="grow"></b-spinner>
    <b-button v-else v-show="templateid >0" @click="genMockup" size="sm" block>Download Mockup {{templateid}}</b-button>
</div>
</template>

<script>
import imageCompression from 'browser-image-compression';
import Konva from 'konva';
export default {
    data() {
        return {
            isLoading: false,
            design_front: '',
            design_back: '',
            main_image: '',
            template: {
                name: '',
                width: 1080,
                height: 1080
            },
            isViewImage: false,
            templateitems: [],
            card: {
                id: 0,
                name: ''
            },
        }
    },
    watch: {
        isautogen(val) {
            if (val) {
                this.genMockup();
            }

        }
    },
    props: ["designid", "templateid", "name", "isautogen"],
    async mounted() {
        await this.getCardAttachment();
        if (this.templateid > 0) {
            await this.getTemplate();
            if (this.isautogen) {
                this.genMockup();
            }
        }
    },
    methods: {
        async delay(second) {
            await new Promise(resolve => setTimeout(resolve, second * 1000));
        },
        async genMockup() {
            this.isLoading = true;
            // console.log(this.design_front);
            await this.getTemplate();

            await this.getTemplateItems();
            if (this.design_front != '') {

                await this.createMockup('front');
            }
            if (this.design_back != '') {

                await this.createMockup('back');
            }
            this.isLoading = false;
        },
        async createMockup(position) {
            let container = document.createElement('div')
            container.id = 'containerDraw-' + this.designid
            container.style = 'display:none';

            document.body.appendChild(container);
            let stage = new Konva.Stage({
                width: this.template.width,
                height: this.template.height,
                container: container.id
            });
            let layer = new Konva.Layer();
            stage.add(layer);

            let backgroundObject = this.templateitems.find(x => x.name == ('background' + position));
            let backgroundImage = new Image();
            backgroundImage.src = backgroundObject.url + '?stopGivingMeHeadaches=true';
            backgroundImage.crossOrigin = "Anonymous";
            backgroundImage.onload = function () {};
            var background = new Konva.Image({
                x: backgroundObject.x,
                y: backgroundObject.y,
                scaleX: backgroundObject.scaleX,
                scaleY: backgroundObject.scaleY,
                image: backgroundImage,
                width: backgroundObject.width,
                height: backgroundObject.height,
            });
            layer.add(background);
            layer.draw();
            let designObject = this.templateitems.find(x => x.name == ('design' + position));
            let designImage = new Image();
            designImage.src = (position == 'front' ? this.design_front : this.design_back) + '?stopGivingMeHeadaches=true';
            designImage.crossOrigin = "Anonymous";
            designImage.onload = function () {};
            var design = new Konva.Image({
                x: designObject.x,
                y: designObject.y,
                scaleX: designObject.scaleX,
                scaleY: designObject.scaleY,
                image: designImage,
                width: designObject.width,
                height: designObject.height,
                rotation: designObject.rotation
            });
            layer.add(design);
            layer.draw();
            let flag_all_load = true;
            while (flag_all_load) {
                await this.delay(1);

                for (let i = 0; i < layer.getChildren().length; i++) {
                    if (!layer.getChildren()[i].attrs.image.complete) {

                        flag_all_load = false;
                    }
                }
                if (flag_all_load)
                    break;
                flag_all_load = true;
            }
            var dataURL = stage.toDataURL({
                pixelRatio: 1,
                quality: 0.3
            });

            function downloadURI(uri, name) {
                let link = document.createElement('a');
                link.download = name;
                link.href = uri;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                link.remove();
            }
            const options = {
                maxSizeMB: 3,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            }
            const blob = this.dataURLtoBlob(dataURL); 
            const compressed = await imageCompression(blob, options);
            const compressedURL = URL.createObjectURL(compressed);
            downloadURI(compressedURL, position + '-' + this.name + '.png');

            // downloadURI(dataURL, position + '-' + this.name + '.png');
            container.remove();
        },
        dataURLtoBlob(dataURL) {

            // convert base64 to raw binary data held in a string
            var byteString = atob(dataURL.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

            // write the bytes of the string to an ArrayBuffer
            var arrayBuffer = new ArrayBuffer(byteString.length);

            // create a view into the buffer
            var ia = new Uint8Array(arrayBuffer);

            // set the bytes of the buffer to the correct values
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            var blob = new Blob([arrayBuffer], {
                type: mimeString
            });
            return blob;

        },
        viewImage(image) {
            this.isViewImage = true;
            this.main_image = image;
        },
        async getCard() {
            await this.$axios.get('/cards/' + this.designid, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.card = response.data
                })
                .catch(function (error) {

                });
            this.updateCardName();
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        async updateCardName() {
            if (this.card.name.trim() != this.itemname.trim() && this.itemname != '' && this.card.name != '') {
                this.card.name = this.itemname
                const json = JSON.stringify(this.card);
                await this.$axios.put('/cards/' + this.card.id, json, {
                        headers: {
                            Authorization: this.$auth.getToken('local'),
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.isEditLoading = false;
                        this.makeToast('success', 'Updated CardName Success: ' + this.card.id)
                    })
                    .catch((error) => {
                        this.isEditLoading = false;
                        this.makeToast('danger', error.message)
                    });
            }
        },
        async getCardAttachment() {
            this.design_front = ''
            this.design_back = ''
            await this.$axios.get('/cards/' + this.designid + '/attachments', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {

                    for (let i = 0; i < response.data.length; i++) {
                        if (response.data[i].type == 'design_front')
                            this.design_front = response.data[i].thumbnail
                        if (response.data[i].type == 'design_back')
                            this.design_back = response.data[i].thumbnail
                    }

                })
                .catch(function (error) {

                });
        },
        async getTemplate() {
            await this.$axios.get('/templates/' + this.templateid, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.template = response.data
                })
                .catch(function (error) {

                });
        },
        async getTemplateItems() {
            await this.$axios.get('/templates/' + this.templateid + '/items', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.templateitems = response.data
                })
                .catch(function (error) {

                });
        }
    },
}
</script>

<style>
.img-border {
    border-color: rgba(0, 0, 0, .15);
    margin-left: 15px;
    border: 2px solid white;
    padding: 10px;
    background: #ebedef;
    box-shadow: 0 .3rem 0.24em rgba(0, 0, 0, .15) !important;
}
</style>
