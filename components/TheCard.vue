<template>
<b-card class="mb-2 mycard">

    <!-- / <b-card-img :src="thumbnail" height="250" @click="editCard(item)" style="background:#c2c2c2"> -->

    <div>
        <div class="ic-download">
            <b-link style="padding:15px;">
                <b-spinner v-if="isDownloading" small variant="success" small></b-spinner>
                <b-icon v-else @click="downloadFile" icon="cloud-arrow-down" style=" background: white;font-size: large;"></b-icon>
            </b-link>
        </div>
        <div style="height:300px; width:100%;background:#c2c2c2; margin-bottom:5px;">
            <b-link>
                <b-img center :src="thumbnail" alt="Center image" style="object-fit: scale-down;" height="300" width="288" @click="editCard(item)"></b-img>
            </b-link>
        </div>

    </div>

    <b-card-text>
        <b-container>
            <b-row class="small text-muted">
                <b-col cols="auto" class="mr-auto">
                    <b-link @click="copyClipboard(item.id)">ID: {{item.id}}</b-link> - Seller: {{item.seller}}
                </b-col>
                <b-col cols="auto">
                    {{showTime}}
                </b-col>
            </b-row>
            <b-row class="small text-muted">
                <b-col cols="auto" class="mr-auto">
                    Designer: {{item.designer}}
                </b-col>
                <b-col cols="auto">
                    {{item.meta}}
                </b-col>
            </b-row>

        </b-container>

    </b-card-text>
    <b-card-body>
        <b-link @click="copyClipboard(name)" style="color:black">
            <b-icon icon="files"> </b-icon>
        </b-link> {{name}}
    </b-card-body>
    <!-- <b-row>
        <b-col>
            <b-link @click="copyClipboard(item.tags)" style="color:black">
                <b-icon icon="files"> </b-icon>
            </b-link> Tags: <span class="small text-muted">{{item.tags}}</span>
        </b-col>
    </b-row> -->
   
    <b-row v-if="item.type != 'video'">
        <b-col>
            <b-button v-if="isGenMockup" @click="isGenMockup=!isGenMockup" size="sm" block>More</b-button>
            <div v-else>
                <the-collection-card-mockup :design_id="item.id" :name="item.name"></the-collection-card-mockup>
                <b-input-group prepend="TemplateId" size="sm" style="margin-bottom:5px;">
                    <b-spinner v-if="isSaveTemplate"></b-spinner>
                    <b-input v-show="!isSaveTemplate" v-model="item.template_id" @input="updateTemplate(item)"></b-input>
                    <the-mockup :designid="item.id" :name="item.name" :templateid="item.template_id" :isautogen="false"></the-mockup>
                </b-input-group>
                <b-button @click="isGenMockup=!isGenMockup" size="sm" block>Close Gen Mockup</b-button>
            </div>
        </b-col>
    </b-row>
</b-card>
</template>

<script>
import TheCollectionCardMockup from './TheCollectionCardMockup.vue';
import TheMockup from './TheMockup.vue';
var FileSaver = require('file-saver');
export default {
    components: {
        TheMockup,
        TheCollectionCardMockup
    },
    props: ['name', 'tags', 'descr', 'seller', 'designer', 'meta', 'created_at', 'created_user', 'id', 'thumbnail', 'editCard', 'updateCard', 'item'],
    data() {
        return {
            isGenMockup: true,
            isShowSee: false,
            isShowFullDescr: false,
            isDownloading: false,
            isSaveTemplate: false,
            reason: null,
            editItem: null,
            message: '',
        }
    },
    computed: {
       
        showTime() {
            return this.item.created_at.split('T')[0] + ' ' + this.item.created_at.split('T')[1].split(':')[0] + ':' + this.item.created_at.split('T')[1].split(':')[1];
        }
    },
    mounted() {
        this.editItem = Object.assign({}, this.item)
    },
    methods: {
        async downloadFile() {
            this.isDownloading = true;
            let dataurl = this.item.design_front // 'https://80steess3.imgix.net/production/products/STRNG032/hellfire-club-stranger-things-raglan-baseball-shirt.master.png';
            var filename = dataurl.substring(dataurl.lastIndexOf('/') + 1);
            await this.$axios.get(dataurl, {
                    transformRequest: (data, headers) => {
                        delete headers.common['Authorization'];
                        return data;
                    },
                    responseType: 'blob',
                    headers: {
                        Authorization: '',
                        'Content-Type': 'image/png'
                    }
                })
                .then((response) => {
                    FileSaver.saveAs(response.data, filename);
                })
                .catch((error) => {
                    this.isDownloading = false;
                });
            this.isDownloading = false;
            // FileSaver.saveAs(this.item.design_front, filename);
        },
        async updateTemplate(item) {
            this.isSaveTemplate = true;
            await this.updateCard(item);
            this.isSaveTemplate = false;
        },
        async copyClipboard(message) {
            await navigator.clipboard.writeText(message);
            this.makeToast('success', 'Copied')
        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || 'default'}`,
                variant: variant,
                solid: true
            })
        },
    },
}
</script>

<style>
.card-body {
    padding: 5px;
    min-height: 75px;

}

.card-text {
    padding-bottom: 0px;
    margin-bottom: 0px;
}

.small.text-muted {
    padding-left: 5px;
}

.mr-auto {
    padding-left: 0px;
}

.text-muted {
    color: black !important;
}

.ic-download {
    position: absolute;
    background: white;
    margin-top: 280px;
    border-radius: 0 5px 0 0;
}

.mycard {
    width: 300px;
}

.card {
    border-color: #ffffff;
}

.mycard:hover {
    border-color: rgba(0, 0, 0, .15);
    box-shadow: 0 .6rem 1rem rgba(0, 0, 0, .15) !important;
}
</style>
