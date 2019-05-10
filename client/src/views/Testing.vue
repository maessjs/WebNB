<template>
  <div>
  <h1>Testing Page</h1>
  <!-- reqests -->
  <div>
    <div class="box">
      <p>runs POST {{url1}}</p>
      <button @click="req1">Run</button>
    </div>
    <div class="box">
      <p>runs POST {{url2 + kValue}}</p>
      <form submit.prevent>
        <input id="kInput" type="number" v-model.number="kValue" />
        <button @click="req2">Run</button>
      </form>
    </div>
    <div class="box">
      <p>runs POST {{url3}}</p>
      <p>body:</p>
      <form submit.prevent>
        <input type="file" name="test-data" @change="onFileSelected">
        <button @click="req3">Run</button>
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
      url1: 'http://localhost:3000/api/test?mode=ts',
      kValue: 5,
      url2: 'http://localhost:3000/api/test?mode=cv&k=',
      selectedFile: null,
      url3: 'http://localhost:3000/api/test?mode=up',
      reqURL: ' ',
      resJSON: ' '
    }
  },
  methods: {
    req1() {
      this.reqURL = this.url1

      axios.post(this.reqURL)
      .then(res => {
        this.resJSON = JSON.stringify(res.data, null, 2)
      })
      .catch(err => console.log('err:', err))
    },
    req2() {
      this.reqURL = this.url2

      axios.post(this.reqURL)
      .then(res => {
        this.resJSON = JSON.stringify(res.data, null, 2)
      })
      .catch(err => console.log('err:', err))
    },
    onFileSelected(e) {
      this.selectedFile = e.target.files[0]
    },
    req3() {
      if (!this.selectedFile) return

      this.reqURL = this.url3

      const fd = new FormData()
      fd.append('upload', this.selectedFile, this.selectedFile.name)

      axios.post('http://localhost:3000/api/test?mode=up', fd)
        .then(res => { 
          if (res.status === 201) {
            this.resJSON = JSON.stringify(res.data, null, 2)
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
  width: 264px;
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
