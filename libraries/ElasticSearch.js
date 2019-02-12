const ElasticSearch = require('@oudy/elasticsearch')

ElasticSearch.ready = ElasticSearch.configure(
  {
    host: process.env.ELASTICSEARCH_URL || 'elasticsearch:9200'
  },
  'mwa'
)

module.exports = ElasticSearch