<template>
  <CFooter :fixed="false">
    <div>
      <a href="https://theyourlist.com" target="_blank">Core</a>
      <span class="ml-1">&copy; {{new Date().getFullYear()}} STO ECOM.</span>
    </div>
    <div class="ml-auto">
      <span class="mr-1">Powered by</span>
      <a href="https://theyourlist.com" target="_blank">Theyourlist</a>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: 'TheFooter'
}
</script>
