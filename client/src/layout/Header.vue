<template>
    <div class="pure-menu pure-menu-horizontal">
      <ul class="pure-menu-list">
          <li
            class="pure-menu-item menu-item"
            :class="{'pure-menu-selected': $route.path == '/'}"
          >
            <router-link to="/" class="pure-menu-link">
              <img src="../assets/robot.png" alt="Home" height="50px">
            </router-link>
          </li>
          <li
            v-for="(item, index) in links"
            :key="'route' + index"
            class="pure-menu-item"
            :class="{'pure-menu-selected': $route.path == item.route}"
          >
            <router-link :to="item.route" class="pure-menu-link" height="50px">
              {{item.label}}
            </router-link>
          </li>
      </ul>
  </div>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      links: [
        {
          route: '/DataUpload',
          label: 'Upload'
        },
        {
          route: '/DataStatistics',
          label: 'Statistics'
        },
        {
          route: '/Testing',
          label: 'Testing'
        },
        {
          route: '/LoanEvaluator',
          label: 'Loan Evaluator'
        }
      ]
    }
  }
}
</script>


<style scoped>
.pure-menu-list {
  border-bottom: 1px #dedede solid;
}
</style>
