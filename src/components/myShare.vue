<template>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="url" label="路径" width="300"> </el-table-column>
    <el-table-column prop="name" label="文件名" width="300"> </el-table-column>
    <el-table-column prop="size" label="文件大小" width="300">
    </el-table-column>
    <el-table-column prop="type" label="文件类型" width="300">
    </el-table-column>
    <el-table-column prop="downloadCount" label="下载次数" width="300">
    </el-table-column>

    <el-table-column label="操作" width="100">
      <template slot-scope="scope">
        <el-button @click="handleClick(scope.row)" type="text" size="small"
          >取消共享</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "MyShare",
  data() {
    return {
      tableData: [],
      HOST: "http://localhost:10001/",
    };
  },
  created() {
    let _this = this;
    _this.$http
      .get(_this.HOST + "share/getFileList", {
        params: {
          user: sessionStorage.getItem("user"),
        },
      })
      .then((res) => {
        if (res.body.code == 0) {
          _this.tableData = res.body.data;
        } else {
          _this.$message({
            showClose: true,
            message: res.body.msg,
            type: "error",
          });
        }
      });
  },
  methods: {
    getShareFileList() {
      let _this = this;
      _this.$http
        .get(_this.HOST + "share/getFileList", {
          params: {
            user: sessionStorage.getItem("user"),
          },
        })
        .then((res) => {
          if (res.body.code == 0) {
            _this.tableData = res.body.data;
          } else {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "error",
            });
          }
        });
    },
    handleClick(row) {
      // console.log(row);
      let _this = this;
      _this.$http
        .post(
          _this.HOST + "share/cancel",
          {
            user: sessionStorage.getItem("user"),
            url: row.url,
          },
          { emulateJSON: true }
        )
        .then((res) => {
          if (res.body.code == 0) {
            this.$message({
              showClose: true,
              message: res.body.msg,
              type: "success",
            });
            _this.getShareFileList();
          } else {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "error",
            });
          }
        });
    },
  },
};
</script>

<style>
</style>