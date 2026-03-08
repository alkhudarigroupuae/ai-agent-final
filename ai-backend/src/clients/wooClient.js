import WooCommerceRestApi from 'woocommerce-rest-ts-api';
import { config } from '../config.js';

export const wooClient = new WooCommerceRestApi({
  url: config.wcUrl,
  consumerKey: config.wcConsumerKey,
  consumerSecret: config.wcConsumerSecret,
  version: 'wc/v3'
});
