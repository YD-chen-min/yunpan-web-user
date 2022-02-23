<template>
  <div class="bg">
    <div class="box">
      <img class="box-left" src="../assets/mo.png" />
      <div class="form1">
        <div class="line">
          <img src="../assets/id.png" class="icon" />
          <input
            id="user"
            type="text"
            placeholder="请输入账号/手机号"
            v-model="user"
          />
        </div>
        <div class="line">
          <img src="../assets/password.png" class="icon" />
          <input
            id="password"
            type="password"
            placeholder="输入密码"
            v-model="password"
          />
        </div>
        <div class="line">
          <a href="" style="padding: 0px 50px">忘记密码?</a>
          <a href="/register" style="padding: 0px 50px"> 注册</a>
        </div>
        <div class="line" style="justify-content: center">
          <el-button type="primary" @click="login" :loading="isloading"
            >登&nbsp&nbsp&nbsp&nbsp&nbsp录</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import md5 from "js-md5";
const HOST = "http://localhost:10001/";
export default {
  name: "Login",
  data() {
    return {
      user: "",
      password: "",
      isloading: false,
    };
  },
  methods: {
    login() {
      let _this = this;
      if (_this.user == "" || _this == "") {
        _this.$message("请完整输入信息");
      } else {
        _this.isloading = true;
        _this.$http
          .post(
            HOST + "user/login",
            {
              user: _this.user,
              password: md5(_this.password),
            },
            { emulateJSON: true }
          )
          .then((res) => {
            _this.isloading = false;
            if (res.body.code == 0) {
              sessionStorage.setItem("user", res.body.data.user);
              sessionStorage.setItem("name", res.body.data.name);
              sessionStorage.setItem("tel", res.body.data.tel);
              sessionStorage.setItem("email", res.body.data.email);
              sessionStorage.setItem("ip", res.body.data.ip);
              sessionStorage.setItem("hdfs", res.body.data.hdfs);
              sessionStorage.setItem("busy", res.body.data.busy);
              sessionStorage.setItem("store", res.body.data.store);
              let free = (res.body.data.busy / res.body.data.store) * 100;
              sessionStorage.setItem("ff", free.toFixed(3));
              // _this.$router.push("/main");
              window.location.replace("/main");
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
  },
};
</script>

<style  scoped>
.bg {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  background: url("../assets/bg.png") fixed repeat;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.box {
  width: 640px;
  height: 400px;
  background: rgba(255, 255, 255, 1);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 25px;
}

input {
  width: 380px;
  height: 48px;
  border: 2px solid #eeeeee;
  background: #b6aaaa;
  border-radius: 15px;
  opacity: 1;
  font-size: 20px;
}

#user ::placeholder,
#password ::placeholder {
  width: 56px;
  height: 18px;
  font-size: 18px;
  font-family: SourceHanSansCN;
  font-weight: 400;
  color: #b4b4b4;
  line-height: 40px;
}

.icon {
  width: 18px;
  height: 48px;
  padding-right: 4px;
  padding-left: 2px;
  object-fit: contain;
}

.box-left {
  position: relative;
  width: 35%;
  object-fit: contain;
}

.form1 {
  display: flex;
  flex-flow: column nowrap;
}

.line {
  display: flex;
  flex-flow: row nowrap;
  padding: 20px 0px;
}
</style>