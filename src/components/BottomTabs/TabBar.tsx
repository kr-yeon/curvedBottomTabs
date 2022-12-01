import React, {useContext, useEffect, useLayoutEffect} from 'react';
import {
  BottomTabBarHeightCallbackContext,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {Animated, StyleSheet, useWindowDimensions, View} from 'react-native';
import * as shape from 'd3-shape';
import Svg, {Path} from 'react-native-svg';
import {CommonActions} from '@react-navigation/native';
import {MissingIcon} from '@react-navigation/elements';
import colors from '@utils/colors';
import {getBottomSpace} from 'react-native-iphone-x-helper';

interface ITabBarProps extends BottomTabBarProps {
  tabBarHeight?: number;
  tabMiddleButtonPadding?: number;
  tabMiddleButtonTopWidth?: number;
  tabMiddleButtonBottomWidth?: number;
  tabMiddleButtonCurvePadding?: number;
  tabBarColor?: string;
  tabBarRadius?: number;
}

export let tabBarHeight = 90 + getBottomSpace();
export let tabMiddleButtonPadding = 25;
export let tabMiddleButtonTopWidth = 55;
export let tabMiddleButtonBottomWidth = 80;
export let tabMiddleButtonCurvePadding = 15;
export let tabBarColor = colors.dodi_green;
export let tabBarRadius = 15;

const TabBar: React.FC<ITabBarProps> = ({
  state,
  descriptors,
  navigation,
  ...props
}) => {
  const {width} = useWindowDimensions();
  const setTabBarHeight = useContext(BottomTabBarHeightCallbackContext);
  const realDescriptor = Object.values(descriptors)[state.index];

  useLayoutEffect(() => {
    props.tabBarHeight && (tabBarHeight = props.tabBarHeight);
    props.tabMiddleButtonPadding &&
      (tabMiddleButtonPadding = props.tabMiddleButtonPadding);
    props.tabMiddleButtonTopWidth &&
      (tabMiddleButtonTopWidth = props.tabMiddleButtonTopWidth);
    props.tabMiddleButtonBottomWidth &&
      (tabMiddleButtonBottomWidth = props.tabMiddleButtonBottomWidth);
    props.tabMiddleButtonCurvePadding &&
      (tabMiddleButtonCurvePadding = props.tabMiddleButtonCurvePadding);
    props.tabBarColor && (tabBarColor = props.tabBarColor);
    props.tabBarRadius && (tabBarRadius = props.tabBarRadius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTabBarHeight?.(tabBarHeight + tabMiddleButtonPadding);
  }, [setTabBarHeight]);

  const left = shape
    .line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(shape.curveCatmullRomOpen)([
    [tabBarRadius, tabMiddleButtonPadding],
    [width / 2, tabMiddleButtonPadding],
    [width / 2, tabBarHeight],
    [0, tabBarHeight],
    [0, tabMiddleButtonPadding + tabBarRadius],
    [tabBarRadius / 4, tabMiddleButtonPadding + tabBarRadius / 4],
    [tabBarRadius, tabMiddleButtonPadding],
    [width / 2, tabMiddleButtonPadding],
  ]);
  const center = shape
    .line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(shape.curveBasis)([
    [
      width / 2 - tabMiddleButtonBottomWidth / 2 - tabMiddleButtonCurvePadding,
      tabMiddleButtonPadding,
    ],
    [width / 2 - tabMiddleButtonBottomWidth / 2, tabMiddleButtonPadding],
    [width / 2 - tabMiddleButtonTopWidth / 2, 0],
    [width / 2 + tabMiddleButtonTopWidth / 2, 0],
    [width / 2 + tabMiddleButtonBottomWidth / 2, tabMiddleButtonPadding],
    [
      width / 2 + tabMiddleButtonBottomWidth / 2 + tabMiddleButtonCurvePadding,
      tabMiddleButtonPadding,
    ],
  ]);
  const right = shape
    .line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(shape.curveCatmullRomOpen)([
    [width / 2, tabMiddleButtonPadding],
    [width - tabBarRadius, tabMiddleButtonPadding],
    [width - tabBarRadius / 4, tabMiddleButtonPadding + tabBarRadius / 4],
    [width, tabMiddleButtonPadding + tabBarRadius],
    [width, tabBarHeight],
    [width / 2, tabBarHeight],
    [width / 2, tabMiddleButtonPadding],
    [width - tabBarRadius, tabMiddleButtonPadding],
  ]);

  return (
    <Animated.View
      style={[
        tabBarStyles.container,
        realDescriptor.options.tabBarStyle ?? {},
      ]}>
      <Svg style={[StyleSheet.absoluteFill, tabBarStyles.svg]}>
        <Path
          fill={
            realDescriptor.options.tabBarActiveBackgroundColor || tabBarColor
          }
          d={`${left} ${center} ${right}`}
        />
      </Svg>
      <View style={tabBarStyles.tab_bar}>
        {state.routes.map((route, index) => {
          const isFocus = state.index === index;
          const options = descriptors[route.key].options;
          const TabButton = options.tabBarButton as React.ElementType;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocus && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate({name: route.name, merge: true}),
                target: state.key,
              });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={index}
              isFocus={isFocus}
              onPress={onPress}
              onLongPress={onLongPress}
              activeTintColor={options.tabBarActiveTintColor}
              inactiveTintColor={options.tabBarInactiveTintColor}
              activeBackgroundColor={options.tabBarActiveBackgroundColor}
              inactiveBackgroundColor={options.tabBarInactiveBackgroundColor}
              tabBarIcon={
                options.tabBarIcon ??
                (({color, size}) => <MissingIcon color={color} size={size} />)
              }
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

export default TabBar;

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.transparent,
  },
  svg: {
    backgroundColor: colors.transparent,
    color: colors.transparent,
    width: '100%',
  },
  tab_bar: {
    width: '100%',
    height: tabBarHeight,
    flexDirection: 'row',
    backgroundColor: colors.transparent,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: tabMiddleButtonPadding,
  },
});
