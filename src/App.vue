<template>
  <div id="app" class="uk-container">
    <div class="tm-header uk-visible@m" uk-header>

    </div>
    <div class="uk-section-default">
      <router-view/>
    </div>
  </div>
</template>
<script>
  require('uikit/dist/js/uikit.js')
</script>

<style lang="less">
@import "~uikit/src/less/uikit.theme.less";
</style>
