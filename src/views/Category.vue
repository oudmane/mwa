<template>
  <div>
    <h1>This is a category page {{$route.params.id}}</h1>
    <ul class="uk-child-width-1-2@s uk-child-width-1-3@m uk-child-width-1-4@l uk-child-width-1-5@xl" uk-grid>
      <li v-for="candidate in candidates.list" :key="candidate.id">
        <div class="uk-cover-container">
          <img :src="'https://vote.marocwebawards.com/'+candidate.image" class="uk-width-1-1">
          <div class="uk-overlay uk-padding-small uk-position-bottom-left uk-tile-default">
            <h2
              class="uk-margin uk-h3 uk-margin-remove-adjacent uk-margin-small-bottom"
            >{{candidate.votes}}</h2>
            <div class="uk-margin uk-text-meta">{{candidate.name}}</div>
          </div>
          <router-link :to="'/candidate/'+candidate.id" class="uk-position-cover"></router-link>
        </div>
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
    };
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
        };
      },
      manual: true,
      result({ data, loading }) {
        if (!loading) {
          this.candidates = data.candidates;
          this.candidates.list.sort((a, b) => {
            if (a.votes < b.votes) return 1;
            else if (a.votes > b.votes) return -1;
            else 0;
          });
        }
      }
    }
  }
};
</script>