<template>
  <div>
    <div class="header">
      <el-date-picker
        v-model="selectTime"
        type="date"
        placeholder="选择日期"
        format="yyyy 年 MM 月 dd 日"
        value-format="yyyy-MM-dd"
      >
      </el-date-picker>
      <el-button icon="el-icon-search" circle @click="selectData"></el-button>
      <el-button
        type="primary"
        icon="el-icon-refresh-right"
        circle
        @click="loadHis"
      ></el-button>
      <el-button
        type="primary"
        icon="el-icon-download"
        circle
        @click="downloadLog"
      ></el-button>
    </div>
    <el-table :data="selectedData" border style="width: 100%; height: 100%">
      <el-table-column prop="time" label="日期" width="350"> </el-table-column>
      <el-table-column prop="option" label="操作" width="1250">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "Logger",
  data() {
    return {
      tableData: [],
      HOST: "http://localhost:10001/",
      selectTime: "",
      selectedData: [],
    };
  },
  created() {
    let _this = this;
    _this.$http
      .get(_this.HOST + "log/get/user", {
        params: {
          user: sessionStorage.getItem("user"),
        },
      })
      .then((res) => {
        _this.tableData = res.body.data;
        _this.selectedData = res.body.data;
      });
  },
  methods: {
    loadHis() {
      let _this = this;
      _this.$http
        .get(_this.HOST + "log/get/user", {
          params: {
            user: sessionStorage.getItem("user"),
          },
        })
        .then((res) => {
          _this.tableData = res.body.data;
          _this.selectData = res.body.data;
        });
    },
    selectData() {
      let tableData = [];
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].time.includes(this.selectTime)) {
          tableData.push(this.tableData[i]);
        }
      }
      this.selectedData = tableData;
    },
    downloadLog() {
      let url =
        this.HOST + "log/user/download?user=" + sessionStorage.getItem("user");
      const iframe = document.createElement("iframe");
      iframe.style.display = "none"; // 防止影响页面
      iframe.style.height = 0; // 防止影响页面
      iframe.src = url;
      document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  flex-flow: row nowrap;

  width: 100%;
}
</style>