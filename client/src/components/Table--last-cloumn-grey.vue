<template>
  <table class="pure-table pure-table-bordered">
    <thead>
      <tr>
        <th v-for="(field, index) in head" :key="index">{{field}}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in body" :key=index>
        <td v-for="(field, index) in row" :key="index">{{field}}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
  export default {
    name: 'Table--last-cloumn-grey',
    props: {
      content: Array
    },
    computed: {
      head: function () {
        return this.content[0]
      },
      body: function () {
        return this.content.slice(1)
      }
    },
  }
</script>

<style scoped>
  tr > td:last-of-type {
    background-color: #f1f1f1;
  }
</style>