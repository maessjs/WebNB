<template>
  <div class="container">
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
    </div>

    <!-- results -->
    <div v-if="result">
      <h3>Confusion Matrix</h3>
      <SimpleTable class="simpletable" :content="result.confusion_matrix" />
      <br>
      <h3>Detailed Accuracy</h3>
      <SimpleTable class="simpletable" :content="result.detailed_accuracy" />
      <br>
      <h3>Result dataset (classified by WebNB)</h3>
      <SimpleTable class="simpletable" :content="result.first_15rows_results" />
      <p>. . .</p>
      <a href="">Download the whole dataset (as csv)</a>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import SimpleTable from '../components/SimpleTable.vue'

  export default {
    name: 'Testing',
    components: {
      SimpleTable
    },
    data() {
      return {
        url1part: 'http://localhost:3000/api/test-cv?k=',
        kValue: 3,
        url2: 'http://localhost:3000/api/test-up',
        selectedFile: null,
        result: null
      }
    },
    computed: {
      url1: function () {
        return this.url1part + this.kValue
      }
    },
    methods: {
      req1() {
        axios.post(this.url1)
          .then(res => {
            if (res.status === 200) {
              this.result = res.data
            }
          })
          .catch(err => console.log('err:', err))
      },
      onFileSelected(e) {
        this.selectedFile = e.target.files[0]
      },
      req2() {
        if (!this.selectedFile) return

        const fd = new FormData()
        fd.append('upload', this.selectedFile, this.selectedFile.name)

        axios.post(this.url2, fd)
          .then(res => {
            if (res.status === 202) {
              this.result = res.data
            }
          })
          .catch(err => console.log(err))
      }
    }
  }
</script>


<style scoped>
  .container {
    margin: 0 auto 50px auto;
    max-width: 90%;
  }

  .simpletable {
    margin: auto;
  }

  .box {
    display: inline-block;
    width: 295px;
  }

  #kInput {
    width: 100px;
  }
</style>