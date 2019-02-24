<template>
  <div class="uk-card uk-card-primary uk-card-small uk-card-body">
    <h3 class="uk-card-title">Votes last 24H</h3>
    <div class="progressData">
      <chart class :options="line" ref="chart" autoresize/>
    </div>
    <div v-if="busy" class="uk-position-bottom-right">
      <span class="uk-text-muted">Loading...</span>
    </div>
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
  computed: {
    busy() {
      return this.$apollo.queries.progressData.loading;
    }
  },
  data() {
    return {
      lastUpdate: "",
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
          // left: 0,
          right: 20
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
  watch: {
    line: {
      deep: true,
      handler() {
        console.log("Hellooooo");
      }
    }
  },
  apollo: {
    progressData: {
      query: gql`
        query progressData($category: ID, $candidate: ID) {
          progressData(category: $category, candidate: $candidate) {
            data {
              timestamp
              sum
            }
          }
        }
      `,
      variables() {
        return {
          category: this.$store.state.category,
          candidate: this.$store.state.candidate
        };
      },
      manual: true,
      result({ data, loading }) {
        console.log('loading', loading)
        if (!loading) {
          this.line.xAxis.data = [];
          this.line.series[0].data = [];
          data.progressData.data.forEach(datum => {
            this.line.xAxis.data.push(
              moment(datum.timestamp * 1000).format("HH:mm:ss")
            );
            this.line.series[0].data.push(datum.sum);
          });
        }
      }
    },
    $subscribe: {
      // When a tag is added
      tags: {
        query: gql`
          subscription progressData($category: ID, $candidate: ID) {
            progressData(category: $category, candidate: $candidate) {
              timestamp
              sum
            }
          }
        `,
        // Reactive variables
        variables() {
          return {
            category: this.$store.state.category,
            candidate: this.$store.state.candidate
          };
        },
        // Result hook
        result(message) {
          // Let's update the local data
          this.line.xAxis.data.shift();
          this.line.series[0].data.shift();
          this.line.series[0].data.push(message.data.progressData.sum);
          this.line.xAxis.data.push(
            moment(message.data.progressData.timestamp * 1000).format(
              "HH:mm:ss"
            )
          );
          console.log(message.data.progressData);
          // this.$refs.chart.refresh()
        }
      }
    }
  }
};
</script>