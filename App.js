import React from 'react';
import {View, Text, StyleSheet, Pressable, Platform, Alert} from 'react-native';
import {
  request,
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
} from 'react-native-permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {get} from 'lodash';
import DocumentPicker, {isInProgress} from 'react-native-document-picker';
const App = () => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      borderRadius: 20,
      marginBottom: 20,
    },
    text: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 20,
    },
  });

  const Button = props => (
    <Pressable style={styles.button} onPress={props.onPress}>
      <Text style={styles.text}>{props.text}</Text>
    </Pressable>
  );
  const options = {
    mediaType: 'photo',
    cameraType: 'back',
    saveToPhotos: true,
  };

  const genericError = error => Alert.alert('Error', error);

  const permissionNoGrantted = () =>
    Alert.alert(
      'Permisos no autorizados',
      'Los permisos fuero rechazados, para poder utilizar esta funcionalidad, debes activarla manualmente',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Ir a configuracion',
          onPress: () => openSettings(),
        },
      ],
    );

  const genericRequestPermission = async (permission, fnToExecute) => {
    const permissionParse = get(
      PERMISSIONS,
      `${Platform.OS.toUpperCase()}.${permission.toUpperCase()}`,
      permission,
    );
    console.log(await check(permissionParse));
    const permissionStatus = await check(permissionParse);
    try {
      if (permissionStatus === RESULTS.DENIED) {
        if ((await request(permissionParse)) === RESULTS.GRANTED) {
          return await fnToExecute();
        }
      }
      if (
        permissionStatus === RESULTS.BLOCKED ||
        permissionStatus === RESULTS.LIMITED ||
        permissionStatus === RESULTS.UNAVAILABLE
      ) {
        permissionNoGrantted();
        return null;
      }
      if (permissionStatus === RESULTS.GRANTED) {
        return await fnToExecute();
      }
    } catch (error) {
      genericError(error);
    }
  };

  const onPressCamara = async () => {
    const permissionResponse = await genericRequestPermission('CAMERA', () =>
      launchCamera(options),
    );
    console.log(permissionResponse);
  };

  const onPressGallery = async () => {
    const permissionResponse = await genericRequestPermission(
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.PHOTO_LIBRARY,
      () => launchImageLibrary(options),
    );
    console.log(permissionResponse);
  };

  const onPressFile = async () => {
    const op = {
      presentationStyle: 'fullScreen',
      copyTo: 'cachesDirectory',
    };
    try {
      const permissionResponse = await genericRequestPermission(
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.MEDIA_LIBRARY,
        () => DocumentPicker.pickSingle(op),
      );

      console.log(permissionResponse);
    } catch (e) {
      handleError(e);
    }
  };

  const handleError = err => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled');
    } else if (isInProgress(err)) {
      console.warn(
        'multiple pickers were opened, only the last will be considered',
      );
    } else {
      genericError(err);
    }
  };

  return (
    <View style={styles.container}>
      <Button text="Open Camera" onPress={onPressCamara} />
      <Button text="Open File" onPress={onPressFile} />
      <Button text="Open Gallery" onPress={onPressGallery} />
    </View>
  );
};

export default App;
