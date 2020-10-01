import React from 'react';
import ReactDOM from 'react-dom';
import Checkout from './Checkout/checkout';

window.onload = () => {
    ReactDOM.render(
        <Checkout checkoutId={ window.checkoutConfig.checkoutId } />,
        document.getElementById(window.checkoutConfig.containerId)
    );
};
