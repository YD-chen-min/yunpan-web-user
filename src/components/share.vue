<template>
  <div>
    <div class="share" v-if="!isDir">
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
    <div class="box" v-if="isDir">
      <div class="myHeader">
        <el-button-group style="border-radius: 15px" v-if="isDir">
          <el-button type="primary" icon="el-icon-download" @click="download"
            >下载</el-button
          >
          <el-button type="primary" @click="getDirTree">转存</el-button>
          <el-button type="primary" v-if="!checking">多选</el-button>
          <el-button type="primary" v-if="checking">取消多选</el-button>
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
            readonly
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
        <el-dialog title="文件转存" :visible.sync="dialogFormVisible2">
          <el-tree :data="allDir" accordion ref="myTree" show-checkbox>
          </el-tree>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible2 = false">取 消</el-button>
            <el-button type="primary" @click="save" @>确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { Base64 } from "js-base64";
export default {
  name: "Share",
  data() {
    return {
      link: "",
      HOST: "http://localhost:10001/",
      isDir: false,
      checking: false,
      isChoosed: false,
      filePath: [],
      files: [],
      checkedFiles: [],
      select: -1,
      isChoosed: false,
      shareDir: "",
      allDir: [],
      dialogFormVisible2: false,
    };
  },
  methods: {
    downloadShare() {
      let shareCode = Base64.decode(this.link);
      if (shareCode.charAt(0) == "0") {
        let url =
          this.HOST +
          "file/share/download?path=" +
          this.link +
          "&user=" +
          sessionStorage.getItem("user");
        let link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        document.body.appendChild(link);
        link.click();
      } else {
        this.isDir = true;
        let url = shareCode.replace("1hdfs://hadoop01:9000/yunpan/", "");
        this.shareDir = url;
        this.filePath.push(url);
        let _this = this;
        _this.$http
          .post(
            _this.HOST + "share/dir/get",
            {
              url: this.link,
            },
            { emulateJSON: true }
          )
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
      }
    },
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
    myOnlineOpen(i, url) {
      // console.log(this.files);
      let _this = this;
      let file = _this.files[i];
      if (file.type == "dir") {
        _this.filePath.push(file.name);
        _this.getFileList();
      }
    },
    getFileList() {
      let _this = this;
      // console.log(_this.filePath.join("/"));
      _this.$http
        .get(_this.HOST + "file/get", {
          params: {
            user: sessionStorage.getItem("user"),
            path: _this.filePath.join("/") + "/",
            shareDir: _this.shareDir,
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
          sessionStorage.getItem("user") +
          "&shareDir=" +
          _this.shareDir;
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
    save() {
      let nodes = this.$refs.myTree.getCheckedNodes();
      let path = "";
      if (nodes.length > 0) {
        for (let i = 0; i < nodes.length; i++) {
          path += nodes[i].label + "/";
        }

        let urls = [];
        if (this.checking) {
          for (let i = 0; i < this.checkedFiles.length; i++) {
            urls.push(this.checkedFiles[i].url);
          }
        } else {
          urls.push(this.files[this.select].url);
        }
        let _this = this;
        _this.$http
          .post(
            _this.HOST + "share/save",
            {
              urls: urls,
              user: sessionStorage.getItem("user"),
              dest: path,
              shareDir: _this.shareDir,
            },
            { emulateJSON: true }
          )
          .then((res) => {
            _this.$message({
              showClose: true,
              message: res.body.msg,
              type: "success",
            });
          });
      } else {
        this.$message({
          showClose: true,
          message: "请选择转存的路径",
          type: "error",
        });
      }
    },
    getDirTree() {
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