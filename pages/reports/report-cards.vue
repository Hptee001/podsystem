<template lang="">
<div class="col-sm-12 mytable" style="margin-bottom:10px;">
    <div class=''>
        <div>
            <b-row style="padding-top:10px">
                <b-col align-v="center">
                    <b-button variant="outline-secondary" @click="loadReportToday()">Today</b-button>
                    <b-button variant="outline-secondary" @click="loadReportYesterday()">Yesterday</b-button>
                    <b-button variant="outline-secondary" @click="loadReportThisMonth()">This Month</b-button>
                    <b-button variant="outline-secondary" @click="loadReportLastMonth()">Last Month</b-button>
                </b-col>

            </b-row>
            <b-row>
                <b-col><label for="example-datepicker">From Date</label>
                    <b-form-datepicker id="fromdate-datepicker" v-model="input.fromdate" class="mb-2"></b-form-datepicker>
                </b-col>
                <b-col><label for="example-datepicker">To Date</label>
                    <b-form-datepicker id="todate-datepicker" v-model="input.todate" class="mb-2"></b-form-datepicker>
                </b-col>
            </b-row>
            <b-row>
                <b-col>

                </b-col>
                <b-col align-self="end">
                    <b-button block variant="outline-secondary" @click="loadReport()">Load</b-button>
                </b-col>
            </b-row>

        </div>
    </div>
    <div style="display: flex; padding-top:10px;">
        <b-spinner v-show="loading" variant="primary"></b-spinner>
        <b-spinner v-show="loading" variant="secondary"></b-spinner>
        <b-spinner v-show="loading" variant="success"></b-spinner>
        <b-spinner v-show="loading" variant="danger"></b-spinner>
        <b-spinner v-show="loading" variant="warning"></b-spinner>
        <b-spinner v-show="loading" variant="info"></b-spinner>
        <b-spinner v-show="loading" variant="light"></b-spinner>
        <b-spinner v-show="loading" variant="dark"></b-spinner>
    </div>
    <b-table :sort-compare="sortingChanged" v-if="!loading" :items="itemsgroup" :fields="fieldsgroups" :tbody-tr-class="rowClass" responsive="sm">
        <template #cell(show_details)="row">
            <b-button size="sm" @click="row.toggleDetails" class="mr-2">
                {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
            </b-button>
        </template>
        <template #row-details="row">
            <b-card>
                <b-table v-if="!loading" ref="table" :fields="fields" :items="row.item.details" :tbody-tr-class="rowClass">

                </b-table>
            </b-card>

        </template>
    </b-table>
</div>
</template>

<script>

import moment from 'moment'
// import the component
import Treeselect from '@riophae/vue-treeselect'
// import the styles
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
const defaultSortCompare = (a, b, sortBy) => {
    return toString(a[sortBy]).localeCompare(toString(b[sortBy]), undefined, {
        numeric: true
    });
};
export default {
    components: {
        Treeselect
    },
    data() {
        return {
            value: null,
            // define options
            options_tree: [{
                id: 'a',
                label: 'a',
                children: [{
                    id: 'aa',
                    label: 'aa',
                }, {
                    id: 'ab',
                    label: 'ab',
                }],
            }],
            isadmin: false,
            loading: false,
            csv: null,
            fieldsgroups: [{
                    key: 'designer',
                    thClass: 'mytbheader',
                    class: 'mycodeproduct',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Clone',
                    key: 'count_clone',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Redesign',
                    key: 'count_redesign',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Total Design',
                    key: 'count_design',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    key: 'show_details',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                }
            ],
            fields: [{
                    label: 'Date',
                    key: 'date',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                }, {
                    label: 'Seller',
                    key: 'seller',
                    class: 'mytbthumbnail',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Clone',
                    key: 'count_clone',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Redesign',
                    key: 'count_redesign',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },
                {
                    label: 'Total Design',
                    key: 'count_design',
                    thClass: 'mytbheader',
                    tdClass: 'mytdnumber',
                    sortable: true
                },

            ],
            items: [],
            itemsgroup: [],
            input: {
                todate: '',
                fromdate: ''
            },
            total: {
                count_clone: 0,
                count_redesign: 0,
                count_design: 0
            },
            options_designer: [],
        }
    },
    watch: {
        input: {
            handler: function (val, oldVal) {
                console.log(this.input);
            },
            deep: true
        }
    },
    computed: {
        netprofitclass() {
            if (this.total.profit < 0) return 'itemvalue text-red'
            else return 'itemvalue text-green'
        },
    },
    layout: 'dashboard',
    async mounted() {
       
        this.loading = true;
        var today = new Date();
        Date.prototype.addDays = function (days) {
            this.setDate(this.getDate() + parseInt(days));
            return this;
        };
        today = today
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;
        this.input.todate = today;
        this.input.fromdate = today;
         await this.getDesigners();
         console.log(this.options_designer)
        this.loadReport(this.input.fromdate, this.input.todate)
    },
    methods: {
        loadReportToday() {
            var today = new Date();
            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };
            today = today
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;
            this.input.todate = today;
            this.input.fromdate = today;
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        loadReportYesterday() {
            var today = new Date();
            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };
            today = today.addDays(-1)
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = yyyy + '-' + mm + '-' + dd;
            this.input.todate = today;
            this.input.fromdate = today;
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        loadReportThisMonth() {
            var today = new Date();
            Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };

            var fromdate = today
            var dd = String(fromdate.getDate()).padStart(2, '0');
            var mm = String(fromdate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = fromdate.getFullYear();
            fromdate = yyyy + '-' + mm + '-01';

            var todate = yyyy + '-' + mm + '-' + dd;

            this.input.todate = todate;
            this.input.fromdate = fromdate;
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        loadReportLastMonth() {
             this.input.fromdate = moment().add(-1, 'months').startOf('month').format('YYYY-MM-DD')
           this.input.todate = moment().add(-1, 'months').endOf('month').format('YYYY-MM-DD')
            this.loadReport(this.input.fromdate, this.input.todate)
        },
        sortingChanged(a, b, key) {
            if (key == "estprofit") {
                return a["estprofit"] - b["estprofit"] // ? -1 : a["estprofit"] > b["estprofit"] ? 1 : 0

            }
        },
        rowClass(item, type) {
            if (!item || type !== 'row') return
            if (item.estprofit < 0) return 'text-red'
            if (item.estprofit > 0) return 'text-green'
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
        loadReport(fromdate, todate) {
            this.loading = true;
            this.$axios.get("/reports/generalcards?fromdate=" + this.input.fromdate + "&todate=" + this.input.todate, {
                    headers: {
                        // Overwrite Axios's automatically set Content-Type
                        Authorization: this.$auth.getToken('local'),
                    }
                })
                .then((response) => {
                    this.loading = false;
                    this.items = response.data;
                    this.itemsgroup = []
                    for (let i = 0; i < this.options_designer.length; i++) {
                        var obj = {
                            designer: this.options_designer[i].value,
                            count_clone: 0,
                            count_redesign: 0,
                            count_design: 0,
                            details: []
                        };
                        for (let j = 0; j < this.items.length; j++) {
                            if (this.items[j].designer == obj.designer) {
                                obj.count_clone += this.items[j].count_clone;
                                obj.count_redesign += this.items[j].count_redesign;
                                obj.count_design += this.items[j].count_design;
                                obj.details.push(this.items[j]);
                            }
                        }
                        this.itemsgroup.push(obj);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.loading = false;
                });
        }
    },
}
</script>

<style>
.itemvalue {
    width: 39%;
    display: inline-block;
    text-align-last: end;
    font-weight: 600;
    font-size: medium;
}

.itemlabel {
    width: 60%;
    display: inline-block;
    font-weight: 600;
    font-size: medium
}

.mytable {
    border-radius: 10px;
    margin-bottom: 10px;
    border: 1px solid gray;
    padding: 25px;
    background: white;
}

.mytbheader {
    text-transform: uppercase;
    color: #6e7a81;
    text-align: center;
}

.mytd {
    padding-right: 10px;
    text-align: center;
    text-transform: uppercase;
    padding-top: 25px;
}

.mytdnumber {
    text-align: center;
}

.mytdtext {
    text-align: center;
}

.mycodeproduct {
    padding-top: 25px;
    max-width: 100px;
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
}

.mytbthumbnail {
    width: 60px;
}

.text-red {
    color: red;
}

.text-green {
    color: green;
}
</style>
