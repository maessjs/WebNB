<template>
  <div class="container">
    <h1>Evaluator</h1>
    <div v-if="status && status.trainingDataUploaded">
      <p style="margin-top: -20px;">({{ status.trainingDataFilename }})</p>
      <wip />
    </div>
    <div v-else>
      <p><b>You need to <router-link to="/DataUpload">upload a file</router-link> with training data first.</b></p>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  
  import wip from '../components/wip.vue'

  export default {
    name: 'Evaluator',
    components: {
      wip
    },
    data() {
      return {
        status: null
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
      }
    }
  }
</script>