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
          <BarChart :datacollection="attribute.chartdata" class="grid-item" />
          <SimpleTable :content="attribute.table" class="grid-item" />
        </div>
      </div>
    </div>
    <!-- <BoxPlotChart class="grid-item" :chart-data="bpdata1" /> -->
  </div>
</template>

<script>
import axios from 'axios'

import BarChart from '../components/BarChart.vue'
// import BoxPlotChart from '../components/BoxPlotChart.js'
import SimpleTable from '../components/SimpleTable.vue'

export default {
  name: 'TrainingsetStatistics',
  components: {
    BarChart,
    // BoxPlotChart,
    SimpleTable
  },
  data () {
    return {
      statisticsData: null,
      colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959'],
      bpdata1: {
        labels: ['#'],
        datasets: [
          {
            label: "All",
            backgroundColor: "#f87979",
            data: [[2,45,65,42,1,3,8,55,43,22,11,4,6,7,4,2,1,4,6]]
          },
          {
            label: "Y",
            backgroundColor: "blue",
            data: [[43,22,11,4,6,7,4,2,1,4,6]]
          },
          {
            label: "n",
            backgroundColor: "blue",
            data: [[2,45,65,42,1,3,8,55]]
          }
        ]
      },
      bpdata2: {
        labels: ['#'],
        datasets: [
          {
            label: "All",
            backgroundColor: "#f87979",
            data: [[2,45,65,42,1,3,8,55,43,22,11,4,6,7,4,2,1,4,6]]
          }
        ]
      }
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
          console.log('res.data[attribute]:', JSON.stringify(res.data[attribute], null, 2))

          statisticsData[attribute] = {
              name: attribute.substring(0, 1).toUpperCase() + attribute.substring(1),
              table: res.data[attribute].table
            }

          

          if (isNaN(res.data[attribute].labels[0])) {
            statisticsData[attribute].isNumerical = true
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
          else {
            statisticsData[attribute].isNumerical = true
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

          
        }

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
