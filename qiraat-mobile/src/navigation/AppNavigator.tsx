import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";

import MiniPlayer from "../components/MiniPlayer";
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
      <View style={styles.container}>
        <View style={styles.content}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="RecitationDetail"
              component={RecitationDetailScreen}
            />
          </Stack.Navigator>
        </View>
        <MiniPlayer />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
