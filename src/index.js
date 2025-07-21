const { Application } = require('@g-network/service-chassis');

const SalesforceModel = require('@g-network/salesforce-models');

// Models
const OrderSalesforce = require('./models/OrderSalesforce');
const ContactSalesforce = require('./models/Contact');
const Street = require('./models/Street');
const Opportunity = require('./models/Opportunity');
const OpportunityLineItem = require('./models/OpportunityLineItem');
const OrderItem = require('./models/OrderItem');
const PricebookEntry = require('./models/PricebookEntry');
const Account = require('./models/Account');

// Services
const OrderService = require('./services/OrderService');
const OpportunityService = require('./services/OpportunityService');
const ContactService = require('./services/ContactService');
const OpportunityLineItemService = require('./services/OpportunityLineItemService');
const OrderItemService = require('./services/OrderItemService');

// External services
const PropertyService = require('./external-services/PropertyService');
const ProductService = require('./external-services/ProductService');
const AppointmentService = require('./external-services/AppointmentService');

// Endpoints
const getOrderEndpoint = require('./endpoints/getOrder');
const createOrderEndpoint = require('./endpoints/createOrder');
const updateOrderEndpoint = require('./endpoints/updateOrder');
const getOrderCollectionEndpoint = require('./endpoints/getOrderCollection');

// Events
const updateOrderCircuitEvent = require('./events/updateOrderCircuit');
const tagsReservedEvent = require('./events/tagsReserved');

const application = new Application(process.env.SERVICE_NAME);

application.initializer(async () => {
  await SalesforceModel.connect({
    loginUrl: process.env.SALESFORCE_URL,
    username: process.env.SALESFORCE_USERNAME,
    password: process.env.SALESFORCE_PASSWORD,
  });
});

application.models({
  OrderSalesforce,
  ContactSalesforce,
  Street,
  Opportunity,
  OpportunityLineItem,
  OrderItem,
  PricebookEntry,
  Account,
});

application.services({
  order: OrderService,
  opportunity: OpportunityService,
  contact: ContactService,
  opportunityLineItem: OpportunityLineItemService,
  orderItem: OrderItemService,

  propertyService: PropertyService,
  productService: ProductService,
  appointmentService: AppointmentService,
});

application.register('propertyService', process.env.PROPERTY_SERVICE_URL);
application.register('productService', process.env.PRODUCT_SERVICE_URL);
application.register('appointmentService', process.env.APPOINTMENT_SERVICE_URL);

application.endpoint('GET', '/order/:id', getOrderEndpoint);
application.endpoint('GET', '/order', getOrderCollectionEndpoint);
application.endpoint('POST', '/order', createOrderEndpoint);
application.endpoint('PATCH', '/order/:id', updateOrderEndpoint);

application.event('updateOrderCircuit', updateOrderCircuitEvent);
application.event('tagsReserved', tagsReservedEvent);

module.exports = application;
