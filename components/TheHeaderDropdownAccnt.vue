<template>
<CDropdown inNav class="c-header-nav-items" placement="bottom-end" add-menu-classes="pt-0">
    <template #toggler>
        <CHeaderNavLink>
            <div class="c-avatar">
                <img src="https://www.pngitem.com/pimgs/m/22-220721_circled-user-male-type-user-colorful-icon-png.png" class="c-avatar-img " />
            </div>
        </CHeaderNavLink>
    </template>
    <CDropdownHeader tag="div" class="text-center" color="light">
        <strong>Account</strong>
    </CDropdownHeader>
    <CDropdownItem>
        <CIcon name="cil-user" /> Profile
    </CDropdownItem>
    <CDropdownItem v-on:click="logout">
        <CIcon name="cil-lock-locked" /> Logout
    </CDropdownItem>
</CDropdown>
</template>

<script>
export default {
    name: 'TheHeaderDropdownAccnt',
    data() {
        return {
            itemsCount: 42
        }
    },
    methods: {
        async logout() {
            await this.$auth.logout();
            console.log("logout");
            this.$router.push('/')
        },
    }
}
</script>

<style>
.c-icon {
    margin-right: 0.3rem;
}

</style>
