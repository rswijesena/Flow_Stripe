import * as React from 'react';
import './css/basic.css';

class CustomBasic extends React.Component {
    render() {
        return <div className="custom-basic">Basic Custom Component</div>;
    }
}

manywho.component.register('custom-basic', CustomBasic);

export default CustomBasic;
