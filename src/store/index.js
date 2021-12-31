import { createStore, createLogger } from 'vuex'
import admin from './admin'
import createPersistedState from 'vuex-persistedstate'

const plugins = [createPersistedState()];

process.env.NODE_ENV !== 'production' && plugins.push(createLogger())

export default createStore({
	modules: {
    	admin
  	},
  	plugins,
})
