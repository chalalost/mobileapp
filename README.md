This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.



******** hướng dẫn cài đặt và đổi version của react native *************

các Plugin dùng trong app => add thư viện nào thì add vào đây
   - các thư viện ko cần config native
      "@react-native-async-storage/async-storage": "^1.19.3",
      "@react-native-community/datetimepicker": "^7.6.1",
      "@react-navigation/drawer": "^6.6.6",
      "@react-navigation/material-bottom-tabs": "^6.2.19",
      "@react-navigation/native": "^6.1.9",
      "@react-navigation/native-stack": "^6.9.16",
      "axios": "^1.5.1",
      "jwt-decode": "^3.1.2",
      "moment": "^2.29.4",
      "react": "18.2.0",
      "react-native": "0.72.6",
      "react-native-bouncy-checkbox": "^3.0.7",
      "react-native-circular-progress-indicator": "^4.4.2",
      "react-native-gesture-handler": "^2.13.3",
      "react-native-input-spinner": "^1.8.1",
      "react-native-keyboard-aware-scroll-view": "^0.9.5",
      "react-native-linear-gradient": "^2.8.3",
      "react-native-loading-spinner-overlay": "^3.0.1",
      "react-native-modal": "^13.0.1",
      "react-native-modal-datetime-picker": "^17.1.0",
      "react-native-paper": "^5.11.0",
      "react-native-popup-menu": "^0.16.1",
      "react-native-reanimated": "^3.5.4",
      "react-native-safe-area-context": "^4.7.3",
      "react-native-screens": "^3.26.0",
      "react-native-sound": "^0.11.2",
      "react-native-svg": "^13.14.0",
      "react-redux": "^8.1.3",
      "redux-saga": "^1.2.3",
      "reselect": "^4.1.8",
      "victory-native": "^36.6.11"

   - các thư viện cần config vào native (Chỉ rõ từng phần nào và link document)





***** => add icon vào app bộ icon được gen bới phần mềm
   - ios: => ios/evomesmobile/Images.xcassets
   - androif => android/app/src/main/res

***** => add front vào app
   - Tải font về và add vào PROJECT-DIRECTORY/assets/fonts (add vào chỗ nào cũng được)
   - Tạo mới file js: react-native.config.js => content =>
                                                   module.exports = {
                                                      project: {
                                                         ios: {},
                                                         android: {},
                                                      },
                                                      assets: ['./src/fonts/Mulish'],
                                                      dependencies: {
                                                   
                                                      },
                                                   };
                                                
=> sau đó chạy "npx react-native-asset" để gắn các link => sau đó chay lai metro va cac bundel

***** => INTERNET xem lại Readme_Old.md











