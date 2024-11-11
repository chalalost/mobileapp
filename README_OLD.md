build android: lam theo (https://reactnative.dev/docs/signed-apk-android)

- Generating an upload key vào thư mục java (C:\Program Files\Java\jdkx.x.x_x\bin) chạy keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
-- điền password: 123456aA@
- copy my-upload-key.keystore vào android/app/
  **_ Generating the release AAB upload google play: => Generating the release AAB: cd android => ./gradlew bundleRelease
  _** + Generating file apk run drive android: => Generating the release AAB: cd android => ./gradlew bundleRelease (android/app/build/outputs/bundle/release/app-release.aab)

      + ./gradlew assembleDebug => ra file apk chạy bẳng server metro
      + ./gradlew assembleRelease => đóng gói ra file apk để chạy độc lập =>android\app\build\outputs\apk\release

- trong trường hợp không gọi được Api sau khi đã đóng gói ra file apk:
  tìm đến AndroidManifest.xml : /android/app/src/main/AndroidManifest.xml
  '
  <manifest ...>
  <uses-permission android:name="android.permission.INTERNET" />
  <application
  ...
  android:usesCleartextTraffic="true" <-- thêm đoạn này
  ...>
  ...
  </application>
  </manifest>
  '

build IOS:

- trong file ios/podfile thêm :
  # Flags change depending on the env values.
  flags = get_default_flags()
  #thêm bên dưới đoạn code này#
  pod 'Firebase', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'GoogleUtilities', :modular_headers => true



*** note
lỗi prop-types https://github.com/react-native-camera/react-native-camera/issues/3427


+ ađ font: npx react-native-asset (https://blog.logrocket.com/adding-custom-fonts-react-native/) => chay lai metro va cac bundel



** loi phien ban
In iOS Folder go to Pods/Pods.xcodeproj/xcuserdata/project.pbxproj

Change all the 'IPHONEOS_DEPLOYMENT_TARGET = 11.0' to 'IPHONEOS_DEPLOYMENT_TARGET = 12.4'. save and run.

Note: every time you pod install it will change so again you have to do it. If there is better approach please do mention.
