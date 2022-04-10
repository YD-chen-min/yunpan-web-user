<template>
  <div class="box">
    <div class="myHeader">
      <el-upload class="upload-demo" :before-upload="startUpload" multiple>
        <el-button
          size="primary"
          icon="el-icon-upload"
          type="primary"
          action="/"
          >上传</el-button
        >
      </el-upload>
      <el-button-group style="border-radius: 15px" v-if="!isChoosed">
        <el-button
          type="primary"
          icon="el-icon-folder-add"
          @click="dialogFormVisible = true"
          >新建文件夹</el-button
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
        <el-button type="primary" @click="myMove">移动</el-button>
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
    <div class="filePath">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item v-for="(item, i) in filePath" :key="i"
          ><b @click="mygo(i)">{{ item }}</b></el-breadcrumb-item
        >
      </el-breadcrumb>
    </div>
    <el-progress
      v-if="uploading"
      :percentage="percentage"
      :format="format"
    ></el-progress>
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
          @dblclick="myOnlineOpen(i, item.url)"
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
          :value="i"
          @click="checkboxOnClick(i)"
        />
      </div>
    </div>
    <div>
      <el-dialog title="新建文件夹" :visible.sync="dialogFormVisible">
        <el-form :model="form">
          <el-form-item label="文件夹名称">
            <el-input v-model="form.dir" autocomplete="off" required></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDir" @>确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <div>
      <el-dialog title="文件移动" :visible.sync="dialogFormVisible2">
        <el-tree :data="allDir" accordion ref="myTree" show-checkbox> </el-tree>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible2 = false">取 消</el-button>
          <el-button type="primary" @click="moveFile" @>确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- <div>
      <iframe id="onlineFile" width="100%" height="100%" frameborder="1">
      </iframe>
    </div> -->
  </div>
</template>

<script>
import axios from "axios";
var Base64 = require("js-base64").Base64;
export default {
  name: "Files",
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
      allDir: [],
      dialogFormVisible2: false,
      choosedDir: "",
      dirPath: [],
      src: "http://view.xdocin.com/xdoc?_xdoc=",
      checking: false,
      // dialogFormVisible3: false,
      percentage: 0,
      uploading: false,
    };
  },

  created() {
    let _this = this;
    _this.filePath.push(sessionStorage.getItem("user"));
    _this.$http
      .get(_this.HOST + "file/get", {
        params: {
          user: sessionStorage.getItem("user"),
          path: _this.filePath.join("/") + "/",
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
    flashUserInfo() {
      let _this = this;
      _this.$http
        .get(_this.HOST + "user/get/info", {
          params: { user: sessionStorage.getItem("user") },
        })
        .then((res) => {
          if (res.body.code == 0) {
            sessionStorage.setItem("busy", res.body.data.busy);
            sessionStorage.setItem("store", res.body.data.store);
            let free = (res.body.data.busy / res.body.data.store) * 100;
            sessionStorage.setItem("ff", free.toFixed(3));
            _this.$emit("infoFlush");
          }
        });
    },
    format(percentage) {
      if (percentage == 100) {
        this.uploading = false;
        return "√";
      } else {
        return `${percentage}%`;
      }
    },
    startUpload(file) {
      this.uploading = true;
      let _this = this;
      let formData = new FormData();
      formData.append("file", file);
      formData.append("path", _this.filePath.join("/") + "/");
      formData.append("user", sessionStorage.getItem("user"));
      const fn = this.uploadProgress;
      // _this.$http
      //   .post(_this.HOST + "file/upload", formData, {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   })
      //   .then((res) => {
      //     if (res.body.code == 0) {
      //       _this.$message({
      //         showClose: true,
      //         message: res.body.msg,
      //         type: "success",
      //       });
      //       _this.getFileList();
      //       _this.flashUserInfo();
      //     } else {
      //       _this.$message({
      //         showClose: true,
      //         message: res.body.msg,
      //         type: "error",
      //       });
      //     }
      //   });
      axios({
        method: "post",
        url: _this.HOST + "file/upload",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
        onUploadProgress: fn,
      }).then((res) => {
        // console.log(res);
        if (res.data.code == 0) {
          _this.$message({
            showClose: true,
            message: "上传成功",
            type: "success",
          });
          _this.getFileList();
        } else {
          _this.$message({
            showClose: true,
            message: res.data.msg,
            type: "error",
          });
        }
      });

      return false;
    },
    getFileList() {
      let _this = this;
      // console.log(_this.filePath.join("/"));
      _this.$http
        .get(_this.HOST + "file/get", {
          params: {
            user: sessionStorage.getItem("user"),
            path: _this.filePath.join("/") + "/",
          },
        })
        .then((res) => {
          if (res.body.code == 0) {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "success",
            });
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
        this.checkedFiles = [];
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
    addDir() {
      let _this = this;
      _this.$http
        .post(
          _this.HOST + "add/dir",
          {
            user: sessionStorage.getItem("user"),
            path: _this.filePath.join("/") + "/" + _this.form.dir,
          },
          { emulateJSON: true }
        )
        .then((res) => {
          _this.dialogFormVisible = false;
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
      if (!this.checking) {
        let _this = this;
        let file = _this.files[i];

        _this.select = i;
        _this.isChoosed = true;
      }
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
    download() {
      let _this = this;
      // console.log(_this.isChoosed);
      if (_this.select != -1) {
        let url =
          _this.HOST +
          "file/download?path=" +
          _this.filePath.join("/") +
          "/" +
          _this.files[_this.select].name +
          "&user=" +
          sessionStorage.getItem("user");
        let link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        document.body.appendChild(link);
        link.click();
        _this.select = -1;
      } else {
        for (let i = 0; i < _this.checkedFiles.length; i++) {
          if (_this.checkedFiles[i].indexOf(".") == -1) {
          } else {
            let url =
              _this.HOST +
              "file/download?path=" +
              _this.filePath.join("/") +
              "/" +
              _this.checkedFiles[i] +
              "&user=" +
              sessionStorage.getItem("user");
            _this.downloadFile(url);
          }
        }
        _this.checkedFiles = [];
      }
    },
    downloadFile(url) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none"; // 防止影响页面
      iframe.style.height = 0; // 防止影响页面
      iframe.src = url;
      document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
      // 5分钟之后删除（onload方法对于下载链接不起作用，就先抠脚一下吧）
      setTimeout(() => {
        iframe.remove();
      }, 60 * 60 * 1000);
    },
    myDelete() {
      let _this = this;
      if (_this.select != -1) {
        //单个文件删除
        if (_this.files[_this.select].type == "dir") {
          _this.$http
            .get(_this.HOST + "file/deleteDri", {
              params: {
                path: _this.files[_this.select].url,
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
          _this.$http
            .get(_this.HOST + "file/deleteFiles", {
              params: {
                path: _this.filePath.join("/") + "/",
                user: sessionStorage.getItem("user"),
                files: _this.files[_this.select].name,
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
        }
      } else {
        //多个文件删除
        let urls = [];
        for (let i = 0; i < _this.checkedFiles.length; i++) {
          if (_this.checkedFiles[i].type == "dir") {
            _this.$http.get(_this.HOST + "file/deleteDri", {
              params: {
                path: _this.checkedFiles[i].url,
                user: sessionStorage.getItem("user"),
              },
            });
          } else {
            urls.push(_this.checkedFiles[i].url);
          }
        }
        if (urls.length > 0) {
          _this.$http
            .get(_this.HOST + "file/deleteFiles", {
              params: {
                path: _this.filePath.join("/") + "/",
                user: sessionStorage.getItem("user"),
                files: urls.join(";"),
              },
            })
            .then((res) => {
              if (res.body.code == 0) {
                _this.$message({
                  showClose: true,
                  message: res.body.msg,
                  type: "success",
                });
                _this.$message(res.body.msg);
                _this.getFileList();
              } else {
                _this.$message({
                  showClose: true,
                  message: res.body.msg,
                  type: "error",
                });
              }

              _this.isChoosed = false;
            });
        }
      }
    },
    uploadProgress(progressEvent) {
      /*
       * progressEvent.loaded :已上传量
       * progressEvent.total :上传的总大小
       */
      const p = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
      this.percentage = p;
    },
    moveFile() {
      let nodes = this.$refs.myTree.getCheckedNodes();
      let path = sessionStorage.getItem("hdfs");
      if (nodes.length > 0) {
        for (let i = 0; i < nodes.length; i++) {
          if (path != nodes[i].label + "/") {
            path = path + nodes[i].label + "/";
          }
        }
        let _this = this;
        let oldPath =
          _this.filePath.join("/") + "/" + _this.files[_this.select].name;
        let newPath = path + _this.files[_this.select].name;
        if (oldPath != newPath) {
          if (_this.checkedFiles.length > 0) {
            for (let i = 0; i < _this.checkedFiles.length; i++) {
              newPath = path;
              _this.$http
                .get(_this.HOST + "file/move", {
                  params: {
                    oldPath: oldPath,
                    newPath: newPath + _this.checkedFiles[i],
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

                  _this.dialogFormVisible2 = false;
                  _this.select = -1;
                  _this.isChoosed = false;
                });
            }
          } else {
            _this.$http
              .get(_this.HOST + "file/move", {
                params: {
                  oldPath: oldPath,
                  newPath: newPath,
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
                _this.dialogFormVisible2 = false;

                _this.select = -1;
                _this.isChoosed = false;
              });
          }
        } else {
          _this.dialogFormVisible2 = false;
          _this.select = -1;
          _this.isChoosed = false;
        }
      } else {
        let _this = this;
        let oldPath =
          _this.filePath.join("/") + "/" + _this.files[_this.select].name;
        let newPath = path + _this.files[_this.select].name;
        if (oldPath != newPath) {
          if (_this.checkedFiles.length > 0) {
            newPath = path;
            for (let i = 0; i < _this.checkedFiles.length; i++) {
              _this.$http
                .get(_this.HOST + "file/move", {
                  params: {
                    oldPath: oldPath,
                    newPath: newPath + _this.checkedFiles[i],
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

                  _this.dialogFormVisible2 = false;

                  _this.select = -1;
                  _this.isChoosed = false;
                });
            }
          } else {
            _this.$http
              .get(_this.HOST + "file/move", {
                params: {
                  oldPath: oldPath,
                  newPath: newPath,
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

                _this.dialogFormVisible2 = false;

                _this.select = -1;
                _this.isChoosed = false;
              });
          }
        } else {
          _this.dialogFormVisible2 = false;
          _this.select = -1;
          _this.isChoosed = false;
        }
      }
    },
    myMove() {
      let _this = this;
      _this.$http
        .get(_this.HOST + "file/dir/get/all", {
          params: {
            path: sessionStorage.getItem("hdfs"),
            user: sessionStorage.getItem("user"),
          },
        })
        .then((res) => {
          _this.allDir = res.body.data;
          _this.dialogFormVisible2 = true;
          // console.log(_this.allDir);
        });
    },
    myOnlineOpen(i, url) {
      // console.log(this.files);
      let _this = this;
      let file = _this.files[i];
      if (file.type == "dir") {
        _this.filePath.push(file.name);
        _this.getFileList();
      } else {
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
              // console.log(res.body.msg);
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
