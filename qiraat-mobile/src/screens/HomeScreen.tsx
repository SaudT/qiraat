import { Button, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Recitations</Text>
      <Button
        title="Go to Detail"
        onPress={() => navigation.navigate("RecitationDetail")}
      />
    </View>
  );
}
