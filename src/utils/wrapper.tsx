import * as React from 'react';
import {
    IComponentIdProps,
    IComponentModel,
    IComponentProps,
    IContainerModel,
    IContainerProps,
    IListFilterWhere,
    IManywho,
    IObjectData,
    IObjectDataProperty,
    IObjectDataRequest,
    IOutcome,
    ITag,
} from '../interfaces';
import { debugComponent } from './debug';
import { addProperties, removeProperties } from './objectData';
import { objectDataHandler } from './proxy';

const dedent: any = require('dedent');

const getProps = (id: string, parentId: string, flowKey: string) => {
    const model = manywho.model.getItem(id, flowKey);
    const outcomes = manywho.model.getOutcomes(id, flowKey);

    return {
        className: manywho.styling.getClasses(parentId, id, model.componentType || model.containerType, flowKey),
        flowKey,
        id,
        model,
        outcomes,
        parentId,
    };
};

const getChangeValue = (value: string | number | boolean | React.ChangeEvent<HTMLInputElement> | null): string | number | boolean | null => {
    if (typeof value === 'object' && value) {
        switch (value.target.type) {
            case 'checkbox':
                return value.target.checked;
            default:
                return value.target.value;
        }
    }

    return value as string | number | boolean | null;
};

export const container = (
    Container: React.ComponentClass<IContainerProps> | React.FunctionComponent<IContainerProps>,
    containerType: string,
) => {
    const instance = ({ id, parentId, flowKey }: IComponentIdProps) => {
        const model: IContainerModel = manywho.model.getContainer(id, flowKey);
        const children = manywho.model.getChildren(id, flowKey);

        const props: IContainerProps = {
            ...getProps(id, parentId, flowKey),
            children: manywho.component.getChildComponents(children, id, flowKey),
        };

        manywho.log.debug(dedent`
            Rendering Container
            Name: ${model.developerName}
            Type: ${model.containerType}
            Order: ${model.order}
        `);

        return React.createElement(Container, props);
    };

    if (containerType) {
        manywho.component.registerContainer(containerType, instance);
    }

    return instance;
};

export const component = (
    Component: React.ComponentClass<IComponentProps> | React.FunctionComponent<IComponentProps>,
    isDebugRenderingEnabled: boolean = false,
    componentType?: string,
) => {
    const instance = ({ id, parentId, flowKey }: IComponentIdProps) => {
        const model: IComponentModel = manywho.model.getComponent(id, flowKey);

        const validateState = (push: boolean = true) => {
            const state = manywho.state.getComponent(id, flowKey);
            manywho.state.setComponent(
                id,
                manywho.validation.validate(model, state, flowKey),
                flowKey,
                push,
            );
        };

        const onChange = (value: string | number | boolean | React.ChangeEvent<HTMLInputElement> | null, validate: boolean = true, push: boolean = true) => {
            manywho.state.setComponent(id, { contentValue: getChangeValue(value) }, flowKey, push);

            if (validate) {
                validateState(push);
            }
        };

        const onSelect = (items: string | IObjectData | Array<(string | IObjectData)>, validate: boolean = true, push: boolean = true) => {
            if (!Array.isArray(items)) {
                items = [items];
            }

            if (Array.isArray(items) && !model.isMultiSelect && items.length > 1) {
                items = [items[0]];
            }

            manywho.state.setComponent(
                id,
                {
                    objectData: removeProperties((items || []).map((item) => {
                        if (typeof item === 'string') {
                            item = model.objectData.filter((x) => manywho.utils.isEqual(x.externalId, item as string, true))[0];
                        }

                        const selectedItem: IObjectData = JSON.parse(JSON.stringify(item));
                        selectedItem.isSelected = true;
                        return selectedItem;
                    })),
                },
                flowKey,
                push);

            if (validate) {
                validateState(push);
            }
        };

        // tslint:disable-next-line:ban-types
        const onEvent = (callback?: React.FocusEvent<HTMLInputElement> | Function) => {
            manywho.component.handleEvent(
                this as any,
                model,
                flowKey,
                typeof callback === 'function' ? callback as () => void : null,
            );
        };

        const onLoad = (
            search: string = null,
            page: number = 0,
            limit: number = 0,
            orderBy: string = null,
            orderByDirection: string = 'ASC',
            wheres: IListFilterWhere[] = null,
        ) => {
            const key = model.objectDataRequest ? 'objectDataRequest' : model.fileDataRequest ? 'fileDataRequest' : null;

            if (key) {
                const request: IObjectDataRequest = JSON.parse(JSON.stringify(model[key]));

                if (wheres) {
                    request.listFilter.where = request.listFilter.where.concat(wheres);
                }

                return manywho.engine[key](
                    id,
                    request,
                    flowKey,
                    limit,
                    search,
                    orderBy,
                    orderByDirection,
                    page,
                );
            }
        };

        const getContentValue = <T extends string | number | boolean>() => {
            const state = manywho.state.getComponent(id, flowKey);

            return (state && state.contentValue !== undefined ?
                state.contentValue :
                model.contentValue) as T;
        };

        const getObjectData = (item: IComponentModel | IObjectDataProperty): any[] => {
            return item.objectData ?
                item.objectData.map((objectData: IObjectData) => addProperties(objectData))
                : null;
        };

        const getAttribute = (name: string): string | number | boolean | null => {
            if (model && model.attributes) {
                const key = Object
                    .keys(model.attributes)
                    .filter((item) => manywho.utils.isEqual(item, name, true))[0];

                if (key) {
                    return model.attributes[key];
                }
            }

            return null;
        };

        const getTag = (name: string): ITag => {
            if (model && model.tags) {
                return model.tags.filter((tag) => manywho.utils.isEqual(tag.developerName, name, true))[0];
            }

            return null;
        };

        const props: IComponentProps = {
            ...getProps(id, parentId, flowKey),
            getAttribute,
            getContentValue,
            getObjectData,
            getTag,
            onChange,
            onEvent,
            onLoad,
            onSelect,
            state: manywho.state.getComponent(id, flowKey),
        };

        manywho.log.debug(dedent`
            Rendering Component
            Name: ${model.developerName}
            Type: ${model.componentType}
            Order: ${model.order}
        `);

        if (isDebugRenderingEnabled && manywho.settings.isDebugEnabled(flowKey)) {
            return debugComponent(Component, props);
        } else {
            return React.createElement(Component, props);
        }
    };

    if (componentType) {
        manywho.component.register(componentType, instance);
    }

    return instance;
};

export const renderOutcomes = (outcomes: IOutcome[], flowKey: string, componentType: string = 'outcome') => (
    (outcomes || []).map((outcome) => React.createElement(manywho.component.getByName(componentType), { id: outcome.id, flowKey, outcome }))
);
