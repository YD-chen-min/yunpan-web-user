<template>
  <el-dialog title="用户信息" :visible.sync="dialogFormVisible">
    <el-form :model="form">
      <el-form-item label="账号" :label-width="formLabelWidth">
        <el-input
          v-model="userForm.user"
          autocomplete="off"
          readonly
        ></el-input>
      </el-form-item>
      <el-form-item label="用户名" :label-width="formLabelWidth">
        <el-input
          v-model="userForm.name"
          autocomplete="off"
          required
        ></el-input>
      </el-form-item>
      <el-form-item label="电话" :label-width="formLabelWidth">
        <el-input v-model="userForm.tel" autocomplete="off" required></el-input>
      </el-form-item>
      <el-form-item label="邮箱" :label-width="formLabelWidth">
        <el-input
          v-model="userForm.email"
          autocomplete="off"
          @change="vailedEmail"
          required
        ></el-input>
        <b style="color: red" v-if="!isEmail">邮箱不合法!</b>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取 消</el-button>
      <el-button type="primary" @click="modify">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "UserInfo",

  data() {
    return {
      formLabelWidth: "120px",
      userForm: {
        user: sessionStorage.getItem("user"),
        name: sessionStorage.getItem("name"),
        email: sessionStorage.getItem("email"),
        tel: sessionStorage.getItem("tel"),
        password: "",
        ip: "",
      },
      dialogFormVisible: false,
      isEmail: true,
      HOST: "http://localhost:10001/",
    };
  },
  methods: {
    vailedEmail() {
      var regEmail =
        /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (this.userForm.email != "" && !regEmail.test(this.userForm.email)) {
        this.isEmail = false;
      } else {
        this.isEmail = true;
      }
    },
    modify() {
      let _this = this;
      _this.$http
        .post(
          _this.HOST + "user/modify/baseInfo",
          {
            user: _this.userForm.user,
            name: _this.userForm.name,
            email: _this.userForm.email,
            tel: _this.userForm.tel,
            ip: _this.userForm.ip,
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
            _this.dialogFormVisible = false;
            sessionStorage.setItem("name", _this.userForm.name);
            sessionStorage.setItem("email", _this.userForm.email);
            sessionStorage.setItem("tel", _this.userForm.tel);
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