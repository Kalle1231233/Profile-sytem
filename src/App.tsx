import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { MapScreen } from './screens/MapScreen';
import { colors } from './styles/colors';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <MapScreen />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
