<template>
<CSidebar fixed :minimize="minimize" :show="show" @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none" to="/">
        <!-- <CIcon class="c-sidebar-brand-full" name="logo" size="custom-size" :height="35" viewBox="0 0 556 134" />
        <CIcon class="c-sidebar-brand-minimized" name="logo" size="custom-size" :height="35" viewBox="0 0 110 134" /> -->
        <img class="c-sidebar-brand-full" size="custom-size" :height="35" src="https://i.ibb.co/LgnRDgW/M-U-TR-NG.png">
        <img class="c-sidebar-brand-minimized" size="custom-size" :height="35" src="https://i.ibb.co/9YcShc4/logo.png">
       
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="$options.nav" />
    <CSidebarMinimizer class="d-md-down-none" @click.native="$store.commit('set', ['sidebarMinimize', !minimize])" />
</CSidebar>
</template>

<script>
import nav from './_nav'
export default {
    name: 'TheSidebar',
    nav,
    data() {
        return {
            navAdmin: {
                _children: [{
                        _name: "CSidebarNavDropdown",
                        name: "Resource",
                        icon: "cib-buffer",
                        items: [
                            {
                                name: "Accounts",
                                icon: "cil-people",
                                to: "/resources/accounts"
                            },
                        ]
                    },
                    {
                        _name: "CSidebarNavDropdown",
                        name: "Handle",
                        icon: "cil-sync",
                        items: [{
                            name: "Cards",
                            icon: "cil-aperture",
                            to: "/handle/cards"
                        }]
                    },
                    {
                        _name: "CSidebarNavDropdown",
                        name: "Reports",
                        icon: "cil-description",
                        items: [
                            {
                                name: "Report Cards",
                                icon: "cil-aperture",
                                to: "/reports/report-cards"
                            },
                        ]
                    },

                ]
            },
            navSeller: {
                _children: [
                    {
                        _name: "CSidebarNavDropdown",
                        name: "Handle",
                        icon: "cil-sync",
                        items: [{
                            name: "Cards",
                            icon: "cil-aperture",
                            to: "/handle/cards"
                        }]
                    }, ]
            },
            navDesigner: {
                _children: [ {
                        _name: "CSidebarNavDropdown",
                        name: "Handle",
                        icon: "cil-sync",
                        items: [{
                            name: "Cards",
                            icon: "cil-aperture",
                            to: "/handle/cards"
                        }]
                    },
                ]
            },
            navFulfillment: {
                _children: [ {
                        _name: "CSidebarNavDropdown",
                        name: "Handle",
                        icon: "cil-sync",
                        items: [{
                            name: "Cards",
                            icon: "cil-aperture",
                            to: "/handle/cards"
                        }]
                    },
                ]
            },
        }
    },
    computed: {
        show() {
            if (this.$auth.user.role === 'seller')
                nav[0]._children = this.navSeller._children
            if (this.$auth.user.role === 'designer')
                nav[0]._children = this.navDesigner._children
            if (this.$auth.user.role === 'fulfillment')
                nav[0]._children = this.navFulfillment._children
               
            this.$options.nav = nav;
            return this.$store.state.sidebarShow
        },
        minimize() {
            return this.$store.state.sidebarMinimize
        }
    },
    async mounted() {

    }
}
</script>
