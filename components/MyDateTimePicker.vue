<template>
<div style="padding:0px;margin:0px;">
<label v-if="active_label" for="example-input">{{ilabel}}</label>
    <b-input-group >
     <b-form-input
        id="example-input"
        v-model="mvalue"
        type="text"
        placeholder="YYYY-MM-DD"
        autocomplete="off"
        @input="handleChange"
        class="form-control"
      ></b-form-input>
      <b-input-group-append>
        <b-form-datepicker
          v-model="mvalue"
          button-only
          right
          locale="en-US"
          aria-controls="example-input"
          @context="onContext"
        ></b-form-datepicker>
      </b-input-group-append>
    </b-input-group>
    <div v-if="active_label" style="margin-bottom:10px;"></div>
</div>

   
</template>

<script>
  export default {
    props: {
      value: {
        required: false,
        type: String,
      },
       ilabel: {
        required: false,
        type: String,
      }
    }, data() {
        return {
           mvalue:'',
           active_label:true
        }
    },
    mounted() {
        // console.log(this.value)
        this.active_label = this.ilabel==""?false:true
        this.mvalue = this.value
    },
    watch:{
      value:function(){
      this.mvalue =  this.value
      }
    },
    methods: {
      handleChange(e) {
        //  this.value=  this.mvalue 
          //  console.log("value");
          // console.log("value"+e.target.value)
          // console.log(this.value)
        this.$emit('input', this.mvalue);
      },
       onContext(ctx) {
        // The date formatted in the locale, or the `label-no-date-selected` string
        this.formatted = ctx.selectedFormatted
        // The following will be an empty string until a valid date is entered
        this.selected = ctx.selectedYMD
        this.$emit('input', this.mvalue);
      }
    }
  }
</script>