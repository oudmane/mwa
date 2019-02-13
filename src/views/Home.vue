<template>
  <div>
    <div class="uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l" uk-grid>
      <div v-for="category in categories.list" :key="category.id">
        <router-link
          class="uk-display-block uk-card uk-card-primary uk-card-small uk-card-body uk-text-center"
          :to="'/category/'+category.id"
        >
          <h4 class="uk-margin-remove">{{category.name}}</h4>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "home",
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
