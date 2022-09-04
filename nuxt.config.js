export default {
    ssr: false,
    telemetry: false,
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: "STO ECOM",
        htmlAttrs: {
            lang: "en"
        },
        meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { hid: "description", name: "description", content: "" }
        ],
        link: [
            { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
            {
                rel: "stylesheet",
                href: "//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons"
            }
        ]
    },
    loading: { color: "#fff" },
    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        "@/assets/scss/style.scss",
        // "bootstrap-css-only/css/bootstrap.min.css",
        // "mdbvue/lib/css/mdb.min.css"
        // "@/assets/css/custom-mdb.css"
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        { src: "~/plugins/coreui", mode: "client" },
        { src: "~/plugins/coreui-icons", mode: "client" },
        { src: "~/plugins/vue-papa-parse.js", mode: "client" },
        { src: "~/plugins/vue-json-csv.js", mode: "client" },
        { src: "~/plugins/vuedraggable.js" }
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    // components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        //'~/modules/mdbvue/nuxt',
        //'@nuxtjs/vuetify',
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
        // https://go.nuxtjs.dev/bootstrap
        //"mdbvue/nuxt",
        "bootstrap-vue/nuxt",
        // Doc: https://axios.nuxtjs.org/usage
        "@nuxtjs/axios",
        "@nuxtjs/auth",
        "@nuxtjs/pwa",
        // Doc: https://github.com/nuxt-community/dotenv-module
        "@nuxtjs/dotenv"
    ],
    bootstrapVue: {
        icons: true
    },
    axios: {
        baseURL: process.env.NODE_ENV !== 'production' ? "https://localhost:7000/api/" : 'https://localhost:7000/api/',
        debug: process.env.DEBUG || false
    },
    /*
     ** Build configuration
     */

    auth: {
        strategies: {
            local: {
                endpoints: {
                    login: {
                        url: "accounts/token/",
                        method: "post",
                        propertyName: "token"
                    },
                    user: {
                        url: "accounts/me/",
                        method: "get",
                        propertyName: "user"
                    },
                    tokenRequired: true,
                    logout: false
                }
            }
        },
        redirect: {
            login: "/pages/login",
            logout: "/pages/logout",
            callback: "/pages/login",
            home: "/"
        }
    },
    router: {
        middleware: ["auth"]
    },
    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        babel: { compact: true }
    },
    server: {
        port: 3000
    }
};