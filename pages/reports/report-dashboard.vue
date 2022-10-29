<template>
<div>
    <b-container>
        <b-row>
            <b-col>
                <the-order-chart></the-order-chart>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <the-design-chart></the-design-chart>
            </b-col>
        </b-row>
    </b-container>

</div>
</template>

<script>
import TheDesignChart from '../../components/TheDesignChart.vue'
import TheOrderChart from '../../components/TheOrderChart.vue'
export default {
    components: {
        TheOrderChart,
        TheDesignChart
    },
}
</script>

<style>

</style>
