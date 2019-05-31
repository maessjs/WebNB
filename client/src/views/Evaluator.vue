<template>
  <div class="container">
    <h1>Evaluator</h1>
    <div v-if="status && status.trainingDataUploaded && attributes">
      <p style="margin-top: -20px;">(Model based on {{ status.trainingDataFilename }})</p>
      <br>
      <p>Enter data that you want to classify</p>
      <form class="pure-form pure-form-aligned" @submit.prevent>
        <fieldset>
          <span v-for="(attribute, index) in attributes" :index="index" :key="'form-' + attribute.name"
            class="pure-u-1 pure-u-md-1-3 form-part grid-container">
            <label class="grid-item grid-item--label" :for="'input-' + attribute.name">{{ attribute.name }}</label>
            <span class="grid-item">
              <input v-if="attribute.numerical" v-model="requestData[index]" :id="'input-' + attribute.name"
                class="grid-item grid-item--input" type="number" :step="attribute.float ? 'any' : 1">
              <select v-else v-model="requestData[index]" :id="'input-' + attribute.name"
                class="grid-item grid-item--input" type="number">
                <option v-for="option in attribute.options" :key="'option-' + option">
                  {{ option }}
                </option>
              </select>
            </span>
          </span>

          <div class="pure-controls button-wrapper">
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <button @click="classify" type="submit" class="pure-button pure-button-primary button">Submit</button>
          </div>
        </fieldset>
      </form>

      <!-- loader -->
      <div v-if="response_pending" class="loader"></div>

      <!-- result -->
      <h2 v-if="resultClass">Result: {{ resultClass }}</h2>

    </div>
    <div v-else-if="status && status.trainingDataUploaded">
      <p>Loading...</p>
    </div>
    <div v-else-if="status">
      <p><b>You need to <router-link to="/DataUpload">upload a file</router-link> with training data first.</b></p>
    </div>
    <div v-else class="loader"></div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Evaluator',
    components: {},
    data() {
      return {
        status: null,
        attributes: null,
        requestData: [],
        errorMessage: null,
        response_pending: false,
        resultClass: null
      }
    },
    created() {
      this.getStatus()
      this.getPossibleAttributes()
    },
    methods: {
      getStatus() {
        axios.get('api/status')
          .then(res => {
            if (res.status == 200) this.status = res.data
            else console.log('Invalid status response')
          })
          .catch(err => console.log(err))
      },
      getPossibleAttributes() {
        axios.get('api/fetch-attributes-specs')
          .then(res => {
            if (res.status == 200) this.attributes = res.data
          })
          .catch(err => console.log(err))
      },
      checkFields() {
        let valid = true

        this.attributes.forEach((attribute, index) => {

          if // case: numerical: must be a number
          (attribute.numerical &&
            Number.isInteger(parseInt(this.requestData[index])))
            if // case: !float: must have no decimals
            (!attribute.float && this.requestData[index] % 1 !== 0)
              valid = false
            else
              valid // do nothing
          else if // case: categorical - must be part of options
          (!attribute.numerical &&
          (typeof this.requestData[index] === 'string' || this.requestData[index] instanceof String) &&
          attribute.options.includes(this.requestData[index]))
            valid // do nothing
          else
            valid = false
        });

        return valid
      },
      classify() {
        this.errorMessage = null
        this.resultClass = null
        
        this.response_pending = true

        if (this.checkFields()) {
          console.log('this.requestData:', JSON.stringify(this.requestData, null, 2))
          axios.post('api/evaluate?testdata=' + JSON.stringify(this.requestData))
            .then(res => {
              if (res.status === 202) {
                this.response_pending = false
                this.resultClass = res.data
              }
              else this.errorMessage = 'There was an error. Please try again.'
            })
            .catch(err => console.log('err:', err))
        } else {
          this.errorMessage = 'Please check if all fields have valid entries.'
        }
      }
    }
  }
</script>

<style scoped>
  .container {
    margin-bottom: 60px;
  }

  .grid-container {
    max-width: 600px;
    margin: auto;
    display: grid;
    grid-template-columns: 200px 200px auto;
  }

  .grid-item {
    grid-area: span 1 / span 1;
    padding: 10px;
  }

  .grid-item--label {
    place-self: flex-end;
  }

  .grid-item--input {
    width: 100%;
    height: 40px;
  }

  .button {
    width: 170px;
  }

  .button-wrapper {
    margin: 20px auto;
  }

  .error {
    color: red;
  }
</style>