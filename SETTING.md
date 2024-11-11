- Hướng dẫn cài đặt cho người sử dụng macos => home brew => cài đặt cái thư viện, /bin/zsh dùng /bin/bash có thế sẽ khác =))
  + Document: https://reactnative.dev/docs/environment-setup#ruby
  + Cài đặt và kiểm tra => brew install node, brew install watchman
  + Kiểm tra và cài đặt ruby sao cho version phù hợp với version ứng dung
      + ruby --version (Kiểm tra version)
      + Install: https://mac.install.guide/ruby/13.html
      + uninstall: https://mac.install.guide/ruby/9.html
      + Gỡ hoàn toàn trước khi cài đặt, kiểm tra cấu hình biến môi trường trong file ~/.zshrc
      + cài cocoapods: sudo gem install cocoapods =>
      + fix lỗi: https://www.positioniseverything.net/you-dont-have-write-permissions-for-the/library/ruby/gems/2.6.0-directory/
      


  + Gõ gói toàn cầu để tránh lỗi: npm uninstall -g react-native-cli @react-native-community/cli
  + Tạo một project mới:npx react-native@latest init AwesomeProject => (AwesomeProject) thay thế tên project tương ứng, npx react-native init newproject --version X.XX.X => khởi tạo theo version bao nhiêu
  + Trong lúc tạo project nếu lỗi thì đọc lỗi:
      + Lỗi về ruby thì đọc lỗi và tìm version phù hợp để cài
      + Lỗi về ios => Thư mục gốc của dự án => cd ios => bundle install để cài đặt Bundler (Nếu cần: cài đặt Trình quản lý phiên bản Ruby và cập nhật phiên bản Ruby) => bundle exec pod install để cài đặt các phụ thuộc iOS or "pod install"

  + cái đặt thành công thì khởi chạy project: 
      + => npx react-native start => để khởi chạy metro
      + npx react-native run-ios => chaỵ máy áo ios => nếu ko chạy được thì mở excode đọc lỗi và kiểm tra xem version của xcode, kiểm tra xem máy áo hiện tại dùng ios bao nhiêu có phù hợp với dự án
      + npx react-native run-android => chạy máy ảo android => nếu ko chạy được thì mở android studio mới đến folder android rồi chạy, android studio sẽ update gradle nếu cần, cài đặt và chọn máy ảo (skd manage và Virtual device manager);



- cài đặt cái biến môi trường config file .zshrc => file này đặt tại => /Users/trinhdinhdung (User/ tên máy) => pwd để xem đường dẫn thư mục, ls -a để xem file ẩn .., tìm hiểu thêm về các lệnh
      + Đối với cài đặt ruby
        if [ -d "/usr/local/opt/ruby/bin" ]; then
          export PATH=/usr/local/opt/ruby/bin:$PATH
          export PATH=`gem environment gemdir`/bin:$PATH
        fi
      + Đối với npx react-native run-android => ko chạy máy ảo android cài đặt path cho android studio => lỗi adb => (Failed to connect to development server using "adb reverse": spawnSync adb ENOENT)
          export ANDROID_SDK=/Users/trinhdinhdung/Library/Android/sdk
          export PATH=/Users/trinhdinhdung/Library/Android/sdk/platform-tools:$PATH



* Lưu ý đối với ios




* Lưu ý đối với android






* Build và đẩy app với ios
 - đẩy app lên môi trường tetsFlight













* Build và đẩy app với android






---- 1 vài link cần xem qua 
  + https://morioh.com/p/e40dea6c2f24



---- kiểm tra cập nhật và nâng cấp
 => https://github.com/facebook/react-native/releases






 **** 1 vài lỗi 
 + lỗi không tìm thấy node: https://stackoverflow.com/questions/44492197/react-native-ios-build-cant-find-node





**** => sau khi cài xong 1 project	
  Run instructions for Android:
    • Have an Android emulator running (quickest way to get started), or a device connected.
    • cd "/Users/trinhdinhdung/Desktop/react-native/react_native_upversion/RN0730RC2" && npx react-native run-android
  
  Run instructions for iOS:
    • cd "/Users/trinhdinhdung/Desktop/react-native/react_native_upversion/RN0730RC2" && npx react-native run-ios
    - or -
    • Open RN0730RC2/ios/RN0730RC2.xcworkspace in Xcode or run "xed -b ios"
    • Hit the Run button
    
  Run instructions for macOS:
    • See https://aka.ms/ReactNativeGuideMacOS for the latest up-to-date instructions.
