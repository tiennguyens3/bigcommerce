import React, { Fragment } from 'react';
import { formatMoney } from 'accounting';
import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import Panel from '../components/Panel/panel';
import SubmitButton from '../components/SubmitButton/submit-button';
import Billing from '../Billing/billing';
import Cart from '../Cart/cart';
import Customer from '../Customer/customer';
import LoginPanel from '../LoginPanel/login-panel';
import Payment from '../Payment/payment';
import Shipping from '../Shipping/shipping';
import Layout from './Layout/layout';
import LoadingState from './LoadingState/loading-state';
import styles from './checkout.scss';

export default class Checkout extends React.PureComponent {
    constructor(props) {
        super(props);

        this.service = createCheckoutService();

        this.state = {
            isPlacingOrder: false,
            showSignInPanel: false,
            paymentMethods: [],
            WF: {}
        };

        this.WForm = React.createRef();
    }

    componentDidMount() {
        Promise.all([
            this.service.loadCheckout(),
            this.service.loadShippingCountries(),
            this.service.loadShippingOptions(),
            this.service.loadBillingCountries(),
            this.service.loadPaymentMethods(),
        ]).then(() => {
            this.unsubscribe = this.service.subscribe((state) => {
                this.setState(state);
            });

            const paymentMethods = this.state.data.getPaymentMethods();
            paymentMethods.push({
                id: 'waave',
                method: 'waave',
                gateway: null,
                config: {
                    displayName: 'WAAVE Payment Gateway'
                }
            });

            this.setState(state => {
                return { ...state, paymentMethods };
            })
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const { data, errors, statuses } = this.state;

        if (!data) {
            return (
                <Layout body={
                    <LoadingState />
                } />
            );
        }

        if (this.state.showSignInPanel) {
            return (
                <Layout body={
                    <LoginPanel
                        errors={ errors.getSignInError() }
                        isSigningIn={ statuses.isSigningIn() }
                        onClick={ (customer) => this.service.signInCustomer(customer)
                            .then(() => this.service.loadShippingOptions())
                        }
                        onClose={ () => this.setState({ showSignInPanel: false }) } />
                } />
            );
        }

        return (
            <Layout body={
                <Fragment>
                    <div className={ styles.body }>
                        <Panel body={
                            <form onSubmit={ (event) => this._submitOrder(event, data.getCustomer().isGuest) }>
                                <Customer
                                    customer={ data.getCustomer() }
                                    billingAddress={ data.getBillingAddress() }
                                    isSigningOut={ statuses.isSigningOut() }
                                    onClick={ () => this.service.signOutCustomer()
                                        .then(() => this.service.loadShippingOptions()) }
                                    onChange={ (customer) => this.setState({ customer }) }
                                    onSignIn={ () => this.setState({ showSignInPanel: true }) } />

                                <Shipping
                                    customer={ data.getCustomer() }
                                    consignments={ data.getConsignments() }
                                    cart={ data.getCart() }
                                    isUpdatingConsignment={ statuses.isUpdatingConsignment }
                                    isCreatingConsignments={ statuses.isCreatingConsignments }
                                    isUpdatingShippingAddress={ statuses.isUpdatingShippingAddress }
                                    address={ data.getShippingAddress() }
                                    countries={ data.getShippingCountries() }
                                    options={ data.getShippingOptions() }
                                    selectedOptionId={ data.getSelectedShippingOption() ? data.getSelectedShippingOption().id : '' }
                                    isSelectingShippingOption ={ statuses.isSelectingShippingOption }
                                    onShippingOptionChange={ (optionId) => this.service.selectShippingOption(optionId) }
                                    onConsignmentUpdate={ (consignment) => (
                                        consignment.id ?
                                            this.service.updateConsignment(consignment) :
                                            this.service.createConsignments([consignment])
                                        )
                                    }
                                    onAddressChange={ (shippingAddress) => {
                                        this.setState({ shippingAddress })
                                        this.service.updateShippingAddress(shippingAddress)
                                    }} />

                                <Payment
                                    errors={ errors.getSubmitOrderError() }
                                    methods={ this.state.paymentMethods }
                                    onClick={ (name, gateway) => this.service.initializePayment({ methodId: name, gatewayId: gateway }) }
                                    onChange={ (payment) => this.setState({ payment }) } />

                                <Billing
                                    multishipping={ (data.getConsignments() || []).length > 1 }
                                    address={ data.getBillingAddress() }
                                    countries={ data.getBillingCountries() }
                                    sameAsShippingAddress={
                                        (this.state.billingAddressSameAsShippingAddress === undefined) ||
                                        this.state.billingAddressSameAsShippingAddress
                                    }
                                    onChange ={ (billingAddress) => this.setState({ billingAddress }) }
                                    onSelect ={ (billingAddressSameAsShippingAddress) => this.setState({ billingAddressSameAsShippingAddress })  } />

                                <div className={ styles.actionContainer }>
                                    <SubmitButton
                                        label={ this._isPlacingOrder() ?
                                            'Placing your order...' :
                                            `Pay ${ formatMoney((data.getCheckout()).grandTotal) }`
                                        }
                                        isLoading={ this._isPlacingOrder() } />
                                </div>
                            </form>
                        } />
                    </div>

                    <div className={ styles.side }>
                        <Cart
                            checkout={ data.getCheckout() }
                            cartLink={ (data.getConfig()).links.cartLink } />
                    </div>

                    <form ref={this.WForm} method="GET" action={this.state.WF.gateway_url}>
                        <input type="hidden" name="access_key" value={this.state.WF.access_key} />
                        <input type="hidden" name="venue_id" value={this.state.WF.venue_id} />
                        <input type="hidden" name="reference_id" value={this.state.WF.reference_id} />
                        <input type="hidden" name="amount" value={this.state.WF.amount} />
                        <input type="hidden" name="currency" value={this.state.WF.currency} />
                        <input type="hidden" name="return_url" value={this.state.WF.return_url} />
                        <input type="hidden" name="cancel_url" value={this.state.WF.cancel_url} />
                        <input type="hidden" name="callback_url" value={this.state.WF.callback_url} />
                        <input type="hidden" name="store_id" value={this.state.WF.store_id} />
                    </form>
                </Fragment>
            } />
        );
    }

    _isPlacingOrder() {
        const { statuses } = this.state;

        return this.state.isPlacingOrder && (
            statuses.isSigningIn() ||
            statuses.isUpdatingShippingAddress() ||
            statuses.isUpdatingBillingAddress() ||
            statuses.isSubmittingOrder()
        );
    }

    _submitOrder(event, isGuest) {
        let billingAddressPayload = this.state.billingAddressSameAsShippingAddress ?
            this.state.shippingAddress :
            this.state.billingAddress;

        billingAddressPayload = { ...billingAddressPayload, email: this.state.customer.email };

        let { payment } = this.state;

        this.setState({ isPlacingOrder: true });
        event.preventDefault();

        if (payment.method === 'waave') {
            let { data } = this.state;

            const products = [];

            const lineItems = data.getCart().lineItems;
            lineItems.customItems.map(item => products.push(item));
            lineItems.digitalItems.map(item => products.push(item));
            lineItems.giftCertificates.map(item => products.push(item));
            lineItems.physicalItems.map(item => products.push(item));

            const discount_amount = data.getCoupons().reduce((accumulator, currentValue) => {
                return accumulator + currentValue.discountedAmount
            }, 0);

            const { storeProfile, links } = data.getConfig();

            const body = {
                products,
                billing_address: billingAddressPayload,
                shipping_address: data.getShippingAddress(),
                shipping_option: data.getSelectedShippingOption(),
                discount_amount,
                customer_id: data.getCustomer().id,
                storeProfile,
                links
            };

            fetch('http://localhost/bigcommerce/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(result => {
                this.setState(state => {
                    return { ...state, WF: result}
                })
                this.setState({ isPlacingOrder: false });

                // Clear the cart and redirect to WAAVE Payment Gateway
                const cart = data.getCart()
                fetch('api/storefront/carts/' + cart.id, {
                    method: "DELETE",
                    credentials: 'include'
                }).then(() => {
                    this.WForm.current.submit();
                });
            })
            .catch(error => {
                this.setState({ isPlacingOrder: false });
            });

            return;
        }

        Promise.all([
            isGuest ? this.service.continueAsGuest(this.state.customer) : Promise.resolve(),
            this.service.updateBillingAddress(billingAddressPayload),
        ])
            .then(() => this.service.submitOrder({ payment }))
            .then(({ data }) => {
                window.location.href = data.getConfig().links.orderConfirmationLink;
            })
            .catch(() => this.setState({ isPlacingOrder: false }));
    }
}
