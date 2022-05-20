<template>
  <div class="box">
    <div class="myHeader">
      <el-button-group style="border-radius: 15px" v-if="!isChoosed">
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
      </el-button-group>
      <el-button-group style="border-radius: 15px" v-if="isChoosed">
        <el-button
          type="primary"
          round
          icon="el-icon-download"
          @click="download"
          >下载</el-button
        >
        <el-button type="primary" icon="el-icon-close" @click="myDelete"
          >删除</el-button
        >
        <el-button type="primary" icon=" el-icon-share" @click="shareFile"
          >分享</el-button
        >
        <el-button
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
          @dblclick="myOnlineOpen(item.url)"
        />
        <textarea
          class="fileName"
          :value="item.name"
          @focus="showAllName($event)"
          @blur="showShortName($event)"
        ></textarea>
        <input
          type="checkbox"
          disabled="true"
          hidden="true"
          ref="fileName"
          unchecked
          :value="item.name"
          @click="checkboxOnClick(i)"
        />
      </div>
    </div>
  </div>
</template>

<script>
var Base64 = require("js-base64").Base64;
export default {
  name: "VideoFile",
  data() {
    return {
      isChoosed: false,
      files: [],
      checkedFiles: [],
      HOST: "http://localhost:10001/",
      select: -1,
      getFileUrl: "file/get/type",
      type: "video",
      checking: false,
      time: 1000,
    };
  },
  created() {
    let _this = this;
    _this.$http
      .get(_this.HOST + "file/get/type", {
        params: {
          user: sessionStorage.getItem("user"),
          type: _this.type,
        },
      })
      .then((res) => {
        if (res.body.code == 0) {
          _this.files = res.body.data;
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
    findIndex(o) {
      let index = -1;
      for (let i = 0; i < this.checkedFiles.length; i++) {
        if (o.url == this.checkedFiles[i].url) {
          index = i;
          break;
        }
      }
      return index;
    },
    checkboxOnClick(i) {
      if (this.findIndex(this.files[i]) == -1) {
        this.checkedFiles.push(this.files[i]);
      } else {
        let index = this.findIndex(this.files[i]);
        this.checkedFiles.splice(index, 1);
      }
      // console.log(this.checkedFiles);
    },
    getFileList() {
      let _this = this;
      // console.log(_this.filePath.join("/"));
      _this.$http
        .get(_this.HOST + _this.getFileUrl, {
          params: {
            user: sessionStorage.getItem("user"),
            type: _this.type,
          },
        })
        .then((res) => {
          if (res.body.code == 0) {
            _this.files = res.body.data;
          } else {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "error",
            });
          }
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
          fileNames[i].checked = false;
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
      if (this.oldName != this.newName) {
        this.rename();
      }
    },
    rename() {
      let _this = this;
      _this.$http
        .get(_this.HOST + "file/rename", {
          params: {
            oldPath: _this.filePath.join("/") + "/" + _this.oldName,
            newPath: _this.filePath.join("/") + "/" + _this.newName,
            user: sessionStorage.getItem("user"),
          },
        })
        .then((res) => {
          if (res.body.code == 1) {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "error",
            });
          } else {
            _this.getFileList();
          }
        });
    },
    choose(i) {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(() => {
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
      }, 200);
    },
    download() {
      let _this = this;
      // console.log(_this.isChoosed);
      // debugger

      if (_this.select != -1) {
        let url =
          _this.HOST +
          "file/download?path=" +
          _this.files[_this.select].url +
          "&user=" +
          sessionStorage.getItem("user");
        // console.log(url);
        let link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        _this.select = -1;
      } else {
        for (let i = 0; i < _this.checkedFiles.length; i++) {
          if (_this.checkedFiles[i].name.indexOf(".") == -1) {
          } else {
            let url =
              _this.HOST +
              "file/download?path=" +
              _this.checkedFiles[i].url +
              "&user=" +
              sessionStorage.getItem("user");
            _this.downloadFile(url);
          }
        }
        _this.checkedFiles = [];
      }
      _this.$notify({
        title: "下载提示",
        message: "正在拉取文件",
        type: "info",
      });
    },
    downloadFile(url) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none"; // 防止影响页面
      iframe.style.height = 0; // 防止影响页面
      iframe.src = url;
      document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
      // 5分钟之后删除
      setTimeout(() => {
        iframe.remove();
      }, 5 * 60 * 1000);
    },
    myDelete() {
      let _this = this;
      if (_this.select != -1) {
        //单个文件删除
        _this.$http
          .get(_this.HOST + "file/deleteFile", {
            params: {
              url: _this.files[_this.select].url,
              user: sessionStorage.getItem("user"),
            },
          })
          .then((res) => {
            if (res.body.code == 0) {
              _this.$message({
                showClose: true,
                message: res.body.msg,
                type: "success",
              });
              _this.getFileList();
            } else {
              _this.$message({
                showClose: true,
                message: res.body.msg,
                type: "error",
              });
            }

            _this.select = -1;
            _this.isChoosed = false;
          });
      } else {
        //多个文件删除
        _this.$http
          .get(_this.HOST + "file/deleteFile", {
            params: {
              url: _this.checkedFiles.join(";"),
              user: sessionStorage.getItem("user"),
            },
          })
          .then((res) => {
            if (res.body.code == 0) {
              _this.$message({
                showClose: true,
                message: res.body.msg,
                type: "success",
              });
              _this.getFileList();
            } else {
              _this.$message({
                showClose: true,
                message: res.body.msg,
                type: "error",
              });
            }
            _this.checkedFiles = [];
            _this.isChoosed = false;
          });
      }
    },
    shareFile() {
      if (this.select == -1) {
        if (this.checking == true) {
          // this.$message({
          //   showClose: true,
          //   message: "单次只能分享一个文件",
          //   type: "warning",
          // });
          let dirs = [];
          let files = [];
          for (let i = 0; i < this.checkedFiles.length; i++) {
            if (this.checkedFiles[i].type == "dir") {
              dirs.push(this.checkedFiles[i].url);
            } else {
              files.push(this.checkedFiles[i].url);
            }
          }
          let _this = this;
          if (files.length > 0) {
            _this.$http
              .post(
                _this.HOST + "share/file",
                {
                  urls: files,
                  user: sessionStorage.getItem("user"),
                },
                { emulateJSON: true }
              )
              .then((res) => {
                _this.$message({
                  showClose: true,
                  message: "分享成功",
                  type: "success",
                });
              });
          }
          if (dirs.length > 0) {
            _this.$http
              .post(
                _this.HOST + "share/dir",
                {
                  urls: dirs,
                  user: sessionStorage.getItem("user"),
                },
                { emulateJSON: true }
              )
              .then((res) => {
                _this.$message({
                  showClose: true,
                  message: "分享成功",
                  type: "success",
                });
              });
          }
        }
      } else {
        let url = [];
        url.push(this.files[this.select].url);
        let type = this.files[this.select].type;
        let _this = this;
        if (type == "dir") {
          _this.$http
            .post(
              _this.HOST + "share/dir",
              {
                urls: url,
                user: sessionStorage.getItem("user"),
              },
              { emulateJSON: true }
            )
            .then((res) => {
              if (res.body.code == 0) {
                //0开头表示分享的是文件，1开头表示分享的是目录
                url = Base64.encode("1" + url);
                _this.$message({
                  showClose: true,
                  message: "请复制分享链接" + url,
                  type: "success",
                  duration: 0,
                });
              } else {
                _this.$message({
                  showClose: true,
                  message: res.body.msg,
                  type: "error",
                });
              }
            });
        } else {
          _this.$http
            .post(
              _this.HOST + "share/file",
              {
                urls: url,
                user: sessionStorage.getItem("user"),
              },
              { emulateJSON: true }
            )
            .then((res) => {
              if (res.body.code == 0) {
                url = Base64.encode("0" + url);
                _this.$message({
                  showClose: true,
                  message: "请复制分享链接" + url,
                  type: "success",
                  duration: 0,
                });
              } else {
                _this.$message({
                  showClose: true,
                  message: res.body.msg,
                  type: "error",
                });
              }
            });
        }
      }
    },
    myOnlineOpen(url) {
      clearTimeout(this.timeOut);
      let _this = this;
      _this.isChoosed = false;
      _this.$http
        .post(
          _this.HOST + "file/online",
          {
            path: url,
            user: sessionStorage.getItem("user"),
          },
          { emulateJSON: true }
        )
        .then((res) => {
          if (res.body.code == 0) {
            let previewUrl = "http://127.0.0.1:8012/" + res.body.msg; //要预览文件的访问地址
            // console.log(previewUrl);
            window.open(
              "http://127.0.0.1:8012/onlinePreview?url=" +
                encodeURIComponent(Base64.encode(previewUrl))
            );
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