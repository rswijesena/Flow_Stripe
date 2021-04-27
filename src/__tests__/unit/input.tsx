import { configure, shallow } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import CustomInput from '../../input';

configure({ adapter: new Adapter() });

describe('Input Component', () => {

    it('renders', () => {
        const wrapper = shallow(
            (
                <CustomInput
                    flowKey="flowKey"
                    id="id2"
                />
            ),
        );
        expect(wrapper.find('input')).toHaveLength(1);
    });

    it('registers', () => {
        expect(manywho.component.register).toHaveBeenCalledWith('custom-input', expect.any(Function));
    });

});
