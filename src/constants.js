const orderTypes = Object.freeze({
  NEW_BUSINESS: 'New Business',
  UPGRADE: 'Upgrade',
  DOWNGRADE: 'Downgrade',
});

const actionName = Object.freeze({
  CEASE: 'Can Cease',
  CANCEL_CEASE: 'Can Cancel Cease',
  UPGRADE: 'Can Upgrade',
  DOWNGRADE: 'Can Downgrade',
});

const orderStatus = Object.freeze({
  DRAFT: 'Draft',
  LIVE: 'Live',
  CANCELLED: 'Cancelled',
  IN_PROGRESS: 'In progress',
  PENDING: 'Pending',
});

const productTypes = Object.freeze({
  RESIDENTIAL: 'Residential',
  BUSINESS: 'Business',
});

const validationRules = Object.freeze({
  postalCodeRegExp: /^\w{1,2}\d{1,2}\w? \d\w{2}$/,
  orderTypeValues: Object.values(orderTypes),
  telephone: /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?#(\d{4}|\d{3}))?$/,
});

const errorMessages = Object.freeze({
  productIsNotForBusiness: 'Product is not for business',
  productShouldBeForResidentialOrBusiness: 'Product should be for residential or business',
  productIsNotForResidential: 'Product is not for residential',
  productIsNotFound: 'Product is not found',
  dateSurveyBooked: 'Survey Date Book is not null',
  orderNotDraft: 'Update not draft order is forbidden',
  invalidActionDate: 'Requested action date is not valid',
  circuitMessageOrderServiceId: 'Circuit data should contain id or serviceId',
  orderNotFound: 'Order not found',
  ordersNotFound: 'Orders not found',
  relatedOpportunityNotFound: 'Related opportunity not found',
  allParamsNotSet:
    'at least one optional field should be set "status, actionDate, installationSite, product, serviceDelivery"',
  propertyNotFound: 'Property with such UPRN not found.',
  cabNotFound: 'Cab not attach with the StreetUnit',
  singleFieldData: 'Cab can only be found in one of the Backhauled fields',
  streetNotFound: 'Street Not Found',
  orderIsNotUpgradeDowngrade: 'Order is not Upgrade/Downgrade',
  unableToGetPriceBookEntry: 'Unable to get PriceBookEntry',
  noRelevantOpportunityFoundWithId: 'No relevant order found having Opportunity Id ',
  unableToUpdateOrderExternalId: 'Unable to update order with external id',
  contactNotFound: 'Contact not found',
  orderItemNotFound: 'Order item not found',
  futureDateIsNotAllowed: 'Future date is not allowed',
  pastDateIsNotAllowed: 'Past date is not allowed',
  dateShouldNotBeOlderThan: (period) => `Date should not be older than ${period} from now`,
  dateShouldNotBeNewerThan: (period) => `Date should not be newer than ${period} from now`,
  orderShouldNotBeLive: 'Live order can not be cancelled',
  thereIsNoLinkedAccount: 'There is no linked SF Account with provided partnerId',
  duplicateContact: 'Contact is already exists',
  appointmentsNotFound: 'No appointment found for cancellation',
  upgradeDowngradeRestriction:
    'There is no possibility to create Upgrade/Downgrade order. You already have pending one.',
  invalidContactType: (type) => `Contact must be of type ${type}`,
  productTypeIsNotSet: (id) => `Type is not set for Product with id {${id}}`,
  orderAlreadyDraft: 'Order is already draft',
  invalidAccountType: (types) => `Account must be one of type [${types.join(', ')}]`,
});

const errorNames = Object.freeze({
  DUPLICATES_DETECTED: 'DUPLICATES_DETECTED',
});

const recordTypes = Object.freeze({
  WHOLESALE_OPPORTUNITY: 'Wholesale Opportunity',
  STANDARD_OPPORTUNITY: 'Standard',
  STANDARD_CONTACT: 'Standard Contact',
  WHOLESALE_CONTACT: 'Wholesale Client Contact',
  STANDARD_ACCOUNT: 'Client',
  WHOLESALE_ACCOUNT: 'Wholesale Client',
});

const residentialOrBusinessFields = Object.freeze({
  BUSINESS: 'Business',
  RESIDENTIAL: 'Res or Small Bus',
});

const stageNames = Object.freeze({
  QUALIFICATION: 'Qualification',
  PROGRESSING: 'Progressing',
  PITCHED: 'Pitched',
  FORECAST_TO_WIN: 'Forecast to Win',
  CLOSED_WON: 'Closed Won',
  LIVE: 'Live',
  CLOSED_LOST: 'Closed Lost',
  FUTURE_OPPORTUNITY: 'Future Opportunity',
});

const opportunityLossReasons = Object.freeze({
  SERVICE_CANCELLED: 'Service Cancelled',
});

const orderCancellationReasons = Object.freeze({
  CUSTOMER_CHANGED_MIND: 'Customer changed mind',
});

const inProgressStatusMapping = Object.freeze({
  GREEN: 'Green',
  AMBER: 'Amber',
  RED: 'Red',
  QUARANTINED: 'Quarantined',
  SALES_CHECK: 'Sales check',
  AWAITING_RFS: 'Awaiting RFS',
});

const appointmentWorkTypes = Object.freeze({
  SURVEY: 'Standard Survey',
  HALF_DAY_INSTALL: 'Half Day Install',
  STANDARD_INSTALL: 'Standard Install',
});

const appointmentStatuses = Object.freeze({
  CANCELLED: 'Cancelled',
});

const RESOURCES_LIMIT = 20;

const surveyBookedDelayReasons = Object.freeze({
  UNABLE_TO_CONTACT_CUSTOMER: 'Unable to contact customer',
  CUSTOMER_UNWILLING_COMMIT_DATE: 'Customer unwilling to commit to a date',
});

const surveyCompletedDelayReasons = Object.freeze({
  CUSTOMER_NOT_AVAILABLE: 'Customer not available',
  UNABLE_TO_CONTACT_CUSTOMER: 'Unable to contact customer',
  THIRD_PARTY_AGENT_REQUIRED: 'Third party agent required',
});

const wayleaveSentDelayReasons = Object.freeze({
  UNABLE_TO_CONTACT_CUSTOMER: 'Unable to contact customer',
  CUSTOMER_DOES_NOT_KNOW_DETAILS: 'Customer doesn’t know the details',
});

const wayleaveSignedDelayReasons = Object.freeze({
  CHANGES_MADE_TO_AGREEMENT_BY_LAWYER: 'changes made to agreement by lawyer',
  SLOW_RESPONSE_FROM_LAWYER: 'slow response from lawyer',
  LANDLORD_ROUTE_ISSUES: 'Landlord route issues',
  CUSTOMER_ISSUES: 'Customer Issues',
});

const installBookedDelayReasons = Object.freeze({
  CUSTOMER_ACCESS_ISSUE: 'Customer Access Issue',
  MINI_CIVILS_ISSUE: 'Mini Civils Issue',
  BLOCKAGES: 'blockages',
  FIBRE_RELATED_ISSUES: 'Fibre related issues',
  FULL_BUILDING_SURVEY: 'full building survey',
});

const categories = Object.freeze({
  WHOLESALE: 'wholesale',
  RETAIL: 'retail',
});

const priceBookNames = Object.freeze({
  [categories.RETAIL]: 'Standard Price Book',
  [categories.WHOLESALE]: 'Wholesale Pricebook',
});

const propertyTypes = Object.freeze({
  BUSINESS: 'business',
  RESIDENTIAL: 'residential',
});

module.exports = Object.freeze({
  actionName,
  productTypes,
  orderTypes,
  orderStatus,
  validationRules,
  errorMessages,
  errorNames,
  recordTypes,
  residentialOrBusinessFields,
  stageNames,
  opportunityLossReasons,
  orderCancellationReasons,
  inProgressStatusMapping,
  appointmentWorkTypes,
  appointmentStatuses,
  RESOURCES_LIMIT,
  surveyBookedDelayReasons,
  surveyCompletedDelayReasons,
  wayleaveSentDelayReasons,
  wayleaveSignedDelayReasons,
  installBookedDelayReasons,
  categories,
  priceBookNames,
  propertyTypes,
});
