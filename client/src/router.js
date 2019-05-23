import Vue from 'vue'
import Router from 'vue-router'
import Welcome from './views/Welcome.vue'
import DataUpload from './views/DataUpload.vue'
import TrainingsetStatistics from './views/TrainingsetStatistics.vue'
import Testing from './views/Testing.vue'
import Evaluator from './views/Evaluator.vue'

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
      path: '/TrainingsetStatistics',
      name: 'TrainingsetStatistics',
      component: TrainingsetStatistics
    },
    {
      path: '/Testing',
      name: 'Testing',
      component: Testing
    },
    {
      path: '/Evaluator',
      name: 'Evaluator',
      component: Evaluator
    }
  ]
})
