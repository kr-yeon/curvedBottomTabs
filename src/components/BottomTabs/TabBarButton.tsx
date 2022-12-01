import React from 'react';
import {Pressable} from 'react-native';
import {
  cancelAnimation,
  SharedValue,
  withSpring,
} from 'react-native-reanimated';
import {BottomTabBarButtonProps} from '@react-navigation/bottom-tabs';

interface ITabBarButton extends BottomTabBarButtonProps {
  animationValue: SharedValue<number>;
  zoomLevel: number;
  isFocus?: boolean;
  tabBarIcon?: (props: {focused: boolean}) => React.FunctionComponent;
}

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

export default TabBarButton;
