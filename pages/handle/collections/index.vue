<template>
<b-container fluid>
    <b-row align-v="start">
        <b-col cols="auto">
            <b-button @click="createCollection" block variant="primary">Create Collection</b-button>
            <b-list-group style="position:relative; height:700px; overflow-y:scroll;">
                <b-list-group-item v-for="item in collections" :key="item.id">
                    <b-link @click="selectCollection(item)">{{item.id}} | {{item.name}} ({{countCards(item)}})</b-link>
                </b-list-group-item>
            </b-list-group>
        </b-col>
        <b-col v-if="edit_collection !== null && edit_collection !== undefined">
            <b-row>
                <b-col cols="4">
                    <b-input-group>
                        <b-input v-model="edit_collection.name" placeholder="Collection Name"></b-input>
                        <b-button @click="saveCollection">Save</b-button>
                    </b-input-group>

                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-form-tags input-id="tagscard-separators" v-model="tag_cards" separator="," placeholder="Enter CardId" @keydown.native="addTagCard">
                        <template v-slot="{ tags, inputAttrs, inputHandlers, tagVariant}">
                            <b-input-group class="mb-2">
                                <b-form-input v-bind="inputAttrs" type="number" v-on="inputHandlers" placeholder="New CardId - Press enter to add" class="form-control"></b-form-input>

                            </b-input-group>
                            <div class="d-inline-block">
                                <b-form-tag v-for="tag in tags" @remove="removeTagCard(tag)" :key="tag" :title="tag" :variant="tagVariant" class="mr-1">{{ tag }}</b-form-tag>
                            </div>
                        </template>
                    </b-form-tags>
                </b-col>
            </b-row>
            <b-row>
                <b-col>

                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-form-tags input-id="template-separators" v-model="tag_templates" separator="," placeholder="Enter TemplateId"  @keydown.native="addTagTemplate">
                        <template v-slot="{ tags, inputAttrs, inputHandlers, tagVariant}">
                            <b-input-group class="mb-2">
                                <b-form-input v-bind="inputAttrs" type="number" v-on="inputHandlers" placeholder="New TemplateID - Press enter to add" class="form-control"></b-form-input>

                            </b-input-group>
                            <div class="d-inline-block">
                                <b-form-tag v-for="tag in tags" @remove="removeTagTemplate(tag)" :key="tag" :title="tag" :variant="tagVariant" class="mr-1">{{ tag }}</b-form-tag>
                            </div>
                        </template>
                    </b-form-tags>
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="auto" v-if="item !== ''" v-for="item in tag_cards" :key="item" class="col-card">
                    <the-load-card :id="item"></the-load-card>
                </b-col>

            </b-row>
        </b-col>
    </b-row>
    <b-overlay :show="isLoading" opacity="0.4" no-wrap></b-overlay>
</b-container>
</template>

<script>
import TheCard from '../../../components/TheCard.vue';
import TheLoadCard from '../../../components/TheLoadCard.vue';
export default {
    components: {
        TheLoadCard
    },
    data() {
        return {
            isLoadImage: false,
            isLoading: false,
            collections: [],
            edit_collection: null,
            tag_cards: [],
            tag_templates: []
        };
    },
    watch: {},
    mounted() {
        this.getCollections();
    },
    methods: {
        async removeTagCard(val) {
            this.tag_cards = this.tag_cards.filter(x => x !== val)
            this.removeCard(val)
            this.getCollections();
        },
        async removeTagTemplate(val) {
            this.tag_templates = this.tag_templates.filter(x => x !== val)
            this.removeTemplate(val);
            this.getCollections();
        },
        countCards(item) {
            if (item.cards !== '') {
                return item.cards.split(',').length
            }
            return 0;

        },
        async createCollection() {
            this.tag_cards = []
            this.edit_collection = {
                id: 0,
                name: 'New Collection',
                cards: this.tag_cards.toString(),
                templates: this.tag_templates.toString(),
            }
            this.saveCollection();

        },
        async addTagCard(event) {
            if (event.which === 13) {
                if (this.edit_collection.cards !== this.tag_cards.toString()) {
                    let cardId = this.tag_cards[this.tag_cards.length - 1];
                    this.addCard(cardId)
                    this.getCollections();
                } else {
                    console.log('not add card');
                }
            }
        },
        async addTagTemplate(event) {
            if (event.which === 13) {
                if (this.edit_collection.templates !== this.tag_templates.toString()) {
                    let templateId = this.tag_templates[this.tag_templates.length - 1];
                    this.addTemplate(templateId)
                    this.getCollections();
                } else {
                    console.log('not add card');
                }
            }
        },
        async inputTemplateId() {
            this.edit_collection.templates = this.tag_templates.toString();
            this.saveCollection();
        },
        async selectCollection(item) {
            this.tag_cards = []
            this.tag_templates = []
            this.edit_collection = item;
            this.$axios.get('/collections/' + item.id, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_collection = response.data;
                    if (this.edit_collection.cards !== '')
                        this.tag_cards = this.edit_collection.cards.split(',')
                    if (this.edit_collection.templates !== '') {
                        this.tag_templates = this.edit_collection.templates.split(',')
                    }
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        async getCollections() {
            this.$axios.get('/collections', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {

                    this.collections = response.data.data;
                    // this.collections = response.data;
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        async saveCollection() {
            this.isLoading = true;
            const json = JSON.stringify(this.edit_collection);
            let path_endpoint = '/collections';
            if (this.edit_collection.id > 0) {
                path_endpoint = path_endpoint + '/' + this.edit_collection.id
            }
            await this.$axios.post(path_endpoint, json, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_collection = response.data;
                    this.getCollections();
                    this.makeToast('success', ' Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
        },
        async addCard(cardId) {
            this.isLoading = true;

            await this.$axios.post('/collections/' + this.edit_collection.id + '/cards/' + cardId, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_collection = response.data;
                    this.makeToast('success', ' Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
        },
        async addTemplate(templateId) {
            this.isLoading = true;
            await this.$axios.post('/collections/' + this.edit_collection.id + '/templates/' + templateId, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_collection = response.data;
                    this.makeToast('success', ' Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
        },
        async removeCard(cardId) {
            this.isLoading = true;

            await this.$axios.delete('/collections/' + this.edit_collection.id + '/cards/' + cardId, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_collection = response.data;
                    this.makeToast('success', ' Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
        },
        async removeTemplate(templateId) {
            this.isLoading = true;
            await this.$axios.delete('/collections/' + this.edit_collection.id + '/templates/' + templateId, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.edit_collection = response.data;
                    this.makeToast('success', ' Success')
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
    }
};
</script>

<style>
.panel-paint .konvajs-content canvas {
    border: 1px dashed #2d2d2d !important;
}

.card {
    margin-right: 5px;
}
</style>
