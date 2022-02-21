<template style="width: 100%; height: 100%;position: absolute;">
  <div id="app" style="width: 100%; height: 100%; position: absolute">
    <home></home>
  </div>
</template>


<script>
import router from "../src/router/index.js";
const HOST = "http://localhost:10001/";
import Home from "../src/views/Home";
export default {
  name: "App",
  router,
  components: { Home },
};
</script>
