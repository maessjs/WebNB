<template>
  <div>
  <h1>Testing Page</h1>
  <!-- reqests -->
  <div>
    <div class="box">
      <p>runs POST {{url1}}</p>
      <input id="kInput" type="number" v-model.number="kValue" />
      <button @click="req1">Run</button>
    </div>
    <div class="box">
      <p>runs POST {{url2}}</p>
      <p>body:</p>
      <input type="file" name="test-data" @change="onFileSelected">
      <button @click="req2">Run</button>
    </div>
    <div>
      <h4>Latest request:</h4>
      <p>Latest request (URL):</p>
      <p id="reqURLField">{{reqURL}}</p>
      <p>Latest response (JSON data):</p>
      <p id="resJSONField">{{resJSON}}</p>
    </div>
  </div>

  <Table v-if="confusion_matrix" :head="['Class', 'Yes', 'No']" :body="[['Yes', confusion_matrix.yes.yes, confusion_matrix.yes.no], ['No', confusion_matrix.no.yes, confusion_matrix.no.no]]"/>
  </div>
</template>

<script>
import axios from 'axios'
import Table from '../components/Table.vue'
//import wip from '../components/wip.vue'

export default {
  name: 'Testing',
  components: {
    //wip 
    Table
  },
  data () {
    return {
      url1part: 'http://localhost:3000/api/test-cv?k=',
      kValue: 1,
      selectedFile: null,
      url2: 'http://localhost:3000/api/test-up',
      reqURL: '',
      resJSON: '',
      resultData: [],
      correctness: {},
      detailed_accuracy: [],
      confusion_matrix: null
    }
  },
  computed: {
    url1: function () {
      return this.url1part + this.kValue
    }
  },
  methods: {
    req1() {
      console.log('this.url1:', this.url1)
      this.reqURL = this.url1
      this.resJSON = ''

      axios.post(this.reqURL)
      .then(res => {
        this.resJSON = res.data
        this.confusion_matrix = res.data.confusion_matrix
        console.log('this.confusion_matrix:', JSON.stringify(this.confusion_matrix.yes.yes, null, 2))
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
          if (res.status === 202) {
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
