<template>
<div>
    <b-spinner v-if="isLoading"></b-spinner>
    <div v-else>
        <b-row v-if="designid>0">
            <b-col cols="auto">
                <b-link @click="viewImage(design_front)" v-if="design_front !=''">
                    <b-img class="img-border" :src="design_front" height="117"></b-img>
                </b-link>
                <label v-else>
                    Don't have Front
                </label>
            </b-col>
            <b-col cols="auto" v-show="design_back!=''">
                <b-link @click="viewImage(design_back)">
                    <b-img class="img-border" :src="design_back" height="117"></b-img>
                </b-link>
            </b-col>
             <b-col cols="auto" v-show="left_sleeve!=''">
                <b-link @click="viewImage(left_sleeve)">
                    <b-img class="img-border" :src="left_sleeve" height="117"></b-img>
                </b-link>
            </b-col>
             <b-col cols="auto" v-show="right_sleeve!=''">
                <b-link @click="viewImage(right_sleeve)">
                    <b-img class="img-border" :src="right_sleeve" height="117"></b-img>
                </b-link>
            </b-col>
             <b-col cols="auto" v-show="neck!=''">
                <b-link @click="viewImage(neck)">
                    <b-img class="img-border" :src="neck" height="117"></b-img>
                </b-link>
            </b-col>
            
        </b-row>
    </div>
    <b-modal hide-header v-model="isViewImage" ok-only>
        <div style="text-align:center; width:100%; background:#c2c2c2">
            <b-img-lazy fluid :src="main_image"></b-img-lazy>
        </div>

    </b-modal>
</div>
</template>

<script>
export default {
    data() {
        return {
            isLoading: false,
            design_front: '',
            design_back: '',
            left_sleeve: '',
            right_sleeve: '',
            neck: '',
            main_image: '',
            isViewImage: false,
            card: {
                id: 0,
                name: ''
            },
        }
    },
    watch: {
        async designid() {
            console.log(this.designid);
            if (this.designid > 0) {
                await this.getCard();
                this.updateCardName();
                this.getCardAttachment();

            }
        }
    },
    props: ["designid", "itemname"],
    mounted() {
        if (this.designid > 0) {
            this.getCard();
            this.getCardAttachment();
        }

    },
    methods: {
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
                    // this.updateCardName();
                })
                .catch(function (error) {

                });

        },
        makeToast(variant = null, message) {
            this.$bvToast.toast(message, {
                title: `Alert ${variant || "default"}`,
                variant: variant,
                solid: true,
            });
        },
        async updateCardName() {
            if (this.card.name.trim() !== this.itemname.trim() && this.itemname !== '' && this.card.name !== '') {
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
            this.isLoading = true;
            this.design_front = '';
            this.design_back = '';
             this.left_sleeve = '';
            this.right_sleeve = '';
            this.neck = '';
            await this.$axios.get('/cards/' + this.designid + '/attachments', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.isLoading = false;
                    for (let i = 0; i < response.data.length; i++) {
                        if (response.data[i].type == 'design_front')
                            this.design_front = response.data[i].thumbnail;
                        if (response.data[i].type == 'design_back')
                            this.design_back = response.data[i].thumbnail;
                        if (response.data[i].type == 'left_sleeve')
                            this.left_sleeve = response.data[i].thumbnail;
                        if (response.data[i].type == 'right_sleeve')
                            this.right_sleeve = response.data[i].thumbnail;
                        if (response.data[i].type == 'neck')
                            this.neck = response.data[i].thumbnail;
                    }

                })
                .catch(function (error) {
                    this.isLoading = false;
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
