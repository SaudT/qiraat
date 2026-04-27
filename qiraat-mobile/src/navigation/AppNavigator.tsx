import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import RecitationDetailScreen from "../screens/RecitationDetailScreen";
import { Recitation } from "../services/recitationService";

export type RootStackParamList = {
  Home: undefined;
  RecitationDetail: { recitation: Recitation };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="RecitationDetail"
          component={RecitationDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
