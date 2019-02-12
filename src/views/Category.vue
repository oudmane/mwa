<template>
  <div>
    <h1>This is a category page {{$route.params.id}}</h1>
    <ul>
      <li v-for="candidate in candidates.list" :key="candidate.id">
        {{candidate.name}} ({{candidate.votes}})
      </li>
    </ul>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      candidates: {
        list: []
      }
    }
  },
  apollo: {
    candidates: {
      query: gql`
        query candidates($query: Scalar) {
          candidates(query: $query, limit: 0) {
            total
            page
            limit
            list {
              id
              name
              rtl
              votes
              image
            }
          }
        }
      `,
      variables() {
        return {
          query: {
            category: this.$route.params.id
          }
        }
      }
    }
  }
};
</script>