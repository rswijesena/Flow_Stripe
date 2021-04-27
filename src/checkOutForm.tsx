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
  console.log('[blur]');
};
const handleChange = (change: any) => {
  console.log('[change]', change);
};
const handleClick = () => {
  console.log('[click]');
};
const handleFocus = () => {
  console.log('[focus]');
};
const handleReady = () => {
  console.log('[ready]');
};
interface MyState {
  stripe: any;
  elements: any;
  flowKey: any;
  getContentValue: any;
  onChange: any;
  model: any;

}

const CARD_ELEMENT_OPTIONS = {
  style: {

    base: {
      'color': '#303238',
      'fontSize': '16px',
      'fontFamily': 'sans-serif',
      'fontSmoothing': 'antialiased',
      'width': '600px',
      '::placeholder': {
        color: '#CFD7DF',
      },
    },
    invalid: {
      'color': '#e5424d',
      ':focus': {
        color: '#303238',
      },
    },
  },
};

class CheckoutForm extends React.Component<MyState> {

  handleSubmit = async (ev: any) => {
    ev.preventDefault();
    const { stripe, elements, getContentValue, onChange, flowKey, model } = this.props;
    if (!stripe || !elements) {
      return;
    }

    const data = new FormData(ev.target);

    console.log('Form Data' + data.get('card_holder_name'));

    const custData = {
      name: data.get('card_holder_name'),
    };

    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card, custData);
    if (result.error) {
      alert('payment Failed' + result.error.message);
    } else {
      console.log(result.token.card.id + '|'  + result.token.id + '|' + data.get('card_holder_name'));
      const paymentToken = result.token.card.id + '|'  + result.token.id + '|' + data.get('card_holder_name');
      onChange(JSON.stringify(paymentToken));
      alert('payment Success' + manywho.model);

      const outcomes = manywho.model.getOutcome('b8c751a6-0c59-49ad-82e4-820bdccdd903', flowKey);
      console.log(outcomes);
      // if (outcomes && outcomes.length > 0) {
      manywho.engine.move(outcomes, flowKey);
    }

}

  render() {

    return (

      <div>
        <form onSubmit={this.handleSubmit}>
        <div className="customer_name_label">
            <label>
            Customer Name
            </label>
        </div>
        <div className="customer_name_input">
        <input
            type="text"
            name="card_holder_name"
            className="form-control"
          />

        </div>
        <label>
      Card details
      <CardElement options={CARD_ELEMENT_OPTIONS} />
    </label>
        <input
            type="submit"
            value="Pay"
            className="btn btn-dark btn-block"
          />
      </form>

      </div>
    );
  }
}

export default function InjectedCheckoutForm(props: any) {
  const flowKey = props.flowKey;
  console.log('CCCCCCC' + flowKey);
  return (
    <ElementsConsumer>
      {({ stripe, elements }) => (
        <CheckoutForm onChange={props.onChange} getContentValue={props.getContentValue} model={props.model} flowKey={flowKey} stripe={stripe} elements={elements}/>
      )}
    </ElementsConsumer>
  );
}
