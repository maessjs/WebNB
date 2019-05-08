<template>
  <div>
    <h1>Trainingset Statistics</h1>
    <div v-if="chartdata" class="grid-container">
      <div
        v-for="(chart, index) in chartdata"
        :key="'attribute' + index"
        :index="index"
        class="grid-item"
      >
        <h3>{{ chart.name }}</h3>
        <bar-chart :datacollection="chart" />

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

import BarChart from '../charts/BarChart.vue'

export default {
  name: 'TrainingsetStatistics',
  components: {
    BarChart
  },
  data () {
    return {
      chartdata: {},
      colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959']
    }
  },
  mounted () {
    this.fetchData()
  },
  methods: {
    fetchData() {
      axios.get('http://localhost:3000/fetch-data')
      .then(res => {
        this.generateChartData(res.data)
      })
      .catch(err => console.log('err:', err))
    },
    generateChartData(fetchedData) {
      const data = {}
      
      fetchedData.forEach(instance => {
        for (const key in instance) {
          if (instance.hasOwnProperty(key)) {
            if (data[key]) data[key].push(instance[key])
            else data[key] = [instance[key]]
          }
        }
      })

      const chartdata = {}

      for (const attribute in data) {

        const numberOfOccurences = {}

        data[attribute].forEach(answer => {
          if (numberOfOccurences[answer]) numberOfOccurences[answer]++
            else numberOfOccurences[answer] = 1
        });

        const labels = []
        const values = []

        for (const label in numberOfOccurences) {
          if (numberOfOccurences.hasOwnProperty(label)) {
            labels.push(label)
            values.push(numberOfOccurences[label])
          }
        }

        chartdata[attribute] = {
          name: attribute.substring(0, 1).toUpperCase() + attribute.substring(1),
          labels,
          datasets: 
            [{
              label: '#',
              backgroundColor: this.colors,
              pointBackgroundColor: 'white',
              borderWidth: 1,
              pointBorderColor: '#249EBF',
              data: values
            }]
        }
      }

      this.chartdata = chartdata
    }
  }
}
</script>

<style scoped>

.grid-container {
  display: grid;
  grid-template-columns: 50% 50%;
}

.grid-item {
  grid-area: span 1 / span 1;
  padding: 15px;
}

</style>
