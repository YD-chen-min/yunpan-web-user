<template>
  <div class="box">
    <div class="myHeader">
      <el-button-group style="border-radius: 15px">
        <el-button
          type="primary"
          icon="el-icon-refresh-left"
          @click="restoreFile"
          >还原</el-button
        >
        <el-button type="primary" icon="el-icon-close" @click="myDelete"
          >删除</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-folder-checked"
          @click="
            () => {
              checking = true;
              selectFiles();
            }
          "
          >多项操作</el-button
        >
        <el-button
          v-if="isChoosed"
          type="primary"
          icon=" 
el-icon-close"
          @click="
            () => {
              if (checking == true) {
                selectFiles();
                checking = false;
              }

              isChoosed = false;
              select = -1;
            }
          "
          >取消</el-button
        >
      </el-button-group>
    </div>
    <div class="filePath">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item v-for="(item, i) in filePath" :key="i"
          ><b @click="mygo(i)">{{ item }}</b></el-breadcrumb-item
        >
      </el-breadcrumb>
    </div>
    <div class="filePanes">
      <el-empty
        description="暂无文件"
        style="width: 100%; height: 100%"
        v-if="files.length == 0"
      ></el-empty>
      <div v-for="(item, i) in files" :key="i" class="file">
        <img
          :src="require('../assets/file/' + item.type + '.png')"
          :title="
            '名称：' +
            item.name +
            '文件大小:' +
            item.size +
            '最后修改时间' +
            item.lastModifyTime +
            '文件类型：' +
            item.type
          "
          @click="choose(i)"
        />
        <textarea
          class="fileName"
          :value="item.name"
          @focus="showAllName($event)"
          @blur="showShortName($event)"
          readonly
        ></textarea>
        <input
          type="checkbox"
          disabled="true"
          hidden="true"
          ref="fileName"
          unchecked
          :value="i"
        />
      </div>
    </div>
  </div>
</template>

<script>
var Base64 = require("js-base64").Base64;
export default {
  name: "Garbage",
  data() {
    return {
      isChoosed: false,
      filePath: [],
      files: [],
      checkedFiles: [],
      isIndeterminate: true,
      HOST: "http://localhost:10001/",
      oldName: "",
      newName: "",
      form: {
        dir: "",
        moveTo: "",
      },
      dialogFormVisible: false,
      select: -1,
      checking: false,
    };
  },

  created() {
    let _this = this;
    _this.filePath.push(sessionStorage.getItem("user"));
    _this.$http
      .get(_this.HOST + "file/garbage/get", {
        params: {
          user: sessionStorage.getItem("user"),
          path: _this.filePath.join("/") + "/",
        },
      })
      .then((res) => {
        _this.files = res.body.data;
      });
  },
  methods: {
    restoreFile() {
      if (this.select == -1) {
        this.restoreFiles();
      } else {
        let url = this.files[this.select].url;
        let _this = this;
        _this.$http
          .get(_this.HOST + "restore/file", {
            params: {
              user: sessionStorage.getItem("user"),
              url: url,
            },
          })
          .then((res) => {
            _this.$message(res.body.msg);
            _this.select = -1;
            _this.getFileList();
          });
      }
    },
    restoreFiles() {
      let checkboxes = this.$refs.fileName;
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
          _this.checkedFiles.push(checkboxes[i].value);
        }
      }
      let _this = this;
      _this.$http
        .get(_this.HOST + "restore/files", {
          params: {
            user: sessionStorage.getItem("user"),
            url: _this.checkedFiles.join(";"),
          },
        })
        .then((res) => {
          _this.$message(res.body.msg);
          _this.getFileList();
          _this.isChoosed = false;
        });
    },
    getFileList() {
      let _this = this;
      // console.log(_this.filePath.join("/"));
      _this.$http
        .get(_this.HOST + "file/garbage/get", {
          params: {
            user: sessionStorage.getItem("user"),
            path: _this.filePath.join("/") + "/",
          },
        })
        .then((res) => {
          _this.files = res.body.data;
        });
    },
    selectFiles() {
      let fileNames = this.$refs.fileName;
      this.select = -1;

      if (fileNames[0].hidden == true) {
        for (let i = 0; i < fileNames.length; i++) {
          // console.log(fileNames[i]);
          fileNames[i].hidden = false;
          fileNames[i].disabled = false;
        }
        this.isChoosed = true;
      } else {
        for (let i = 0; i < fileNames.length; i++) {
          // console.log(fileNames[i]);
          fileNames[i].hidden = true;
          fileNames[i].disabled = true;
        }
        this.isChoosed = false;
      }
    },
    showAllName($event) {
      let text = $event.currentTarget;
      this.oldName = text.value;
      text.className = "fileNameAllName";
    },
    showShortName($event) {
      let text = $event.currentTarget;
      this.newName = text.value;
      text.className = "fileName";
    },

    choose(i) {
      if (!this.checking) {
        let _this = this;
        let file = _this.files[i];
        if (file.type == "dir") {
          _this.filePath.push(file.name);
          _this.getFileList();
        } else {
          _this.select = i;
          _this.isChoosed = true;
        }
      }
      // console.log(_this.select);
    },
    mygo(i) {
      let path = [];
      for (let j = 0; j <= i; j++) {
        path.push(this.filePath[j]);
      }
      this.filePath = path;
      // console.log(path);
      this.getFileList();
    },
    myDelete() {
      let _this = this;
      if (_this.select != -1) {
        //单个文件删除
        if (_this.files[_this.select].type == "dir") {
          _this.$http
            .get(_this.HOST + "file/garbage/deleteDri", {
              params: {
                path: _this.files[_this.select].url,
                user: sessionStorage.getItem("user"),
              },
            })
            .then((res) => {
              _this.$message(res.body.msg);
              _this.getFileList();
              _this.select = -1;
              _this.isChoosed = false;
            });
        } else {
          _this.$http
            .get(_this.HOST + "file/garbage/deleteFile", {
              params: {
                path: _this.filePath.join("/") + "/",
                user: sessionStorage.getItem("user"),
                files: _this.files[_this.select].name,
              },
            })
            .then((res) => {
              _this.$message(res.body.msg);
              _this.getFileList();
              _this.select = -1;
              _this.isChoosed = false;
            });
        }
      } else {
        let checkboxes = _this.$refs.fileName;
        for (let i = 0; i < checkboxes.length; i++) {
          if (checkboxes[i].checked == true) {
            _this.checkedFiles.push(_this.files[checkboxes[i].value]);
          }
        }
        //多个文件删除
        let urls = [];
        for (let i = 0; i < _this.checkedFiles.length; i++) {
          if (_this.checkedFiles[i].type == "dir") {
            _this.$http.get(_this.HOST + "file/garbage/deleteDri", {
              params: {
                path: _this.checkedFiles[i].url,
                user: sessionStorage.getItem("user"),
              },
            });
          } else {
            urls.push(_this.checkedFiles[i].url);
          }
        }
        _this.$http
          .get(_this.HOST + "file/garbage/deleteFiles", {
            params: {
              path: _this.filePath.join("/") + "/",
              user: sessionStorage.getItem("user"),
              files: urls.join(";"),
            },
          })
          .then((res) => {
            _this.$message(res.body.msg);
            _this.getFileList();
            _this.isChoosed = false;
          });
      }
    },
  },
};
</script>

<style scoped>
.box {
  display: flex;
  flex-flow: column nowrap;
}
.myHeader {
  position: relative;
  width: 100%;
  height: 60px;
  display: flex;
  flex-flow: row nowrap;
  background: rgba(231, 231, 231, 1);
}
.filePath {
  position: relative;
  width: 100%;
  height: 35px;
  display: flex;
  flex-flow: row nowrap;
  margin-top: 15px;
}
.filePanes {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row wrap;
}
.file {
  width: 80px;
  height: 115px;
  float: left;
  text-align: center;
}
.file img {
  width: 72px;
  height: 95px;
}
.fileName {
  width: 72px;
  overflow-x: hidden;
  overflow-y: hidden;
  resize: none;
  background: transparent;
  border-style: none;
  /* overflow: hidden; */
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.fileNameAllName {
  width: 72px;
  height: 100px;
  overflow-x: hidden;
  overflow-y: hidden;
  resize: none;
  background: transparent;
  border-style: none;
}
</style>
