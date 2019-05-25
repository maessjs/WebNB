<template>
  <div class="container">
    <h1>Evaluator</h1>
    <div v-if="status && status.trainingDataUploaded">
      <p style="margin-top: -20px;">({{ status.trainingDataFilename }})</p>


      <form class="pure-form pure-form-aligned" @submit.prevent >
        <fieldset>
            <div
              v-for="(attribute, index) in attributes"
              :index="index"
              :key="'form-' + attribute.name"
              class="pure-u-1 pure-u-md-1-3 form-part"
            >
              <label :for="'input-' + attribute.name">{{ attribute.name }}</label>
              <span v-if="attribute.numerical">
                <input v-model="requestData[index]" :id="'input-' + attribute.name" class="input-slim" type="number">
              </span>
              <span v-else>
                <select v-model="requestData[index]" :id="'input-' + attribute.name" class="input-slim" type="number">
                  <option v-for="option in attribute.options" :key="'option-' + option">
                    {{ option }}
                  </option>
                </select>
              </span>
            </div>

          <div class="pure-controls">
            <button @click="classify" type="submit" class="pure-button pure-button-primary">Submit</button>
          </div>
        </fieldset>
      </form>

      <!-- result -->
      <h2 v-if="resultClass">Result: {{ resultClass }}</h2>

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
        status: null,
        attributes: [{
            name: 'maritial_status',
            numerical: false,
            options: ['single', 'married', 'divorced']
          },
          {
            name: 'age',
            numerical: true
          },
          {
            name: 'something_else',
            numerical: false,
            options: ['yes', 'no']
          }
        ],
        requestData: [],
        resultClass: null
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
      classify() {
        axios.post('https://reqres.in/api/users', this.requestData)
          .then(res => {
            console.log('this.requestData:', JSON.stringify(this.requestData, null, 2))
            console.log('res:', JSON.stringify(res, null, 2))
            this.resultClass = 'Yes'
          })
          .catch(err => console.log('err:', err))
      }
    }
  }
</script>

<style scoped>
.input-slim {
  width: 120px;
}

label {
  padding-right: 20px;
}

fieldset {
  align-content: flex-end
}

</style>
