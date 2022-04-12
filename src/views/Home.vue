<template>
  <el-container style="height: 100%; border: 1px solid #eee">
    <el-aside
      style="
        color: #f9fafb;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        height: 100%;
      "
    >
      <div
        style="
          background: #0059a5;
          height: 80px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          color: #ffffff;
          font-size: 28px;
        "
      >
        墨家云盘
      </div>
      <el-menu
        class="el-menu-vertical-demo"
        router
        default-active="$route.path"
      >
        <el-menu-item index="files">
          <i class="el-icon-folder"></i>
          <span slot="title">我的文件</span>
        </el-menu-item>
        <el-menu-item index="picfile">
          <i class="el-icon-picture"></i>
          <span slot="title">图片</span>
        </el-menu-item>
        <el-menu-item index="videofile">
          <i class="el-icon-video-camera-solid"></i>
          <span slot="title">视频</span>
        </el-menu-item>
        <el-menu-item index="musicfile">
          <i class="el-icon-headset"></i>
          <span slot="title">音乐</span>
        </el-menu-item>
        <el-menu-item index="docfile">
          <i class="el-icon-tickets"></i>
          <span slot="title">文档</span>
        </el-menu-item>
        <el-menu-item index="unkonwnfile">
          <i class="el-icon-document-remove"></i>
          <span slot="title">未知文件</span>
        </el-menu-item>
        <el-menu-item index="garbage">
          <i class="el-icon-delete-solid"></i>
          <span slot="title">垃圾箱</span>
        </el-menu-item>
        <el-menu-item index="myshare">
          <i class="el-icon-magic-stick"></i>
          <span slot="title">我的共享</span>
        </el-menu-item>
        <el-menu-item index="share">
          <i class="el-icon-share"></i>
          <span slot="title">下载</span>
        </el-menu-item>
        <el-menu-item index="logger">
          <i class="el-icon-s-order"></i>
          <span slot="title">操作日志</span>
        </el-menu-item>
      </el-menu>
      <el-progress
        :title="storeInfo"
        :text-inside="true"
        stroke-width="20"
        :percentage="parseFloat(ff)"
        status="exception"
        style="display: flex; width: 100%; height: 100%; align-self: flex-end"
      ></el-progress>
    </el-aside>

    <el-main style="padding: 0px 0px">
      <el-header style="padding: 0px 0px">
        <el-dropdown class="myHeader" @command="handleCommand">
          <div class="myHeader">
            <i class="el-icon-user-solid"></i>
            <b v-if="userInfo.name == ''">请登录</b>
            <b v-else>{{ userInfo.name }}</b>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="修改信息">修改信息</el-dropdown-item>
            <el-dropdown-item command="修改密码">修改密码</el-dropdown-item>
            <el-dropdown-item divided command="exit">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <router-view @infoFlush="flushFF"></router-view>
    </el-main>
    <user-info ref="userInfo1"></user-info>
  </el-container>
</template>

<script>
import userInfo from "../components/userInfo.vue";
import router from "../router/index";
export default {
  components: { userInfo },
  name: "Home",
  router,
  data() {
    return {
      userInfo: {
        user: sessionStorage.getItem("user"),
        name: sessionStorage.getItem("name"),
      },
      ff: 0,
      HOST: "http://localhost:10001/",
      storeInfo: "",
    };
  },
  created() {
    this.ff = sessionStorage.getItem("ff");
    let busy = parseFloat(sessionStorage.getItem("busy"));
    let store = parseFloat(sessionStorage.getItem("store"));
    busy = busy / 1024 / 1024 / 1024;
    store = store / 1024 / 1024 / 1024;
    busy = busy.toFixed(2);
    store = store.toFixed(2);
    this.storeInfo = "已用" + busy + "GB;  " + "总空间：" + store + "GB";
  },
  methods: {
    handleCommand(command) {
      if (command == "修改信息") {
        this.$refs.userInfo1.dialogFormVisible = true;
      } else if (command == "exit") {
        sessionStorage.removeItem("user");
        window.location.replace("/main");
      } else if (command == "修改密码") {
        window.location.replace("/resetpassword");
      }
    },
    flushFF() {
      this.ff = sessionStorage.getItem("ff");
      let busy = parseFloat(sessionStorage.getItem("busy"));
      let store = parseFloat(sessionStorage.getItem("store"));
      busy = busy / 1024 / 1024 / 1024;
      store = store / 1024 / 1024 / 1024;
      busy = busy.toFixed(2);
      store = store.toFixed(2);
      this.storeInfo = "已用" + busy + "GB;  " + "总空间：" + store + "GB";
    },
  },
};
</script>

<style >
.myHeader {
  display: flex;
  height: 60px;
  width: 100%;
  flex-flow: row-reverse nowrap;
  background: rgba(251, 251, 251, 1);
  align-items: center;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
