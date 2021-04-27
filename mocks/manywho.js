window.manywho = {
    component: {
        register: jest.fn()
    },
    model: {
        getComponent: jest.fn().mockReturnValue({ contentValue: 'input' }),
        getItem: jest.fn().mockReturnValue({ label: 'test' }),
        getOutcomes: jest.fn().mockReturnValue([])
    },
    state: {
        getComponent: jest.fn().mockReturnValue(null)
    },
    styling: {
        getClasses: jest.fn().mockReturnValue([])
    },
    log: {
        debug: jest.fn()
    },
    settings: {
        isDebugEnabled: jest.fn().mockReturnValue(true)
    }
};