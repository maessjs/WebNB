<template>
  <div>
    <br>
    <img height="300px" alt="WebNB Logo" src="../assets/robot.png">
    <h2>Welcome to WebNB!</h2>
    <p>An easy-to-use online Naive Bayes application.</p>
    <p><b>Start by <router-link to="/DataUpload">uploading a file</router-link> with training data!</b></p>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script>

<style>
a:visited {
  color: #2c3e50;
}
</style>
