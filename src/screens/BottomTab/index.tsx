import React, {FunctionComponent} from 'react';
import {
  BottomTabBarButtonProps,
  BottomTabBarProps,
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import {Dimensions, Pressable, StyleSheet, Animated, View} from 'react-native';
import colors from '@utils/colors';
import ReAnimated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import * as shape from 'd3-shape';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {CommonActions} from '@react-navigation/native';
import {MissingIcon} from '@react-navigation/elements';

interface ITabBarIcon {
  color: string;
  focused: boolean;
  size: number;
}

interface ITabBarButton extends BottomTabBarButtonProps {
  animationValue: SharedValue<number>;
  zoomLevel: number;
  isFocus?: boolean;
  tabBarIcon?: (props: {focused: boolean}) => React.FunctionComponent;
}

interface ITabScreen {
  name: string;
  component: FunctionComponent;
  Icon: React.FC<ITabBarIcon>;
  zoomLevel?: number;
  isCenterIcon?: boolean;
  options?: BottomTabNavigationOptions;
  ableZoom?: boolean;
}

const Tabs = createBottomTabNavigator();
const {width} = Dimensions.get('window');
const tabBarHeight = 90 + getBottomSpace();
const tabMiddleButtonPadding = 25;
const tabMiddleButtonTopWidth = 55;
const tabMiddleButtonBottomWidth = 80;
const tabMiddleButtonCurvePadding = 15;
const tabBarColor = '#FF9281';

const TabBarButton: React.FC<ITabBarButton> = ({
  animationValue,
  zoomLevel = 1.2,
  ...props
}) => {
  return (
    <Pressable
      onTouchStart={() => {
        animationValue.value = withSpring(zoomLevel);
      }}
      onTouchEnd={() => {
        cancelAnimation(animationValue);
        animationValue.value = withSpring(1);
      }}
      onPress={props.onPress}
      onLongPress={props.onLongPress}>
      {props?.tabBarIcon?.({
        focused: props.isFocus ?? false,
      })}
    </Pressable>
  );
};

const TabScreen: React.FC<ITabScreen> = ({
  name,
  component,
  options,
  Icon,
  isCenterIcon,
  ableZoom = true,
  zoomLevel = 1.2,
}) => {
  const buttonValue = useSharedValue(1);
  const buttonAnimationStyle = useAnimatedStyle(() => ({
    transform: [{scale: buttonValue.value}],
  }));

  return (
    <Tabs.Screen
      name={name}
      component={component}
      options={{
        ...(options ?? {}),
        tabBarButton: props => (
          <TabBarButton
            zoomLevel={zoomLevel}
            animationValue={buttonValue}
            {...props}
          />
        ),
        tabBarIcon: (props: ITabBarIcon) => (
          <ReAnimated.View
            style={[
              ableZoom ? buttonAnimationStyle : {},
              isCenterIcon ? tabBarStyles.center_button : {},
            ]}>
            <Icon {...props} />
          </ReAnimated.View>
        ),
      }}
    />
  );
};

const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const realDescriptor = Object.values(descriptors)[state.index];

  const left = shape
    .line()
    .x(d => d[0])
    .y(d => d[1])([
    [0, tabMiddleButtonPadding],
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
    .y(d => d[1])([
    [width / 2, tabMiddleButtonPadding],
    [width, tabMiddleButtonPadding],
    [width, tabBarHeight],
    [0, tabBarHeight],
    [0, tabMiddleButtonPadding],
  ]);

  return (
    <Animated.View
      style={[tabBarStyles.container, realDescriptor.options.tabBarStyle]}>
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
          const TabButton = options.tabBarButton;

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

export default function () {
  return (
    <Tabs.Navigator
      tabBar={TabBar}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      {TabScreen({
        name: '1',
        component: () => null,
        Icon: ({focused}: ITabBarIcon) => (
          <MaterialCommunityIcons
            name={focused ? 'format-list-text' : 'format-list-text'}
            size={26}
            color={focused ? colors.blue : colors.black}
          />
        ),
      })}
      {TabScreen({
        name: '2',
        component: () => null,
        isCenterIcon: true,
        Icon: ({focused}: ITabBarIcon) => (
          <Foundation
            name={focused ? 'home' : 'home'}
            size={34}
            color={focused ? colors.black : colors.black}
          />
        ),
        zoomLevel: 1.1,
      })}
      {TabScreen({
        name: '3',
        component: () => null,
        Icon: ({focused}: ITabBarIcon) => (
          <MaterialCommunityIcons
            name={focused ? 'magnify' : 'magnify'}
            size={26}
            color={focused ? colors.blue : colors.black}
          />
        ),
      })}
    </Tabs.Navigator>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  svg: {
    backgroundColor: 'transparent',
    color: 'transparent',
    width: '100%',
  },
  tab_bar: {
    width: '100%',
    height: tabBarHeight,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: tabMiddleButtonPadding,
  },
  center_button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    marginBottom: tabMiddleButtonPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
