<template>
  <div class="container">
    <h1>Data Upload</h1>
    <img src="../assets/cloud.svg" alt="" height="200px">
    <!-- control forms -->
    <div v-if="status">
      <!-- upload form -->
      <form class="form" @submit.prevent>
        <div class="btn-wrapper">
          <button class="btn">Upload a file</button>
          <p>{{ message[0] }}</p>
          <p v-if="message[1]" style="margin-top: -15px;">{{ message[1] }}</p>
          <input type="file" name="training_data" @change="onFileSelected" />
        </div>
      </form>
      <!-- delete form -->
      <form v-if="status.trainingDataUploaded" class="form" @submit.prevent>
        <div class="btn-wrapper">
          <button class="btn btn-delete" @click="deleteData">Delete</button>
          <p>Done with this trainingset?</p>
          <p style="margin-top: -15px;">Leave nothing behind and delete all your data.</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DataUpload',
  data () {
    return {
      status: null,
      selectedFile: null
    }
  },
  computed: {
    message: function () {
      return (this.status && this.status.trainingDataUploaded) ? [`You have selected ${this.status.trainingDataFilename}.`, 'Click to upload a new file.'] : ['Select a file with training data and get going!']
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
    onFileSelected(e) {
      this.selectedFile = e.target.files[0]
      this.upload()
    },
    upload() {
      if (!this.selectedFile) return

      this.success = false

      const fd = new FormData()
      fd.append('upload', this.selectedFile, this.selectedFile.name)

      axios.post('http://localhost:3000/submit-form', fd)
        .then(res => { 
          if (res.status === 201) {
            this.success = true; 
            this.$router.push({ path: 'TrainingsetStatistics' })
          }
        })
        .catch(err => console.log(err))
    },
    deleteData () {
      axios.delete('http://localhost:3000/api/reset')
        .then(res => {
          if (res.status == 202) this.status = res.data
          else console.log('Invalid status response')
        })
        .catch(err => console.log(err))
    }
  }
}
</script>


<style scoped>

.form {
  width: 80%;
  padding: 10px;
  margin: 0 auto;
}

.btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.btn {
  border: 2px solid gray;
  color: gray;
  background-color: white;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
}

.btn-delete {
  border: 2px solid rgb(234, 86, 86);
  color: rgb(234, 86, 86);
  background-color: rgb(247, 205, 205);
}

.btn-wrapper input[type=file] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}

</style>
