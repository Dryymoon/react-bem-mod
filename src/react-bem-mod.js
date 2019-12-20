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

const bemDecorator = (InnerComponent) => {
  const bemStylesOverride = {};
  const buildBemSelectors = (element, { props: componentProps, bemBlock: maybeBemBlock, key }) => {
    if (Array.isArray(element)) {
      return element.map((it, i) => buildBemSelectors(it, {
        bemBlock: maybeBemBlock,
        key: i.toString()
      }));
    }

    if (element && element.props) {
      const props = {};
      if (isReact15) {
        if (key && !element.props.key) props.key = key;
      }
      if (isReact16Plus) {
        if (key && !element.key) props.key = key;
      }

      const classNames = [];
      let elemIsDataBlock = false;
      let bemBlock = maybeBemBlock;
      let bemPrefix = '';
      const dataBlock = element.props['data-block'];

      if (dataBlock === null) {
        // Bem style already overrided by bemMod in other elements
        return element;
      }

      if (dataBlock && typeof dataBlock === 'string') {
        bemBlock = dataBlock.trim();
        elemIsDataBlock = true;
        props['data-block'] = null;
        classNames.push(bemBlock);
      }

      if (!bemBlock) {
        // eslint-disable-next-line
        // if (__DEVELOPMENT__) console.error('Error Bem in Element:', element);
        console.error('Error Bem in Element:', element);
        throw new Error('Main element must contain block prop, due to Bem metodology');
      }

      bemPrefix = bemBlock;

      const dataElem = element.props['data-elem'];

      if (dataElem && typeof dataElem === 'string') {
        const bemElem = dataElem.trim();
        // classNames.push(`${bemBlock}__${bemElem}`);
        props['data-elem'] = null;
        bemPrefix = `${bemPrefix}__${bemElem}`;
        classNames.push(bemPrefix);
        if (elemIsDataBlock) {
          // Remove dataBlock className
          // This is used for insert another datablock tree in existing Block container
          classNames.shift();
        }
      }

      const dataMods = element.props['data-mods'];
      if (dataMods) {
        cx(dataMods)
          .split(' ')
          .forEach(it => it && classNames.push(`${bemPrefix}_${it}`));
        // props.mods = null;props['data-mods'] = null;
        props['data-mods'] = null;
      }
      if (element.props.className) classNames.push(element.props.className);
      if (componentProps && componentProps.className) {
        classNames.push(componentProps.className);
      }

      /* if (element.props.classNames) {
       throw new Error('Element must not contain classNames props, due to Bem metodology');
       } */

      if (componentProps && componentProps['data-bemstyles']) {
        extend(bemStylesOverride, componentProps['data-bemstyles']);
        props['data-bemstyles'] = null;
      }
      if (InnerComponent.bemstyles) {
        extend(bemStylesOverride, InnerComponent.bemstyles);
      }
      if (element.props['data-bemstyles']) {
        extend(bemStylesOverride, element.props['data-bemstyles']);
        props['data-bemstyles'] = null;
      }
      // TODO if construct to increase speed

      classNames.forEach((it, index) => {
        classNames[index] = bemStylesOverride[it] || classNames[index];
      });
      const combinedClasses = classNames.join(' ')
        .trim();
      if (combinedClasses) {
        props.className = combinedClasses;
      }

      if (element.props.children) {
        props.children = buildBemSelectors(element.props.children, { bemBlock });
      }

      // if (theme) props['data-theme'] = null;

      /* if (element.props.children) {
       props.children = Array.isArray(element.props.children)
       ? element.props.children.map(child => buildBemSelectors(child))
       : buildBemSelectors(element.props.children);
       } */

      // Это заглушка для React 0.15.2, от Дибильного Фейсбука
      // ... Чтоб он не матерился на неправильные атрибуты в нативных HTML тегах
      // TODO Проерить эту заглушку или возможно
      // TODO В проде не делать такой ХАК..., т.е. просто клонировать элемент...
      // TODO Закомментировали следующий if, т.к. иначе в Image не хочет рабоать @bem
      /* if (dev && typeof element.type === 'string') {
       const fullProps = objectAssign({}, element.props, props);
       delete fullProps.block;
       delete fullProps.elem;
       delete fullProps.mods;
       delete fullProps.bemStylesOverride;
       return createElement(element.type, fullProps);
       } */
      /* if (typeof element.type === 'string') {
       console.log('E: ', element);
       console.log('P: ', props);
       } c */

      // Так не работает... материться на наличие левых пропсов в дивах...
      /* eslint-disable */
      /* if (element.props.bemStylesOverride) delete element.props.bemStylesOverride;
       // if (element.props.block) delete element.props.block;
       if (element.props.elem) delete element.props.elem;
       if (element.props.mods) delete element.props.mods; */

      /* if( element.props.bemStylesOverride) element.props.bemStylesOverride = null;
       if( element.props.block) element.props.block = null;
       if( element.props.elem) element.props.elem = null;
       if( element.props.mods) element.props.mods = null; */

      /* eslint-enable */
      /* delete props.block;
       delete props.elem;
       delete props.mods;
       delete props.bemStylesOverride; */
      return cloneElement(element, props);
    }
    return element;
  };

  class WrappedComponentWithReactBemMod extends InnerComponent {
    render() {
      return buildBemSelectors(super.render(), { props: this.props });
    }
  }

  WrappedComponentWithReactBemMod.displayName = `bem(${getDisplayName(InnerComponent)})`;

  return WrappedComponentWithReactBemMod;
};

export default bemDecorator;
