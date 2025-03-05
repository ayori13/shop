const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    categories: [String!]!
  }

  type ProductSummary {
    id: ID!
    name: String!
    price: Float!
    description: String
    categories: [String!]!
  }

  type Query {
    getAllProducts: [ProductSummary!]!
    getProductDetails(id: ID!): Product
    getProductsByCategory(category: String!): [ProductSummary!]!
    getCategories: [String!]!
  }
`);

module.exports = schema;