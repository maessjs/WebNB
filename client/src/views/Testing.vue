<template>
  <div class="container">
    <h1>Testing Page</h1>
    <div v-if="status && status.trainingDataUploaded">
      <p style="margin-top: -20px;">({{ status.trainingDataFilename }})</p>
      <!-- Run tests -->
      <div class="request-block">
        <!-- Whole dataset -->
        <div class="request-form">
          <form @submit.prevent class="pure-form">
            <fieldset>
              <legend>
                Use the training set
                <br>
                for testing
              </legend>
              <button @click="req_cv(1)" type="submit" class="pure-button pure-button-primary"
                style="width: 60px">Run</button>
            </fieldset>
          </form>
          <p class="invisible">.</p>
        </div>
        <!-- K-fold -->
        <div class="request-form">
          <form @submit.prevent class="pure-form">
            <fieldset>
              <legend>
                Choose number of folds
                <br>
                for Cross-validation
              </legend>
              <input v-model.number="kValue" type="number" style="width: 60px; margin-right: 5px" placeholder="k">
              <button @click="req_cv(kValue)" type="submit" class="pure-button pure-button-primary"
                style="width: 60px">Run</button>
            </fieldset>
          </form>
          <p class="invisible">.</p>
        </div>
        <!-- Upload testset -->
        <div class="request-form">
          <form @submit.prevent class="pure-form">
            <fieldset>
              <legend>
                Supply data for testing,
                <br>
                validation and classification
              </legend>
              <div class="btn-wrapper">
                <button class="btn">Upload a file</button>
                <input type="file" name="training_data" @change="req_up" />
              </div>
            </fieldset>
          </form>
          <p class="invisible">.</p>
        </div>
      </div>

      <!-- results -->
      <div v-if="result">
        <div class="box">
          <h3>Confusion Matrix</h3>
          <Table class="Table" :content="result.confusion_matrix" />
        </div>
        <div class="box">
          <h3>Correctness</h3>
          <Table class="Table" :content="result.correctness" />
        </div>
        <br>
        <h3>Detailed Accuracy</h3>
        <Table class="Table" :content="result.detailed_accuracy" />
        <br>
        <h3>Result dataset (classified by WebNB)</h3>
        <Table class="Table" :content="result.first_15rows_results" />
        <p>. . .</p>
        <a href="">Download the whole dataset (as csv)</a>
      </div>
    </div>
    <div v-else>
      <p><b>You need to <router-link to="/DataUpload">upload a file</router-link> with training data first.</b></p>
    </div>
  </div>

</template>

<script>
  import axios from 'axios'
  import Table from '../components/Table.vue'

  export default {
    name: 'Testing',
    components: {
      Table
    },
    data() {
      return {
        status: null,
        url1part: 'http://localhost:3000/api/test-cv?k=',
        kValue: 10,
        url2: 'http://localhost:3000/api/test-up',
        selectedFile: null,
        result: null
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
      req_cv(k) {
        axios.post(this.url1part + k)
          .then(res => {
            if (res.status === 200) {
              this.result = res.data
            }
          })
          .catch(err => console.log('err:', err))
      },
      req_up() {
        this.selectedFile = e.target.files[0]
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

  .Table {
    margin: auto;
  }

  .box {
    display: inline-block;
    width: 295px;
    margin: auto;
  }

  .request-form {
    width: 250px;
    display: inline-block;
  }

  .request-block > div {
    margin-right: 50px;
  }

  .request-block:last-child {
    margin-right: 0;
  }

  .request-form > form {
    padding-top: 20px;
    height: 60px;
  }

  .invisible {
    font-size: 0%;
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