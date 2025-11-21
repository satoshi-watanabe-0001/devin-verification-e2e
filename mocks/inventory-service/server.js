const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type ProductAvailability {
    onlineStock: String!
    deliveryLeadTime: String
    inStock: Boolean
    estimatedDeliveryDays: Int
  }

  type Query {
    productAvailability(productId: String!): ProductAvailability
    getProductAvailability(productId: String!): ProductAvailability
  }
`);

const mockInventoryData = {
  'iphone-14': { inStock: true, estimatedDeliveryDays: 2 },
  'iphone-15': { inStock: true, estimatedDeliveryDays: 1 },
  'iphone-15-plus': { inStock: true, estimatedDeliveryDays: 2 },
  'iphone-15-pro': { inStock: true, estimatedDeliveryDays: 3 },
  'iphone-15-pro-max': { inStock: false, estimatedDeliveryDays: null },
  'iphone-15-pro-128gb': { inStock: true, estimatedDeliveryDays: 3 },
  'iphone-15-pro-256gb': { inStock: true, estimatedDeliveryDays: 2 },
  'iphone-15-pro-max-256gb': { inStock: false, estimatedDeliveryDays: null },
  'iphone-15-128gb': { inStock: true, estimatedDeliveryDays: 1 },
  'iphone-15-plus-256gb': { inStock: true, estimatedDeliveryDays: 2 },
};

const toAvailability = ({ inStock, estimatedDeliveryDays }) => ({
  onlineStock: inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
  deliveryLeadTime: estimatedDeliveryDays != null ? String(estimatedDeliveryDays) : null,
  inStock,
  estimatedDeliveryDays
});

const resolveAvailability = (productId) => {
  console.log(`[Inventory Mock] Query for productId: ${productId}`);
  
  const shouldSimulateFailure = process.env.SIMULATE_FAILURE === 'true';
  if (shouldSimulateFailure) {
    console.log('[Inventory Mock] Simulating service failure');
    throw new Error('Inventory service unavailable');
  }

  const base = mockInventoryData[productId] || {
    inStock: true,
    estimatedDeliveryDays: 5,
  };

  const result = toAvailability(base);
  console.log(`[Inventory Mock] Returning availability:`, result);
  return result;
};

const root = {
  productAvailability: ({ productId }) => resolveAvailability(productId),
  getProductAvailability: ({ productId }) => resolveAvailability(productId),
};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'inventory-mock' });
});

const PORT = process.env.PORT || 8085;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Inventory Mock] GraphQL server running on http://0.0.0.0:${PORT}/graphql`);
  console.log(`[Inventory Mock] GraphiQL interface available at http://0.0.0.0:${PORT}/graphql`);
  console.log(`[Inventory Mock] Health check available at http://0.0.0.0:${PORT}/health`);
});
