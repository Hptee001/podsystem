<template>
<b-card img-src="https://80steess3.imgix.net/production/products/DNGN249/1974-dungeons-dragons-t-shirt.master.png" class="mb-2 mycard">

    <b-card-body>
        {{name}}
    </b-card-body>
    <b-card-text class="small text-muted">
        <b-row>
            <b-col>
                {{created_user}}
            </b-col>
            <b-col>
                {{created_at}}
            </b-col>
        </b-row>
    </b-card-text>

</b-card>
</template>

<script>
export default {
    props: ['name', 'tags', 'descr', 'created_at', 'created_user', 'id'],
    data() {
        return {
            isShowSee: false,
            isShowFullDescr: false,
            reason: null,
            message: '',
        }
    },
    methods: {
       
    },
}
</script>

<style>
.img-card {
    height: 250px;
}

.card-body {
    padding: 5px;
}

.small.text-muted {
    padding-left: 5px;
}
.mycard:hover{
     border-color:var(--primary)
}
</style>
