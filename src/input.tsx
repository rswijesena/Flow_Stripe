import {
    Elements,
  } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import * as React from 'react';
import CheckoutForm_split from './checkOutForm_split';
import './css/basic.css';
import { IComponentProps } from './interfaces';
import { component, renderOutcomes } from './utils/wrapper';
// your stripe public key goes here
const stripePromise = loadStripe(
  
    '',
  );

const App = ({ id, model, outcomes, getContentValue, getAttribute, onChange, onEvent, className, flowKey }: IComponentProps) => {

  return (

            <Elements stripe={stripePromise}>
              <CheckoutForm_split flowKey={flowKey} getContentValue={getContentValue} onChange={onChange} model={model}  />
            </Elements>

    );
  };

export default component(App, true, 'stripe-component');
