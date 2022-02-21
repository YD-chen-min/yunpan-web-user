<template>
  <div class="share">
    共享链接
    <el-input
      v-model="link"
      placeholder="请输入链接"
      style="width: 30%; padding: 0 10px"
    ></el-input>
    <el-button
      type="primary"
      icon="el-icon-download"
      circle
      @click="downloadShare"
    ></el-button>
  </div>
</template>

<script>
export default {
  name: "Share",
  data() {
    return {
      link: "",
      HOST: "http://localhost:10001/",
    };
  },
  methods: {
    downloadShare() {
      let url = this.HOST + "file/share/download?path=" + this.link;
      let link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      document.body.appendChild(link);
      link.click();
    },
  },
};
</script>

<style scoped>
.share {
  border-radius: 30px;
  padding: 20px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}
</style>