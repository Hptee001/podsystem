<template>
<div>
    <b-link @click="copyClipboard(carrier)">{{carrier}}</b-link> :
    <b-link @click="copyClipboard(number)">{{number}}</b-link>
    <b-link :href="url" target="_blank">
        <b-icon icon="eye"></b-icon>
    </b-link>
</div>
</template>

<script>
export default {
    props: ["trackingdata"],
    data() {
        return {
            carrier: '',
            number: '',
            url: '',
        }
    },
    mounted() {
        this.carrier = this.trackingdata.split('|')[0];
        this.number = this.trackingdata.split('|')[1];
        this.url = this.trackingdata.split('|')[2];
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

</style>
