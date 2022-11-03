<template>
<CSidebar fixed :minimize="minimize" :show="show" @update:show="(value) => $store.commit('set', ['sidebarShow', value])">
    <CSidebarBrand class="d-md-down-none" to="/reports/report-dashboard">
        <!-- <CIcon class="c-sidebar-brand-full" name="logo" size="custom-size" :height="35" viewBox="0 0 556 134" />
        <CIcon class="c-sidebar-brand-minimized" name="logo" size="custom-size" :height="35" viewBox="0 0 110 134" /> -->
        <img class="c-sidebar-brand-full" size="custom-size" :height="35" src="https://i.ibb.co/LgnRDgW/M-U-TR-NG.png">
        <img class="c-sidebar-brand-minimized" size="custom-size" :height="35" src="https://i.ibb.co/9YcShc4/logo.png">
        <CDropdown v-show="role=='admin'" style="font-weight:500" togglerText="Resource" variant="nav-item">
            <CDropdownItem href="/resources/accounts">Accounts</CDropdownItem>
        </CDropdown>
    </CSidebarBrand>
    <CSidebarNav>
        <CSidebarNavDropdown v-show="role=='admin'" name="Resources" icon="cib-buffer">
            <CSidebarNavItem name="Accounts" href="/resources/accounts"></CSidebarNavItem>
        </CSidebarNavDropdown>

        <CSidebarNavDropdown name="Designs" icon="cib-buffer">
            <CSidebarNavItem name="Designs" href="/handle/cards"></CSidebarNavItem>
            <CSidebarNavItem name="Mockups" href="/handle/templates"></CSidebarNavItem>
        </CSidebarNavDropdown>

        <CSidebarNavDropdown v-show="role!='designer'" name="Orders" icon="cib-buffer">
            <CSidebarNavItem name="Orders Esty" href="/handle/order-esty"></CSidebarNavItem>
        </CSidebarNavDropdown>
        <CSidebarNavDropdown v-show="role=='admin' || role=='seller'" name="Stores" icon="cib-buffer">
            <CSidebarNavItem name="Esty" href="/resources/account-store"></CSidebarNavItem>
        </CSidebarNavDropdown>

        <CSidebarNavDropdown v-show="role=='admin' || role=='seller' || role=='designer'" name="Reports" icon="cib-buffer">
            <CSidebarNavItem href="/reports/report-cards" v-show="role=='admin' || role=='seller' || role=='designer'" name="Designs"></CSidebarNavItem>
            <CSidebarNavItem href="/reports/report-orders" v-show="role=='admin' || role=='seller'" name="Orders"></CSidebarNavItem>
            <CSidebarNavItem href="/reports/report-sale-designer" v-show="role=='admin' || role=='designer'" name="Sales Designer"></CSidebarNavItem>
        </CSidebarNavDropdown>
    </CSidebarNav>
    <!-- <CRenderFunction flat :content-to-render="$options.nav" /> -->
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
            role:'',
            navAdmin: {
                _children: [{
                        _name: "CSidebarNavDropdown",
                        name: "Resource",
                        icon: "cib-buffer",
                        items: [{
                            name: "Accounts",
                            icon: "cil-people",
                            to: "/resources/accounts"
                        }, ]
                    },
                    {
                        _name: "CSidebarNavDropdown",
                        name: "Handle",
                        icon: "cil-sync",
                        items: [{
                            name: "Design",
                            icon: "cil-aperture",
                            to: "/handle/cards"
                        }]
                    },
                    {
                        _name: "CSidebarNavDropdown",
                        name: "Reports",
                        icon: "cil-description",
                        items: [{
                            name: "Report Design",
                            icon: "cil-aperture",
                            to: "/reports/report-cards"
                        }, ]
                    },

                ]
            },
            navSeller: {
                _children: [{
                    _name: "CSidebarNavDropdown",
                    name: "Handle",
                    icon: "cil-sync",
                    items: [{
                        name: "Design",
                        icon: "cil-aperture",
                        to: "/handle/cards"
                    }]
                }, {
                    _name: "CSidebarNavDropdown",
                    name: "Reports",
                    icon: "cil-description",
                    items: [{
                        name: "Report Design",
                        icon: "cil-aperture",
                        to: "/reports/report-cards"
                    }, ]
                }, ]
            },
            navDesigner: {
                _children: [{
                    _name: "CSidebarNavDropdown",
                    name: "Handle",
                    icon: "cil-sync",
                    items: [{
                        name: "Design",
                        icon: "cil-aperture",
                        to: "/handle/cards"
                    }]
                }, {
                    _name: "CSidebarNavDropdown",
                    name: "Reports",
                    icon: "cil-description",
                    items: [{
                        name: "Report Design",
                        icon: "cil-aperture",
                        to: "/reports/report-cards"
                    }, ]
                }, ]
            },
            navFulfillment: {
                _children: [{
                    _name: "CSidebarNavDropdown",
                    name: "Handle",
                    icon: "cil-sync",
                    items: [{
                        name: "Cards",
                        icon: "cil-aperture",
                        to: "/handle/cards"
                    }]
                }, {
                    _name: "CSidebarNavDropdown",
                    name: "Reports",
                    icon: "cil-description",
                    items: [{
                        name: "Report Cards",
                        icon: "cil-aperture",
                        to: "/reports/report-cards"
                    }, ]
                }, ]
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
        this.role = this.$auth.user.role
    }
}
</script>

<style>
</style>
