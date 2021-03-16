import { createStore } from 'vuex'
import admin from './admin'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
	modules: {
    	admin
  	},
  	plugins: [createPersistedState()]
})
