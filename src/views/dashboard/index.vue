<template>
  <!--<div class="dashboard-container">-->
  <!--<div class="dashboard-text">name: {{ name }}</div>-->
  <img :src="imgUrl" width="100%">
  <!--</div>-->
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      imgUrl: process.env.VUE_APP_BASE_URL + '/file/image/index.jpg'
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
