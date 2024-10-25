'use strict';

/**
 * website-subscription service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::website-subscription.website-subscription');
