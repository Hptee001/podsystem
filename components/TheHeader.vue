<template>
<CHeader fixed with-subheader light>
    <CToggler in-header class="ml-3 d-lg-none" @click="$store.commit('toggleSidebarMobile')" />
    <CToggler in-header class="ml-3 d-md-down-none" @click="$store.commit('toggleSidebarDesktop')" />
    <CHeaderBrand href="/reports/report-dashboard" class="mx-auto d-lg-none">
        <!-- <CIcon name="logo" height="48" alt="Logo"/> -->
        <img style="padding:10px;"  src="/logo_small.png" />
    </CHeaderBrand>
    <CHeaderNav  class="d-md-down-none mr-auto ">
        <b-link :href="role=='designer'?'/reports/report-design':'/reports/report-dashboard'"><img style="padding:10px;" height="50" src="/logo_small.png" /></b-link>
        <CDropdown v-show="role=='admin'" style="font-weight:500" togglerText="Resource" variant="nav-item">
            <CDropdownItem href="/resources/accounts">Accounts</CDropdownItem>
        </CDropdown>
         <CDropdown style="font-weight:500" togglerText="Designs" variant="nav-item">
            <CDropdownItem href="/handle/cards">  Designs</CDropdownItem>
            <CDropdownItem href="/handle/templates">  Mockup</CDropdownItem>
            <CDropdownItem href="/handle/collections">  Collections</CDropdownItem>
        </CDropdown>
         <CDropdown v-show="role!='designer'" style="font-weight:500" togglerText="Orders" variant="nav-item">
            <CDropdownItem href="/handle/order-esty">Orders Esty</CDropdownItem>
            <CDropdownItem href="/handle/order-amz">Orders Amazon</CDropdownItem>
        </CDropdown>
         <CDropdown v-show="role=='admin' || role=='seller'" style="font-weight:500" togglerText="Stores" variant="nav-item">
            <CDropdownItem href="/resources/account-store">Esty Stores</CDropdownItem>
             <CDropdownItem href="/resources/account-store-amz">Amazon Stores</CDropdownItem>
        </CDropdown>
        <CDropdown v-show="role=='admin' || role=='seller' || role=='designer'"  style="font-weight:500" togglerText="Reports" variant="nav-item">
            <CDropdownItem href="/reports/report-cards" v-show="role=='admin' || role=='seller' || role=='designer'" >Designs</CDropdownItem>
            <CDropdownItem href="/reports/report-orders" v-show="role=='admin' || role=='seller'" >Orders</CDropdownItem>
             <CDropdownItem href="/reports/report-sale-designer" v-show="role=='admin' || role=='designer'" >Sales Designer</CDropdownItem>
        </CDropdown>
    </CHeaderNav>

    <CHeaderNav class="mr-4">
        <TheHeaderDropdownAccnt />
    </CHeaderNav>
</CHeader>
</template>

<script>
import TheHeaderDropdownAccnt from './TheHeaderDropdownAccnt'

export default {
    name: 'TheHeader',
    components: {
        TheHeaderDropdownAccnt
    },
    data() {
        return {
            role: 'admin',
        }
    },
    async mounted() {
        this.role = this.$auth.user.role;
        this.$store.commit('toggleSidebarDesktop')
    },

}
</script>
<style>
.my-nav-text {
color: #2eb85c;
}
</style>
