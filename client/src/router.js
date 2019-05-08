import Vue from 'vue'
import Router from 'vue-router'
import Welcome from './views/Welcome.vue'
import DataUpload from './views/DataUpload.vue'
import DataStatistics from './views/DataStatistics.vue'
import Testing from './views/Testing.vue'
import LoanEvaluator from './views/LoanEvaluator.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/DataUpload',
      name: 'DataUpload',
      component: DataUpload
    },
    {
      path: '/DataStatistics',
      name: 'DataStatistics',
      component: DataStatistics
    },
    {
      path: '/Testing',
      name: 'Testing',
      component: Testing
    },
    {
      path: '/LoanEvaluator',
      name: 'LoanEvaluator',
      component: LoanEvaluator
    }
  ]
})
