import Vue from 'vue'
import { iconsSet } from 'assets/icons/icons'
import { CIcon } from '@coreui/icons-vue'
// import { freeSet } from '@coreui/icons'
Vue.component('c-icon', CIcon)

export default ({ app }) => {
  app.icons = iconsSet
}
