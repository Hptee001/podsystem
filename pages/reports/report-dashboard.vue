<template>
<div>
    <b-container>
        <b-row>
            <b-col>
                <the-order-chart-bar></the-order-chart-bar>
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
import TheOrderChartBar from '../../components/TheOrderChartBar.vue'
export default {
    components: {
        TheOrderChartBar,
        TheDesignChart
    },
}
</script>

<style>

</style>
