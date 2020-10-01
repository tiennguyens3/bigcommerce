# Checkout JS SDK Example

This repository features a React example that uses [Bigcommerce's Checkout JS SDK](https://github.com/bigcommerce/checkout-sdk-js) to illustrate how to build custom checkout solution for a BigCommerce store.

Please note that this checkout is a good starting and reference point, but is not production ready. Since this is an example, do not deploy the script to a production store. You should instead create your own instance and work from there.

## Getting Started

## Development

To run this example locally, simply run the following:

```
npm install && npm run dev
```
This will generate a checkout loader file in `dist/main.js`

In another console, run:
```
npm run dev:server
```
This will serve the `dist` directory locally.

Once those steps have been successful:
1. Go to Control Panel > Advanced Settings > Checkout.
2. Choose "Custom Checkout" option
3. Find the "Custom Checkout Settings" options and in the "Script URL" field enter: `http://127.0.0.1:8080/main.js`
4. Go to your store and checkout. The checkout example should load.

## See Also

* [Installing a Custom Checkout](https://developer.bigcommerce.com/stencil-docs/customizing-checkout/installing-custom-checkouts)
* [Checkout JS SDK](https://github.com/bigcommerce/checkout-sdk-js)
* Storefront APIs
    - [Storefront Cart](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-cart-api)
    - [Storefront Checkout](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-checkout-api)
    - [Storefront Orders](https://developer.bigcommerce.com/api-reference/orders/storefront-orders-api)
* [React](https://reactjs.org/)

## License

This repository is [MIT Licensed](LICENSE.md).
