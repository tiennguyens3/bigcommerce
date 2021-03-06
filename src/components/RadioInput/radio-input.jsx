import React from 'react';
import styles from './radio-input.scss';

export default class RadioInput extends React.PureComponent {
    render() {
        return (
            <label className={ this.props.isLoading ? `${styles.container} ${styles.loadingState}` : styles.container }>
                <input
                    type="radio"
                    name={ this.props.name }
                    value={ this.props.value }
                    checked={ this.props.checked }
                    disabled={ this.props.isLoading }
                    onChange={ this.props.onChange }
                    required
                    className={ styles.input } />
                {
                    this.props.isWAAVE &&
                    <img src="https://pg.getwaave.co/img/logo.png" width="100" alt="logo" className={styles.img} />
                }
                { this.props.label }
            </label>
        );
    }
}
