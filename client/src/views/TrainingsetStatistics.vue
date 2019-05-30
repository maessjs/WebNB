<template>
  <div class="container">
    <h1>Trainingset Statistics</h1>
    <div v-if="status && status.trainingDataUploaded">
      <p style="margin-top: -20px;">({{ status.trainingDataFilename }})</p>
      <div v-if="statisticsData">
        <div v-for="(attribute, index) in statisticsData" :key="'attribute' + index" :index="index">
          <h3>{{ attribute.name }}</h3>
          <p class="typeinfo">{{ attribute.isNumerical ? '(numerical)' : '(categorical)' }}</p>
          <!-- categorical -> histogram + table -->
          <div v-if="!attribute.isNumerical" class="grid-container">
            <BarChart class="grid-item" :datacollection="attribute.chartdata" />
            <Table :content="attribute.table" class="grid-item" style="tr:last-child { font-weight: bold; }" />
          </div>
          <!-- numerical -> boxplot + table + histogram -->
          <div v-else class="grid-container grid-container--big">
            <BoxPlotChart class="grid-item" :chart-data="attribute.boxplotdata" />
            <Table :content="attribute.table" class="grid-item" style="tr:last-child { font-weight: bold; }" />
            <BarChart class="grid-item" :datacollection="attribute.histogramdata" />
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="status">
      <p><b>You need to <router-link to="/DataUpload">upload a file</router-link> with training data first.</b></p>
    </div>
    <div v-else>
      <p>Loading ...</p>
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
        colors: ['#233142', '#4f9da6', '#facf5a', '#ff5959', '#233142', '#4f9da6', '#facf5a', '#ff5959']
      }
    },
    watch: {
      status: function () {
        if (this.status && this.status.trainingDataUploaded) this.fetchChartData()
      }
    },
    created() {
      this.getStatus()
    },
    methods: {
      getStatus() {
        axios.get('api/status')
          .then(res => {
            if (res.status == 200) this.status = res.data
            else console.log('Invalid status response')
          })
          .catch(err => console.log(err))
      },
      fetchChartData() {
        axios.get('api/fetch-evidence-for-chart')
          .then(res => {
            const statisticsData = {}

            for (const key in res.data) {
              statisticsData[key] = {
                name: key.substring(0, 1).toUpperCase() + key.substring(1),
                table: res.data[key].table
              }

              if (res.data[key].labels) {
                // categorical --> histogram + table
                statisticsData[key].isNumerical = false
                statisticsData[key].chartdata = {
                  labels: res.data[key].labels,
                  datasets: []
                }
                res.data[key].classes.forEach((c, index) => {
                  statisticsData[key].chartdata.datasets.push({
                    label: this.nameToLabel(c.name),
                    backgroundColor: this.colors[index],
                    pointBackgroundColor: 'white',
                    borderWidth: 1,
                    pointBorderColor: '#249EBF',
                    data: c.values
                  })
                });
              } else {
                // numerical --> boxplot + table
                statisticsData[key].isNumerical = true
                statisticsData[key].boxplotdata = {
                  labels: ['#'],
                  datasets: []
                }
                res.data[key].classes.forEach((c, index) => {
                  statisticsData[key].boxplotdata.datasets.push({
                    label: this.nameToLabel(c.name),
                    backgroundColor: this.colors[index],
                    borderColor: 'black',
                    pointBackgroundColor: 'white',
                    borderWidth: 1,
                    pointBorderColor: '#249EBF',
                    data: [c.values.map(Number)]
                  })
                });

                statisticsData[key].histogramdata = {
                  labels: res.data[key].histogram.labels,
                  datasets: [{
                    label: 'All instances',
                    backgroundColor: this.colors[0],
                    pointBackgroundColor: 'white',
                    borderWidth: 1,
                    pointBorderColor: '#249EBF',
                    data: res.data[key].histogram.values
                  }]
                }
              }
            }
            this.statisticsData = statisticsData
          })
          .catch(err => console.log('err:', err))
      },
      nameToLabel(name) {
        if (name == 'All') return 'All instances'
        else return 'Class ' + name
      }
    }
  }
</script>

<style scoped>
  /* .container {
    margin: 0 auto;
    max-width: 800px;
  } */

  .grid-container {
    display: grid;
    grid-template-columns: 50% 50%;
    margin: 0 auto;
    max-width: 800px;
  }

  .grid-container--big {
    grid-template-columns: 33% 33% 33%;
    max-width: 1200px;
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