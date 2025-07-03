import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Paroliamo from './src/screens/Paroliamo';
const MaterialCommunityIcons =
  require('react-native-vector-icons/MaterialCommunityIcons').default;

const App = () => {
  return (
    <PaperProvider
      settings={{
        icon: ({name, color, size}) => (
          <MaterialCommunityIcons name={name} color={color} size={size} />
        ),
      }}>
      <Paroliamo />
    </PaperProvider>
  );
};

export default App;
