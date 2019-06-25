import Vue from 'vue';
import {parseRange, serializeRange} from "../../util/querystring";

export const SET_FILTERS = 'SET_FILTERS';
export const SET_FILTER_VALUE = 'SET_FILTER_VALUE';

const filterQueryPrefix = 'filter_';
const filterQueryRE = new RegExp(`^${filterQueryPrefix}`);

export default {
    namespaced: true,

    state: ()=>({
        filters: null,
        values: {},
    }),

    mutations: {
        [SET_FILTERS](state, filters) {
            state.filters = filters;
        },
        [SET_FILTER_VALUE](state, { key, value }) {
            Vue.set(state.values, key, value);
        },
    },

    getters: {
        value(state) {
            return key => state.values[key];
        },
        filters(state) {
            return state.filters || []
        },
        values(state) {
            return state.values;
        },
        filter(state) {
            return key => (state.filters || []).find(filter => filter.key === key);
        },

        defaultValue() {
            return filter => (filter||{}).default;
        },

        filterQueryKey() {
            return key => `${filterQueryPrefix}${key}`;
        },
        getQueryParams(state, getters) {
            return values => Object.entries(values)
                .reduce((res, [key, value]) => ({
                    ...res,
                    [getters.filterQueryKey(key)]: getters.serializeValue({
                        filter: getters.filter(key),
                        value,
                    }),
                }), {});
        },
        getValuesFromQuery() {
            return query => Object.entries(query || {})
                .filter(([key]) => filterQueryRE.test(key))
                .reduce((res, [key, value]) => ({
                    ...res,
                    [key.replace(filterQueryRE, '')]: value
                }), {});
        },
        resolveFilterValue(state, getters) {
            return ({ filter, value }) => {
                if(value == null) {
                    return getters.defaultValue(filter);
                }
                if(filter.multiple && !Array.isArray(value)) {
                    return [value];
                }
                if(filter.dateRange) {
                    return parseRange(value);
                }
                return value;
            }
        },
        serializeValue() {
            return ({ filter, value }) => {
                if(filter.dateRange) {
                    return serializeRange(value);
                }
                return value;
            };
        },
        nextValues(state) {
            return ({ filter, value }) => {
                let base = state.values;
                if(filter.master) {
                    base = Object.keys(state.values).reduce((res, key) => ({ ...res, [key]:null }), {});
                }
                return { ...base, [filter.key]: value };
            };
        },
        nextQuery(state, getters) {
            return ({ filter, value }) => {
                return getters.getQueryParams(getters.nextValues({ filter, value }));
            }
        },
    },

    actions: {
        update({ commit, dispatch }, { filters, values }) {
            commit(SET_FILTERS, filters);

            return Promise.all(
                (filters || []).map(filter => {
                    dispatch('setFilterValue', {
                        filter,
                        value: (values || {})[filter.key]
                    })
                })
            );
        },
        setFilterValue({ commit, getters }, { filter, value }) {
            commit(SET_FILTER_VALUE, {
                key: filter.key,
                value: getters.resolveFilterValue({ filter, value })
            });
        },
    }
}