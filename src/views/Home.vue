<template>
  <div>
    <div>
      <div uk-grid class="uk-grid-small">
        <div class="uk-width-1-1">
          <div uk-grid>
            <div class="uk-width-1-3">
              <label>
                <span class="uk-form-label">Category</span>
                <select class="uk-select" v-model="$store.state.category">
                  <option value="">All categories</option>
                  <option
                    v-for="category in categories.list"
                    :key="category.id"
                    :value="category.id"
                  >{{category.name}}</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div class="uk-width-2-3@m uk-width-3-4@l">
          <progress-chart ref="progress"/>
        </div>
        <div class="uk-width-1-3@m uk-width-1-4@l">
          <div class="uk-card uk-card-primary uk-card-small uk-card-body">
            <h3 class="uk-card-title">Votes last 10mins</h3>
            <beats-chart ref="beats"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import progressChart from "../components/progressChart.vue";
import beatsChart from "../components/beatsChart.vue";

export default {
  name: "home",
  components: {
    progressChart,
    beatsChart
  },
  data() {
    return {
      categories: {
        list: []
      }
    };
  },
  apollo: {
    // Simple query that will update the 'hello' vue property
    categories: gql`
      query {
        categories(limit: 0) {
          list {
            id
            name
          }
          total
          page
          limit
        }
      }
    `
  }
};
</script>
