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
            <Table :content="attribute.table" class="grid-item" style="tr:last-child { font-weight: bold; }" />
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
  import Table from '../components/Table--last-row-bold.vue'

  export default {
    name: 'TrainingsetStatistics',
    components: {
      BarChart,
      BoxPlotChart,
      Table
    },
    data() {
      return {
        status: null,
        statisticsData: null,
        colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959']
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

            for (const key in res.data) {
              // console.log('res.data:', JSON.stringify(res.data, null, 2))
              statisticsData[key] = {
                name: key.substring(0, 1).toUpperCase() + key.substring(1),
                table: res.data[key].table
              }

              if (res.data[key].labels) {
                statisticsData[key].isNumerical = false
                statisticsData[key].chartdata = {
                  labels: res.data[key].labels,
                  datasets: [{
                      label: "All instances",
                      backgroundColor: this.colors[0],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: res.data[key].values
                    },
                    {
                      label: "Class Yes",
                      backgroundColor: this.colors[1],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: res.data[key].yes
                    },
                    {
                      label: "Class No",
                      backgroundColor: this.colors[2],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: res.data[key].no
                    }
                  ]
                }
              } else {
                statisticsData[key].isNumerical = true
                statisticsData[key].chartdata = {
                  labels: ['#'],
                  datasets: [{
                      label: "All instances",
                      backgroundColor: this.colors[0],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: [res.data[key].values.map(Number)]
                    },
                    {
                      label: "Class Yes",
                      backgroundColor: this.colors[1],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: [res.data[key].yes.map(Number)]
                    },
                    {
                      label: "Class No",
                      backgroundColor: this.colors[2],
                      pointBackgroundColor: 'white',
                      borderWidth: 1,
                      pointBorderColor: '#249EBF',
                      data: [res.data[key].no.map(Number)]
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