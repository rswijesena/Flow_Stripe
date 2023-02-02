import {
  CardCvcElement,
  CardElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { ElementsConsumer } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import * as React from 'react';
import { useState } from 'react';
import './css/basic.css';
import { IComponentProps, IManywho } from './interfaces';
declare const manywho: IManywho;

const handleBlur = () => {
  // console.log('[blur]');
};
const handleChange = (change: any) => {
  // console.log('[change]', change);
};
const handleClick = () => {
  // console.log('[click]');
};
const handleFocus = () => {
  // console.log('[focus]');
};
const handleReady = () => {
  // console.log('[ready]');
};
interface MyState {
  stripe: any;
  elements: any;
  flowKey: any;
  getContentValue: any;
  onChange: any;
  model: any;

}

const ELEMENT_OPTIONS = {
  style: {
    base: {
      'fontSize': '18px',
      'color': '#424770',
      'letterSpacing': '0.025em',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

class CheckoutFormSplit extends React.Component<MyState> {

  constructor(props: any) {
    super(props);
    this.state = {
      name: '',
      postal: '',
      errorMessage: null,
      paymentMethod: null,
    };
  }

  handleSubmit = async (ev: any) => {
    ev.preventDefault();
    const { stripe, elements, getContentValue, onChange, flowKey, model } = this.props;
    if (!stripe || !elements) {
      return;
    }

    const data = new FormData(ev.target);

    const custData = {
      name: data.get('card_holder_name'),
    };

    const card = elements.getElement(CardNumberElement);
    const result = await stripe.createToken(card, 'CCNSW');
    if (result.error) {
      alert('payment Failed' + result.error.message);
    } else {
      const paymentToken = result.token.card.id + '|'  + result.token.id + '|' + data.get('card_holder_name') + '|' + result.token.card.last4 + '|' + result.token.card.exp_month + '|' + result.token.card.exp_year;
      onChange(JSON.stringify(paymentToken));

      const outcomes = manywho.model.getOutcome('34b17de1-fdbf-403e-84e0-7409c48b2be7', flowKey);
      manywho.engine.move(outcomes, flowKey);
    }

}

  render() {

    return (

      <div>

       <form onSubmit={this.handleSubmit}>
        <label htmlFor="name">Card Holder Name</label>

        <input
          name="card_holder_name"
          required={true}
          placeholder="Jenny Rosen"
          className="form-control"
          type="text"
        />

        <label htmlFor="cardNumber">Card Number</label>
        <CardNumberElement
          id="cardNumber"
          options={ELEMENT_OPTIONS}
        />
        <label htmlFor="expiry">Card Expiration</label>
        <CardExpiryElement
          id="expiry"

          options={ELEMENT_OPTIONS}
        />

        <button className="stripPayButton" type="submit" >
          Donate
        </button>
      </form>

      </div>
    );
  }
}

export default function InjectedCheckoutForm(props: any) {
  const flowKey = props.flowKey;

  return (
    <ElementsConsumer>
      {({ stripe, elements }) => (
        <CheckoutFormSplit onChange={props.onChange} getContentValue={props.getContentValue} model={props.model} flowKey={flowKey} stripe={stripe} elements={elements}/>
      )}
    </ElementsConsumer>
  );
}
