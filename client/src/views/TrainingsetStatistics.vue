<template>
  <div class="container">
    <h1>Trainingset Statistics</h1>
    <div v-if="status && status.trainingDataUploaded">
      <p style="margin-top: -20px;">({{ status.trainingDataFilename }})</p>
      <div v-if="statisticsData">
        <div v-for="(attribute, index) in statisticsData" :key="'attribute' + index" :index="index">
          <h3>{{ attribute.name }}</h3>
          <p class="typeinfo">{{ attribute.isNumerical ? '(numerical)' : '(categorical)' }}</p>
          <div class="grid-container">
            <BarChart v-if="!attribute.isNumerical" class="grid-item" :datacollection="attribute.chartdata" />
            <BoxPlotChart v-else class="grid-item" :chart-data="attribute.chartdata" />
            <SimpleTable :content="attribute.table" class="grid-item" />
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p><b>You need to <router-link to="/DataUpload">upload a file</router-link> with training data first.</b></p>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  import BarChart from '../components/BarChart.vue'
  import BoxPlotChart from '../components/BoxPlotChart.js'
  import SimpleTable from '../components/SimpleTable.vue'

  export default {
    name: 'TrainingsetStatistics',
    components: {
      BarChart,
      BoxPlotChart,
      SimpleTable
    },
    data() {
      return {
        status: null,
        statisticsData: null,
        colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959'],
        boxplotMockData: {
          all: [2, 45, 65, 42, 1, 3, 8, 55, 43, 22, 11, 4, 6, 7, 4, 2, 1, 4, 6],
          yes: [43, 22, 11, 4, 6, 7, 4, 2, 1, 4, 6],
          no: [2, 45, 65, 42, 1, 3, 8, 55]
        }
      }
    },
    watch: {
      status: function() {
        if (this.status && this.status.trainingDataUploaded) this.fetchChartData()
      }
    },
    created() {
      this.getStatus()
    },
    methods: {
      getStatus() {
        axios.get('http://localhost:3000/api/status')
          .then(res => {
            if (res.status == 200) this.status = res.data
            else console.log('Invalid status response')
          })
          .catch(err => console.log(err))
      },
      fetchChartData() {
        axios.get('http://localhost:3000/api/fetch-evidence-for-chart')
          .then(res => {
            const statisticsData = {}

            for (const attribute in res.data) {
              statisticsData[attribute] = {
                name: attribute.substring(0, 1).toUpperCase() + attribute.substring(1),
                table: res.data[attribute].table
              }

              if (isNaN(res.data[attribute].labels[0])) {
                statisticsData[attribute].isNumerical = false
                statisticsData[attribute].chartdata = {
                  labels: res.data[attribute].labels,
                  datasets: [{
                      label: "All instances",
                      backgroundColor: this.colors[0],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: res.data[attribute].values
                    },
                    {
                      label: "class Yes",
                      backgroundColor: this.colors[1],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: res.data[attribute].values
                    },
                    {
                      label: "Class No",
                      backgroundColor: this.colors[2],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: res.data[attribute].values
                    }
                  ]
                }
              } else {
                statisticsData[attribute].isNumerical = true
                statisticsData[attribute].chartdata = {
                  labels: ['#'],
                  datasets: [{
                      label: "All instances",
                      backgroundColor: this.colors[0],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: [this.boxplotMockData.all]
                    },
                    {
                      label: "Class Yes",
                      backgroundColor: this.colors[1],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: [this.boxplotMockData.yes]
                    },
                    {
                      label: "Class No",
                      backgroundColor: this.colors[2],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: [this.boxplotMockData.no]
                    }
                  ]
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

  .typeinfo {
    margin-top: -15px;
  }
</style>