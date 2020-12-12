import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import axios from 'axios'
import Login from './components/Login'
import Posts from './components/Posts'
import Profiles from './components/Profiles'
import SignUp from './components/SignUp'


Vue.use(VueRouter);
Vue.use(Vuex);

axios.defaults.baseURL = 'http://localhost:3000/';
axios.defaults.headers.common['Authorization'] = 'Bearer ';
// Configuration parameter for using persisted sessions (aka user stays logged in after refreshing or accidentally closing the tab).
const persistedSessions = true;

const store = new Vuex.Store({
    state: {
        user: null
    },
    mutations: {
        setUser: (state, user) => {
            state.user = user;
        }
    },
    actions: {
        SET_USER: (state, user) => {
            state.commit('setUser', user);

            if (user) {
                localStorage.setItem('accessToken', user.accessToken);
            }

            axios
                .defaults
                .headers
                .common['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
        },
        SET_TOKEN: () => {

            axios
                .defaults
                .headers
                .common['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
        }
    },
    getters: {
        user: (state) => state.user,
    }
});

const routes = [
    {
        path: '/',
        name: 'posts',
        component: Posts,
        meta: {requiresAuth: true}
    },
    {
        path: '/profiles',
        name: 'profiles',
        component: Profiles,
        meta: {requiresAuth: true}
    },
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/sign-up',
        name: 'sign-up',
        component: SignUp
    },
];

const router = new VueRouter({routes});

router.beforeEach((to, from, next) => {
    // Check if we need authentication for this view.
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // If we don't use persisted user sessions and either a token or user is missing, send the user to login.
        if (!persistedSessions) {
            if (!store.getters.user || !localStorage.getItem('accessToken')) {
                next({name: 'login'});
                return;
            }
        } else {
            // Otherwise
            // If we don't have an access token, we can't be logged in. Send the user to login.
            if (!localStorage.getItem('accessToken')) {
                next({name: 'login'});
                return;
            } else if (!store.getters.user) {
                // If we have the access token, but user object is not saved (for example we've just refreshed the page),
                // we can reauthenticate ourselves (if the token is still valid).
                // Set the token to the store from localStorage.
                store.dispatch("SET_TOKEN");
                // Try to authorize the user.
                axios.get('users/authorize')
                    .then((response) => {
                        // In case of success, set the user and proceed to next page.
                        store.dispatch('SET_USER', response.data);
                        next(to);
                    })
                    .catch(() => {
                        // In case of error, our access token is invalid, so we delete it and send the user to login.
                        localStorage.removeItem("accessToken");
                        next({name: 'login'});
                    })
                return;
            }
        }
    }
    // If next component doesn't need auth, we'll just proceed.
    next();
});


Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
