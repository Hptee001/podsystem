const axios = require('@nuxtjs/axios');

export const state = () => ({
    fulfillment_sellers: [],
    pagination: {
        page: 1,
        limit:50
    },
    headerOptions: {
        headers: {
            Authorization: ''
        }
    }
})

export const getters = {
    get_fulfillment_sellers(state) {
        return state.sys_facebook_groups || []
    },
    get_pagination(state) {
        return state.pagination || null
    }
}
export const mutations = {
    set_fulfillment_sellers(state, payload) {
        state.fulfillment_sellers = payload || [];
    },
    set_pagination(state, payload) {
        state.pagination = {
            page: payload.page,
            limit: payload.limit
        }
    }
}

export const actions = {
    async Add({ dispatch, rootGetters }, payload) {
        let result = await this.$axios.$post("/sysfacebookgroups", payload.data, {
            headers: {
                Authorization: this.$auth.getToken('local'),
                'Content-Type': 'application/json'
            },
        });
        return result;
    },
   
    async Index({ commit, state }, payload) {
        let paramaters = {
            params: {
                page: payload.page,
                limit : payload.limit
            }
        }
        let result = await this.$axios.$get("/fulfillmentsellers?", paramaters, {
            headers: {
                Authorization: this.$auth.getToken('local'),
                'Content-Type': 'application/json'
            },
        });
        commit('set_fulfillment_sellers', result);
        commit('set_pagination', payload);
        return result;
    },
   
    async Delete({ commit, state }, payload) {
        let result = await this.$axios.$delete("/fulfillmentsellers/" + payload.id, {
            headers: {
                Authorization: this.$auth.getToken('local'),
                'Content-Type': 'application/json'
            },
        });
        return result;
    },
}