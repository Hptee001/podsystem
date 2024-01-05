const axios = require('@nuxtjs/axios');

export const state = () => ({
    isBusy: false,
    pagination: {
        page: 1,
        limit: 50,
        total: 10
    },
    headerOptions: {
        headers: {
            Authorization: ''
        }
    }
})

export const getters = {
    GET_Pagination(state) {
        return state.pagination || null
    }
}
export const mutations = {
    SET_isBusy(state, payload) {
        state.isBusy = payload.isBusy
    },
    SET_PAGINATION(state, payload) {
        state.pagination = {
            page: payload.page,
            limit: payload.limit,
            total:payload.total_count
        }
    }
}

export const actions = {

    async Create({ commit, rootGetters }, payload) {
        commit('SET_isBusy', { isBusy: true })
        try {
            let result = await this.$axios.$post("/tiktoktemplates", payload.data, {
                headers: {
                    Authorization: this.$auth.getToken('local'),
                    'Content-Type': 'application/json'
                },
            });
            commit('SET_isBusy', { isBusy: false })
            return result;
        } catch (error) {
            console.log(error)
        }
        commit('SET_isBusy', { isBusy: false })
    },

    async GetList({ commit, state }, payload) {
        let paramaters = {
            params: {
                page: payload.page,
                limit: payload.limit
            }
        }
        commit('SET_isBusy', { isBusy: true })
        try {
            let result = await this.$axios.$get("/tiktoktemplates", paramaters, {
                headers: {
                    Authorization: this.$auth.getToken('local'),
                    'Content-Type': 'application/json'
                },
            });
            payload.total_count = result.total_count
            commit('SET_PAGINATION', payload);
            return result.data;
        } catch (error) {
            console.log(error);
        } finally {
            commit('SET_isBusy', { isBusy: false })
        }
    },
    async Detail({ commit, state }, payload) {
        commit('SET_isBusy', { isBusy: true })
        try {
            let result = await this.$axios.$get("/tiktoktemplates/" + payload.id, {
                headers: {
                    Authorization: this.$auth.getToken('local'),
                    'Content-Type': 'application/json'
                },
            });
            return result;
        } catch (error) {
            console.log(error);
        }finally {
            commit('SET_isBusy', { isBusy: false })
        }
    },
    async Update({ commit, state }, payload) {
        commit('SET_isBusy', { isBusy: true })
        try {
            let result = await this.$axios.$put("/tiktoktemplates/" + payload.id, payload.data, {
                headers: {
                    Authorization: this.$auth.getToken('local'),
                    'Content-Type': 'application/json'
                },
            });
            return result;
        } catch (error) {
            console.log(error);
        }finally {
            commit('SET_isBusy', { isBusy: false })
        }
    },
    async Upload({ commit, state }, payload) {
        commit('SET_isBusy', { isBusy: true })
        try {
            const fdata = new FormData();
            fdata.append("file", payload.file);
            let result = await this.$axios.$post("/tiktoktemplates/", fdata, {
                headers: {
                    Authorization: this.$auth.getToken('local'),
                    'Content-Type': 'multipart/form-data'
                },
            });
            return result;
        } catch (error) {
            console.log(error);
        }finally {
            commit('SET_isBusy', { isBusy: false })
        }

    },
    async Delete({ commit, state }, payload) {
        try {
            commit('SET_isBusy', { isBusy: true })
            let result = await this.$axios.$delete("/tiktoktemplates/" + payload.id, {
                headers: {
                    Authorization: this.$auth.getToken('local'),
                    'Content-Type': 'application/json'
                },
            });
            commit('SET_isBusy', { isBusy: false })
            return result;
        } catch (error) {
            console.log(error);
        }finally {
            commit('SET_isBusy', { isBusy: false })
        }
    },
}