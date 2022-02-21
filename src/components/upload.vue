<template>
  <div align="center">
    <form id="fform" enctype="multipart/form-data" method="post">
      <label for="fb">上传文件</label>
      <input id="fb" name="file" type="text" style="width: 300px" />
    </form>
    <el-button type="primary"
      >上传<i class="el-icon-upload el-icon--right" @click="startUpload"></i
    ></el-button>
  </div>
</template>

<script>
export default {
  name: "Upload",
  methods: {
    startUpload() {
      let _this = this;
      $("#fform").form("submit", {
        url: "<%=request.getContextPath()%>/file/upload",
        method: "post",
        onSubmit: function (param) {
          param.path = sessionStorage.getItem("hdfs");
        },
        success: function (data) {
          data = JSON.parse(data);
          _this.$message(data.msg);
          go();
        },
      });
    },
  },
};
</script>

<style>
</style>