<template>
<b-card class="mb-2 mycard">

    <!-- / <b-card-img :src="thumbnail" height="250" @click="editCard(item)" style="background:#c2c2c2"> -->
    <div style="height:300px; width:100%;background:#c2c2c2; margin-bottom:5px;">
        <b-link>
            <b-img center :src="thumbnail" alt="Center image" height="200" @click="editCard(item)"></b-img>
        </b-link>
    </div>

    </b-card-img>
    <b-card-text>
        <b-container>
            <b-row class="small text-muted">
                <b-col cols="auto" class="mr-auto">
                    ID: {{item.id}} - Seller: {{item.seller}}
                </b-col>
                <b-col cols="auto" class="p-3">
                    {{showTime}}
                </b-col>
            </b-row>
            <b-row class="small text-muted">
                <b-col cols="auto" class="mr-auto">
                    Designer: {{item.designer}}
                </b-col>
                <b-col cols="auto" class="p-3">
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
    <b-row>
        <b-col>
            <b-link @click="copyClipboard(item.tags)" style="color:black">
                <b-icon icon="files"> </b-icon>
            </b-link> Tags: <span class="small text-muted">{{item.tags}}</span>
        </b-col>
    </b-row>
    <b-card-footer>
    </b-card-footer>
</b-card>
</template>

<script>
export default {
    props: ['name', 'tags', 'descr', 'seller', 'designer', 'meta', 'created_at', 'created_user', 'id', 'thumbnail', 'editCard', 'item'],
    data() {
        return {
            isShowSee: false,
            isShowFullDescr: false,
            reason: null,
            message: '',
        }
    },
    computed: {
        showTime() {
            return this.item.created_at.split('T')[0] + ' ' + this.item.created_at.split('T')[1].split(':')[0] + ':' + this.item.created_at.split('T')[1].split(':')[1];
        }
    },
    methods: {
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

.box-id {
    position: absolute;
    padding-top: 230px;
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
