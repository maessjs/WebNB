<template>
  <div class="small-container">
    <br>
    <img height="300px" alt="WebNB Logo" src="../assets/robot.png">
    <h2>Welcome to WebNB!</h2>
    <p>An easy-to-use online Naive Bayes application.</p>
    <p><b>Start by <router-link to="/DataUpload">uploading a file</router-link> with training data!</b></p>
    <br>
    <p class="info">
      Getting started:
      <br>
      WebNB supports interchangeble datasets from various industries and usecases, with categorical, numerical and
      floating number attributes, as well as sets with binary or multiple classes.
      <br>
      The training and test sets used must be in the csv-format, the last column being the class of the instance.
      <br>
      To get going you can use these <a
        href="/api/download-sample?fileName=bank-comma-198-supervised-train158.csv">training</a> and <a
        href="/api/download-sample?fileName=bank-comma-198-supervised-test40.csv">test</a> sets, displaying an usecase
      in the banking industrie.
    </p>
  </div>
</template>

<script>
  export default {
    name: 'Welcome'
  }
</script>

<style>
  .small-container {
    width: 600px;
    margin: auto;
  }

  a {
    color: #2c3e50;
  }

  a:visited {
    color: #2c3e50;
  }

  .info {
    font-size: 12px;
    color: #909090;
  }
</style>