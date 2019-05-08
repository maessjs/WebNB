<template>
  <div class="container">
    <h1>Data Upload</h1>
    <img src="../assets/cloud.svg" alt="" height="200px">
    <form class="upload-form" @submit.prevent>
      <div class="upload-btn-wrapper">
        <button class="btn">Upload a file</button>
        <p>{{message}}</p>
        <input type="file" name="training_data" @change="onFileSelected" />
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DataUpload',
  data () {
    return {
      selectedFile: null,
      message: 'Select a file with training data'
    }
  },
  methods: {
    onFileSelected(e) {
      this.selectedFile = e.target.files[0]
      if (this.selectedFile.name) this.message = this.selectedFile.name + ' uploaded!'
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
            this.$router.push({ path: 'DataStatistics' })
          }
        })
        .catch(err => console.log(err))
    }
  }
}
</script>


<style scoped>

.upload-form {
  width: 80%;
  padding: 10px;
  margin: 0 auto;
}

.upload-btn-wrapper {
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

.upload-btn-wrapper input[type=file] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}

</style>
