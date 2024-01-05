import Vue from 'vue'
export default ({ $axios, redirect, app }, inject) => {
    $axios.onError((error) => {
        console.log('error')
      const instance = new Vue({})
      let message = JSON.stringify(error.response.data);
        instance.$bvToast.toast(message, {
          title: 'Alert Error',
          variant: 'danger',
          solid: true,
      });
        // instance.$notification['error']({
        //     message: 'Error',
        //     description: JSON.stringify(error.response.data),
        //   })
    })
  }