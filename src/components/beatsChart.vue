<template>
  <div class="progressData">
    <chart class :options="bar" ref="chart" autoresize/>
  </div>
</template>
<style>
.progressData .echarts {
  width: 100% !important;
}
</style>

<script>
import gql from "graphql-tag";
import ECharts from "vue-echarts";
import "echarts/lib/chart/bar";
import moment from "moment";

export default {
  components: {
    chart: ECharts
  },
  data() {
    return {
      bar: {
        xAxis: {
          type: "category",
          data: []
        },
        yAxis: {
          type: "value",
          scale: true
        },
        tooltip: {},
        legend: {
          show: true,
          data: ["Votes"]
        },
        series: [
          {
            data: [],
            type: "bar"
          }
        ]
      }
    };
  },
  apollo: {
    beatsData: {
      query: gql`
        query {
          beatsData {
            data {
              timestamp
              sum
            }
          }
        }
      `,
      manual: true,
      result({ data, loading }) {
        if (!loading) {
          this.bar.xAxis.data = [];
          this.bar.series[0].data = [];
          data.beatsData.data.forEach(datum => {
            this.bar.xAxis.data.push(
              moment(datum.timestamp * 1000).format("h:mm:ss")
            );
            this.bar.series[0].data.push(datum.sum);
          });
        }
      }
    }
  }
};
</script>