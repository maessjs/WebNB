<template>
  <div class="container">
    <h1>Trainingset Statistics</h1>
    <div v-if="statisticsData">
      <div
        v-for="(attribute, index) in statisticsData"
        :key="'attribute' + index"
        :index="index"
      >
        <h3>{{ attribute.name }}</h3>
        <div class="grid-container">
          <bar-chart :datacollection="attribute.chartdata" class="grid-item" />
          <SimpleTable :content="mockTableData" class="grid-item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

import BarChart from '../components/BarChart.vue'
import SimpleTable from '../components/SimpleTable.vue'

export default {
  name: 'TrainingsetStatistics',
  components: {
    BarChart,
    SimpleTable
  },
  data () {
    return {
      statisticsData: null,
      colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959'],
      mockTableData: [["This is", "Mock", "Table", "Data"], ["no", 1, null, 0]]
    }
  },
  mounted () {
    this.fetchChartData()
  },
  methods: {
    fetchChartData() {
      axios.get('http://localhost:3000/api/fetch-evidence-for-chart')
      .then(res => {
        console.log('res.data:', JSON.stringify(res.data, null, 2))

        const statisticsData = {}

        for (const attribute in res.data) {
          statisticsData[attribute] = {
              name: attribute.substring(0, 1).toUpperCase() + attribute.substring(1)
            }

          statisticsData[attribute].chartdata = {
            labels: res.data[attribute].labels,
            datasets: 
              [{
                label: 'All',
                backgroundColor: this.colors,
                pointBackgroundColor: 'white',
                borderWidth: 1,
                pointBorderColor: '#249EBF',
                data: res.data[attribute].values
              }]
          }
        }
        
        console.log('statisticsData:', JSON.stringify(statisticsData, null, 2))
        this.statisticsData = statisticsData
      })
      .catch(err => console.log('err:', err))
    }
  }
}
</script>

<style scoped>

.container {
  margin: 0 auto;
  max-width: 800px;
}

.grid-container {
  display: grid;
  grid-template-columns: 50% 50%;
}

.grid-item {
  grid-area: span 1 / span 1;
  padding: 15px;
  place-self: center;
}

</style>
