<template>
<b-container>
    <b-row>
        <b-col cols="auto">
            <b-button-group size="sm">
                <b-button variant="outline-dark" @click="getData(-7)">7 Days</b-button>
                <b-button variant="outline-dark" @click="getData(-15)">15 Days</b-button>
                <b-button variant="outline-dark" @click="getData(-30)">30 Days</b-button>
                <b-button variant="outline-dark" @click="getData(1)">This month</b-button>
                <b-button variant="outline-dark" @click="getData(0)">ALL Time</b-button>
            </b-button-group>
        </b-col>
        <b-col style="text-align:end">
            <b-link @click="onDataLabel">
                <b-badge>Show value on Line</b-badge>
            </b-link>
        </b-col>
    </b-row>
    <b-row>
        <b-col>
            
            <div id="chart2">
                <VueApexCharts ref="table1234" v-if="!isLoading" type="line" height="400" :options="chartOptions" :series="series"></VueApexCharts>
                 <b-spinner v-else variant="warning"></b-spinner>
            </div>
           
        </b-col>
    </b-row>
</b-container>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import moment from 'moment';
export default {
    name: 'BarChart',
    components: {
        VueApexCharts,
    },
    props: {

    },
    data() {
        return {
            isLoading: true,
            options_designer: [],
            series: [],
            chartOptions: {
                chart: {
                    height: 500,
                    type: 'line',
                    toolbar: {
                        show: false
                    }
                },
                colors: ['#77B6EA', '#713DEB', '#545424', '#EB48CD', '#F5A040', '#40F5E2', '#EB2819'],
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: 'smooth'
                },
                title: {
                    text: 'Designer Report Performance',
                    align: 'left'
                },
                grid: {
                    borderColor: '#e7e7e7',
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                markers: {
                    size: 1
                },
                xaxis: {
                    categories: [],
                    title: {
                        text: ''
                    }
                },
                yaxis: {
                    title: {
                        text: 'Temperature'
                    },
                    min: 5,
                    max: 5000
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    floating: true,
                    offsetY: -25,
                    offsetX: -5
                }
            },
        }
    },
    async mounted() {
        this.chartOptions.xaxis.categories = [];
        for (let i = 15; i >= 0; i--) {
            let date = moment().add(-i, 'days').format('DD/MM')

            this.chartOptions.xaxis.categories.push(date)
        }
        await this.getDesigners();
        await this.getData(1);
        this.isLoading = false;
        this.$forceUpdate();
    },
    methods: {

        onDataLabel() {
            this.isLoading = !this.isLoading
            this.chartOptions.dataLabels.enabled = !this.chartOptions.dataLabels.enabled
            this.$refs.table1234.updateOptions(this.chartOptions, false, true)
            this.isLoading = !this.isLoading
        },
        async getDesigners() {
            this.isLoading = true
            await this.$axios.get('/accounts/designers', {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    this.options_designer = []
                    for (let i = 0; i < response.data.length; i++) {
                        let obj = {
                            value: response.data[i].username,
                            text: response.data[i].fullname,
                        }
                        this.options_designer.push(obj);
                    }
                    this.isLoading = false;
                })
                .catch((error) => {
                    this.isLoading = false;
                });
        },
        async getData(nbrdate) {
            this.isLoading = true
            this.chartOptions.xaxis.categories = [];

            let query = '';
            let fromdate = moment().add(-500, 'days').format('YYYY-MM-DD')
            let todate = moment().add(1, 'days').format('YYYY-MM-DD')
            if (nbrdate == 0) {
                fromdate = moment().add(-500, 'days').format('YYYY-MM-DD')
                todate = moment().add(1, 'days').format('YYYY-MM-DD')
            } else {
                if (nbrdate == 1) {
                    fromdate = moment().format('YYYY-MM') + '-01'
                    todate = moment().add(1, 'days').format('YYYY-MM-DD')
                } else {
                    fromdate = moment().add(nbrdate, 'days').format('YYYY-MM-DD')
                    todate = moment().add(1, 'days').format('YYYY-MM-DD')
                }
            }

            await this.$axios.get('/reports/generaldesignerperformance?fromdate=' + fromdate + '&todate=' + todate, {
                    headers: {
                        Authorization: this.$auth.getToken('local'),
                        'Content-Type': 'application/json'
                    }
                })
                .then((response) => {
                    let max = 0;
                    let maxdate = 1;
                    this.series = [];
                    for (let i = 0; i < response.data.length; i++) {
                        let a= moment(response.data[i].date, "YYYY-MM-DD");
                        let b = moment()
                        if( b.diff(a,'days') > maxdate){
                            maxdate = b.diff(a,'days');
                        }
                        if (response.data[i].count_design > max) {
                            max = response.data[i].count_design
                        }
                    }
                    for (let i = maxdate; i >= 0; i--) {
                        let date = moment().add(-i, 'days').format('DD/MM')

                        this.chartOptions.xaxis.categories.push(date)
                    }
                    this.chartOptions.yaxis.max = max;
                    for (let j = 0; j < this.options_designer.length; j++) {
                        var obj = {
                            name: this.options_designer[j].value,
                            data: []
                        }
                        for (let i = 0; i < this.chartOptions.xaxis.categories.length; i++) {
                            let label = this.chartOptions.xaxis.categories[i];
                            let index = -1;
                            for (let z = 0; z < response.data.length; z++) {
                                if ((response.data[z].date.split('-')[2] + '/' + response.data[z].date.split('-')[1]) == label && response.data[z].designer == obj.name) {
                                    index = z;
                                    break;
                                }
                            }
                            if (index >= 0) {
                                obj.data.push(response.data[index].count_design);
                            } else {
                                obj.data.push(0);
                            }
                        }
                        this.series.push(obj);
                    }
                    console.log(this.series)

                })
                .catch((error) => {});
            this.isLoading = false;
        },
    },
}
</script>

<style>
.chart-container {
    height: 500px;
    width: 500px;
}
</style>
