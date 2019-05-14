<template>
  <div>
  <h1>Testing Page</h1>
  <!-- reqests -->
  <div>
    <div class="box">
      <p>runs POST {{url1}}</p>
      <form submit.prevent>
        <input id="kInput" type="text" v-model.number="url1" />
        <button @click="req1">Run</button>
      </form>
    </div>
    <div class="box">
      <p>runs POST {{url2}}</p>
      <p>body:</p>
      <form submit.prevent>
        <input type="file" name="test-data" @change="onFileSelected">
        <button @click="req2">Run</button>
      </form>
    </div>
    <!-- response -->
    <div>
      <h4>Latest request:</h4>
      <p>Latest request (URL):</p>
      <p id="reqURLField">{{reqURL}}</p>
      <p>Latest response (JSON data):</p>
      <p id="resJSONField">{{resJSON}}</p>
    </div>
  </div>

  </div>
</template>

<script>
import axios from 'axios'
//import wip from '../components/wip.vue'

export default {
  name: 'Testing',
  components: {
    //wip
  },
  data () {
    return {
      url1: 'http://localhost:3000/api/test-cv?k=1',
      selectedFile: null,
      url2: 'http://localhost:3000/api/test-up',
      reqURL: ' ',
      resJSON: ' '
    }
  },
  methods: {
    req1() {
      console.log('this.kValue:', this.kValue)
      this.reqURL = this.url1
      this.resJSON = ''

      axios.post(this.reqURL)
      .then(res => {
        this.resJSON = JSON.stringify(res.data, null, 2)
      })
      .catch(err => console.log('err:', err))
    },
    onFileSelected(e) {
      this.selectedFile = e.target.files[0]
    },
    req2() {
      if (!this.selectedFile) return

      this.reqURL = this.url2
      this.resJSON = ''

      const fd = new FormData()
      fd.append('upload', this.selectedFile, this.selectedFile.name)

      axios.post(this.reqURL, fd)
        .then(res => { 
          if (res.status === 201) {
            this.resJSON = JSON.stringify(res.data, null, 2);
          }
        })
        .catch(err => console.log(err))
    },
    reset () {
      this.reqURL = ''
      this.resJSON = ''
    }
  }
}
</script>


<style scoped>
.box {
  display: inline-block;
  width: 295px;
}

#kInput {
  width: 100px;
}

#reqURLField {
  min-height: 20px;
  background-color: aliceblue;
}

#resJSONField {
  min-width: 400px;
  min-height: 200px;
  background-color: aliceblue;
}

</style>
