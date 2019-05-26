<script>
  import { Doughnut } from 'vue-chartjs'
  
  export default {
    extends: Doughnut,
    props: {
      confusion_matrix: {
        type: Array,
        default: null
      }
    },
    computed: {
      chartdata: function () {
        return {
          datasets: [{
            data: [this.confusion_matrix[1][1], this.confusion_matrix[2][2], this.confusion_matrix[2][1], this.confusion_matrix[1][2]],
            backgroundColor: ['#62965F', '#4A7047', '#B2192D', '#8B1423']
          }],
          labels: [
            'TP',
            'TN',
            'FP',
            'FN'
          ]
        };
      }
    },
    mounted () {
      this.renderChart(this.chartdata, {})
    }
  }
</script>