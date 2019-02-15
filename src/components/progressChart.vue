<template>
  <div class="progressData">
    <chart class :options="line" ref="chart" autoresize/>
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
import "echarts/lib/chart/line";
import moment from "moment";

export default {
  components: {
    chart: ECharts
  },
  data() {
    return {
      line: {
        xAxis: {
          type: "category",
          data: []
        },
        yAxis: {
          type: "value",
          scale: true
        },
        grid: {
          left: 0,
          right: 0
        },
        tooltip: {},
        legend: {
          data: ["Votes"]
        },
        series: [
          {
            data: [],
            type: "line"
          }
        ]
      }
    };
  },
  apollo: {
    progressData: {
      query: gql`
        query {
          progressData {
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
          this.line.xAxis.data = [];
          this.line.series[0].data = [];
          data.progressData.data.forEach(datum => {
            this.line.xAxis.data.push(
              moment(datum.timestamp * 1000).format("h:mm:ss")
            );
            this.line.series[0].data.push(datum.sum);
          });
        }
      }
    }
  }
};
</script>