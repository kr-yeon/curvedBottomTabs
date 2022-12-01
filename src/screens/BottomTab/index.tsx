import React from 'react';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import {StyleSheet} from 'react-native';
import colors from '@utils/colors';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {TabBar, TabBarButton, TabBarOptions} from '@components/BottomTabs';

interface ITabBarIcon {
  color: string;
  focused: boolean;
  size: number;
}

interface ITabScreen {
  name: string;
  component: React.FunctionComponent;
  Icon: React.FC<ITabBarIcon>;
  zoomLevel?: number;
  isCenterIcon?: boolean;
  options?: BottomTabNavigationOptions;
  ableZoom?: boolean;
}

const Tabs = createBottomTabNavigator();

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
              tabBarStyles.icon_button,
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

function NullScreen() {
  return null;
}

export default function () {
  return (
    <Tabs.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      {TabScreen({
        name: '1',
        component: NullScreen,
        Icon: ({focused}: ITabBarIcon) => (
          <MaterialCommunityIcons
            name={focused ? 'format-list-text' : 'format-list-text'}
            size={26}
            color={focused ? colors.dodi_brown : colors.dodi}
          />
        ),
      })}
      {TabScreen({
        name: '2',
        component: NullScreen,
        isCenterIcon: true,
        Icon: ({focused}: ITabBarIcon) => (
          <Foundation
            name={focused ? 'home' : 'home'}
            size={34}
            color={focused ? colors.dodi : colors.dodi}
          />
        ),
        zoomLevel: 1.1,
      })}
      {TabScreen({
        name: '3',
        component: NullScreen,
        Icon: ({focused}: ITabBarIcon) => (
          <MaterialCommunityIcons
            name={focused ? 'magnify' : 'magnify'}
            size={26}
            color={focused ? colors.dodi_brown : colors.dodi}
          />
        ),
      })}
    </Tabs.Navigator>
  );
}

const tabBarStyles = StyleSheet.create({
  center_button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    marginBottom: TabBarOptions.tabMiddleButtonPadding + getBottomSpace(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon_button: {
    marginBottom: getBottomSpace(),
  },
});
