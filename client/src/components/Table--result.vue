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
    name: 'Table--result',
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
    font-weight: bold;
    background-color: #4f9da6b7;
  }

  tr > td:nth-last-of-type(2) {
    font-weight: bold;
    background-color: #facf5ab7;
  }

</style>

colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959']