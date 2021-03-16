/**
 * Created by PIV on 22.06.2016.
 */
/* eslint-disable max-len */
import React from 'react';
import cx from 'classnames';
import getDisplayName from 'react-display-name';
import extend from 'lodash/extend';
import cloneElement from './clone-referenced-element';

const isReact15 = parseInt(React.version.split('.')[0], 10) === 15;
const isReact16Plus = parseInt(React.version.split('.')[0], 10) >= 16;

export default function bem(componentOrFunction) {
  if (componentOrFunction.isReactComponent) return reactClassBemDecorator(componentOrFunction);
  return reactFunctionBemDecorator(componentOrFunction);
}

function reactFunctionBemDecorator(innerFunction) {
  return (...args) => applyBem(innerFunction(...args));
}

function reactClassBemDecorator(InnerComponent) {
  const bemStylesOverride = {};

  class WrappedComponentWithReactBemMod extends InnerComponent {
    render() {
      return applyBem(super.render(), { props: this.props, bemStylesOverride });
    }
  }

  WrappedComponentWithReactBemMod.displayName = `bem(${getDisplayName(InnerComponent)})`;

  return WrappedComponentWithReactBemMod;
}

export function applyBem(element, {
  props: componentProps,
  bemBlock: maybeBemBlock,
  key,
  bemStylesOverride = {}
} = {}) {
  if (Array.isArray(element)) {
    return element.map((it, i) => applyBem(it, {
      bemBlock: maybeBemBlock,
      key: i.toString(),
      bemStylesOverride
    }));
  }

  if (element && element.props) {
    const props = {};

    if (isReact15 && key && !element.props.key) props.key = key;
    if (isReact16Plus && key && !element.key) props.key = key;

    const classNames = [];
    let elemIsDataBlock = false;
    let bemBlock = maybeBemBlock;
    let bemPrefix = '';

    let dataBlock;
    if (dataBlock === undefined) dataBlock = element.props['data-block'];
    props['data-block'] = null;
    if (dataBlock === undefined) dataBlock = element.props['bem-block'];
    props['bem-block'] = null;

    if (dataBlock === null) {
      // Bem style already overrided by bemMod in other elements
      return element;
    }

    if (dataBlock && typeof dataBlock === 'string') {
      bemBlock = dataBlock.trim();
      elemIsDataBlock = true;

      classNames.push(bemBlock);
    }

    if (!bemBlock) {
      // eslint-disable-next-line
      // if (__DEVELOPMENT__) console.error('Error Bem in Element:', element);
      console.error('Error Bem in Element:', element);
      throw new Error('Main element must contain block prop, due to Bem metodology');
    }

    bemPrefix = bemBlock;

    let dataElem;
    if (dataElem===undefined) dataElem = element.props['data-elem'];
    props['data-elem'] = null;
    if (dataElem===undefined) dataElem = element.props['bem-elem'];
    props['bem-elem'] = null;

    if (dataElem && typeof dataElem === 'string') {
      const bemElem = dataElem.trim();
      // classNames.push(`${bemBlock}__${bemElem}`);

      bemPrefix = `${bemPrefix}__${bemElem}`;

      classNames.push(bemPrefix);

      if (elemIsDataBlock) {
        // Remove dataBlock className
        // This is used for insert another datablock tree in existing Block container
        classNames.shift();
      }
    }

    let dataMods;
    if (dataMods === undefined) dataMods = element.props['data-mods'];
    props['data-mods'] = null;
    if (dataMods === undefined) dataMods = element.props['bem-mods'];
    props['bem-mods'] = null;

    if (dataMods) {
      cx(dataMods)
        .split(' ')
        .forEach(it => it && classNames.push(`${bemPrefix}_${it}`));
    }

    if (element.props.className) classNames.push(element.props.className);

    if (componentProps && componentProps.className) classNames.push(componentProps.className);

    if (componentProps && componentProps['data-bemstyles']) {
      extend(bemStylesOverride, componentProps['data-bemstyles']);
      props['data-bemstyles'] = null;
    }
    /* if (InnerComponent.bemstyles) {
      extend(bemStylesOverride, InnerComponent.bemstyles);
    } */
    if (element.props['data-bemstyles']) {
      extend(bemStylesOverride, element.props['data-bemstyles']);
      props['data-bemstyles'] = null;
    }
    if (element.props['bem-override']) {
      extend(bemStylesOverride, element.props['bem-override']);
      props['bem-override'] = null;
    }
    if (element.props['bem-modules']) {
      extend(bemStylesOverride, element.props['bem-modules']);
      props['bem-modules'] = null;
    }
    // TODO if construct to increase speed

    classNames.forEach((it, index) => {
      classNames[index] = bemStylesOverride[it] || classNames[index];
    });

    const combinedClasses = classNames.join(' ').trim();

    if (combinedClasses) props.className = combinedClasses;

    if (element.props.children) {
      props.children = applyBem(element.props.children, { bemBlock, bemStylesOverride });
    }

    return cloneElement(element, props);
  }

  return element;
}

