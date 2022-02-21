<template>
  <span>
    <span v-if="data.length < maxLen">
      <span>{{ data }}</span>
    </span>
    <span v-else>
      <span>{{ sliceStr }} </span>
    </span>
  </span>
</template>

<script>
export default {
  name: "unfold",
  data() {
    return {
      showBtn: true,
    };
  },
  props: {
    tip: {
      type: String,
      default: "全文",
    },
    // 数据
    data: {
      type: String,
      default: "",
    },
    // 最大长度
    maxLen: {
      type: Number,
      default: 5,
    },
  },
  computed: {
    sliceStr() {
      if (this.data != null) {
        return this.data.substring(0, this.maxLen) + "...";
      }
      return "";
    },
  },
};
</script>
