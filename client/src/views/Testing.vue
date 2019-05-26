<template>
  <div class="container">
    <h1>Testing Page</h1>
    <div v-if="status && status.trainingDataUploaded">
      <p style="margin-top: -20px;">(Model based on {{ status.trainingDataFilename }})</p>
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
        <div class="request-form request-form--center">
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
        <!-- Statistics tables only for testing/validation -->
        <span v-if="status.hasOriginalClass">
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
        </span>
        <!-- Prominent download button only for originally unclassified data -->
        <div v-else class="btn-wrapper" style="margin-top: 40px">
          <a href="http://localhost:3000/api/download-classified">
            <button class="btn btn-download">Download classified data</button>
          </a>
        </div>
        <!-- Table with first 15 rows of result dataset -->
        <h3>Result dataset</h3>
        <TableR class="Table" :content="result.first_15rows_results" />
        <p>. . .</p>
        <a href="http://localhost:3000/api/download-classified" class="download-link">Download the whole dataset (as
          csv)</a>
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
  import Table from '../components/Table.vue'
  import TableR from '../components/Table--result.vue'

  export default {
    name: 'Testing',
    components: {
      Table,
      TableR
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
              if (res.data.status) this.status = res.data.status
            }
          })
          .catch(err => console.log('err:', err))
      },
      req_up(e) {
        this.selectedFile = e.target.files[0]
        if (!this.selectedFile) return

        const fd = new FormData()
        fd.append('upload', this.selectedFile, this.selectedFile.name)

        axios.post(this.url2, fd)
          .then(res => {
            if (res.status === 202) {
              this.result = res.data
              if (res.data.status) this.status = res.data.status
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

  .request-block {
    margin-top: -50px;
    padding-bottom: 50px;
  }

  .request-form {
    width: 250px;
    display: inline-block;
    margin-top: 35px;
  }

  .request-form--center {
    margin-right: 50px;
    margin-left: 50px;
  }

  .request-form>form {
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

  .btn-download {
    border: 2px solid rgb(130, 165, 75);
    color: rgb(130, 165, 75);
    background-color: rgb(209, 247, 205);
  }

  .btn-wrapper input[type=file] {
    font-size: 100px;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
  }

  .download-link {
    color: black;
    text-decoration: underline;
  }
</style>