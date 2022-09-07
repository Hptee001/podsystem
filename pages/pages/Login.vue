<template>
<div>

    <CContainer class="d-flex content-center min-vh-100">

        <CRow>
            <CCol>

                <CCard class="p-8" style="width:500px;">
                    <CCardBody>
                        <CForm>
                            <img class="logo" src="https://i.ibb.co/smnjHcJ/M-U-EN-1.png">
                            <b-alert variant="danger" dismissible fade :show="isError" @dismissed="isError=false">
                                Error: {{messageError}}
                            </b-alert>
                            <CInput v-model="account.username" placeholder="Username" autocomplete="username email">
                                <template #prepend-content>
                                    <CIcon name="cil-user" /></template>
                            </CInput>
                            <CInput v-model="account.password" placeholder="Password" type="password" autocomplete="curent-password">
                                <template #prepend-content>
                                    <CIcon name="cil-lock-locked" /></template>
                            </CInput>
                            <CRow>
                                <CCol col="12" class="text-left">
                                    <CButton color="primary" class="px-4" @click="login">Login</CButton>
                                </CCol>
                            </CRow>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </CContainer>
</div>
</template>

<script>
export default {
    layout: "guest",
    data: () => ({
        isError: false,
        messageError: '',
        loading: false,
        account: {
            username: "",
            password: ""
        }
    }),
    name: 'Login',
    methods: {
        async login() {
            this.loading = true;
            try {
                const response = await this.$axios.post('accounts/token/', {
                    username: this.account.username,
                    password: this.account.password
                });
                await this.$auth.setToken("Bearer " + response.data.token);
                await this.$auth.setRefreshToken('local', response.data.token);
                await this.$auth.setUserToken(response.data.token);
                this.loading = false;
                this.$router.push('/reports/cards')
            } catch (e) {
                this.error = 'Username or Password not valid'
                this.isError = true;
                this.loading = false;
                this.messageError = 'Username or Password not valid';
               
            }
        }
    }
}
</script>
<style >
.logo{
    height: 100px;
    padding: 10px;
}
</style>