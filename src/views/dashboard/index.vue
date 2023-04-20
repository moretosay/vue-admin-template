<template>
  <!--<div class="dashboard-container">-->
    <!--<div class="dashboard-text">name: {{ name }}</div>-->
    <img src='http://localhost:5000/file/image/index.jpg' width="100%">
  <!--</div>-->
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
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
