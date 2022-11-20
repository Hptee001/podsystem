<template>
<div style="padding-bottom:5px;">
    <b-row>
        <b-col>
            <b-spinner v-show="isLoading"></b-spinner>
            <b-form-group v-show="!isLoading" label="Tagged input using select" label-for="tags-component-select">
                <!-- Prop `add-on-change` is needed to enable adding tags vie the `change` event -->
                <b-form-tags id="tags-component-select" v-model="value" size="lg" class="mb-2" add-on-change no-outer-focus>
                    <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
                        <b-form-select v-bind="inputAttrs" v-on="inputHandlers" :disabled="disabled || availableOptions.length === 0" v-model="selectValue" @input="addCollection(selectValue)">
                            <template #first>
                                <!-- This is required to prevent bugs with Safari -->
                                <option disabled :value="null">Choose a collection...</option>
                            </template>
                            <b-form-select-option v-for="option in availableOptions" :key="option" :value="option">
                                {{option}} {{showTagNameFromCollection(option)}}
                            </b-form-select-option>
                        </b-form-select>
                    </template>
                </b-form-tags>
            </b-form-group>
        </b-col>
    </b-row>
    <b-row v-for="collection in collections" :key="collection.id">
        <b-col>
            <b-row>
                <b-col>
                    {{collection.id}} {{collection.name}}
                </b-col>
                <b-col style="text-align:right">
                    <b-link variant="danger" @click="removeCard(collection)" style="color:red">remove</b-link>
                </b-col>
            </b-row>
            <b-button v-show="collection.templates !== ''" v-if="editCollectionId !== collection.id" @click="GenMockups(collection)" block size="sm">Gen Collection Mockups</b-button>
            <div v-else>
                <div v-for="template in editTemplates" :key="template.id" style="margin-bottom:5px;">
                    <the-mockup :designid="design_id" :name="name" :templateid="template" :isautogen="true"></the-mockup>
                </div>
                <b-button variant="dark" @click="editCollectionId=0" block size="sm">Close</b-button>
            </div>
        </b-col>
    </b-row>
    <b-row>
        <b-col>
            <b-button @click="GenAllMockups()" block size="sm" style="margin-bottom:5px;margin-top:5px;">Gen All Mockups</b-button>
            <div v-if="isGenAllTemplate">
                <div v-for="template in editTemplates" :key="template.id" style="margin-bottom:5px;">
                    <the-mockup :designid="design_id" :name="name" :templateid="template" :isautogen="true"></the-mockup>
                </div>
                <b-button variant="dark" @click="isGenAllTemplate=!isGenAllTemplate" block size="sm">Close</b-button>
            </div>
        </b-col>
    </b-row>
    <b-row>

    </b-row>
</div>
</template>

<script>
import TheMockup from './TheMockup.vue'
export default {
    components: {
        TheMockup
    },
    data() {
        return {
            isGenAllTemplate: false,
            editCollectionId: 0,
            editCollection: null,
            editTemplates: [],
            list_templates: [],
            collections: [],
            global_collections: [],
            options: [],
            value: [],
            selectValue: null,
            isLoading: false,
        }
    },
    props: ['design_id', 'name'],
    async mounted() {
        console.log(this.design_id)
        this.getTemplates();
        this.getCollections();

    },
    watch: {
        value(val) {

        }
    },
    computed: {
        availableOptions() {
            return this.options.filter(opt => this.value.indexOf(opt) === -1)
        }
    },
    methods: {
        async addCollection(collectionId) {
            var collection = this.global_collections.find(x => x.id == collectionId);
            collection.cards = collection.cards + ',' + this.design_id
            await this.addCard(collection);
            this.collections.push(collection)
        },
        showTagNameFromCollection(val) {
            return this.global_collections.find(x => x.id == val).name
        },
        async GenMockups(collection) {
            this.editCollectionId = collection.id
            this.editCollection = collection;
            this.editTemplates = collection.templates.split(',');
        },
        async GenAllMockups() {
            this.isGenAllTemplate = true;
            this.editTemplates = this.list_templates.map(a => a.id);
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
        async getCollections() {
            this.collections = []
            await this.$axios.get('/collections', {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.options = []
                    this.global_collections = response.data.data;
                    this.options = this.global_collections.map(x => x.id + "");

                    for (let i = 0; i < response.data.data.length; i++) {
                        let arr = response.data.data[i].cards.split(',');
                        if (arr.findIndex(x => x == this.design_id) >= 0) {
                            this.collections.push(response.data.data[i])

                        }
                    }

                    this.value = this.collections.map(x => x.id + '');

                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
        },
        async addCard(collection) {
            this.isLoading = true;
            await this.$axios.post('/collections/' + collection.id + '/cards/' + this.design_id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    collection = response.data;
                    this.makeToast('success', ' Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
        },
        async removeCard(collection) {
            this.isLoading = true;

            await this.$axios.delete('/collections/' + collection.id + '/cards/' + this.design_id, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.getCollections();
                    this.makeToast('success', ' Success')
                })
                .catch((error) => {
                    this.makeToast('danger', error.message)
                });
            this.isLoading = false;
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
