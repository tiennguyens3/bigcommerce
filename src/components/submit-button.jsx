import React from 'react';

const container = {
    backgroundColor: '#444444',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.3px',
    padding: '12px',
    width: '100%',
};

const loadingState = {
    opacity: '0.5',
};

export default class SubmitButton extends React.PureComponent {
    render() {
        const button = this.props.isLoading ? Object.assign({}, container, loadingState) : container;

        return (
            <button
                type="submit"
                disabled={ this.props.isLoading }
                style={ button }>
                { this.props.label }
            </button>
        );
    }
}
