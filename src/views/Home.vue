<template>
  <div>
    <div>Hellooooo</div>
    <div class="uk-child-width-1-2@s uk-child-width-1-4@l" uk-grid>
      <div v-for="category in categories.list" :key="category.id">
        <router-link :to="'/category/'+category.id">
          <h2>{{category.name}}</h2>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

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
