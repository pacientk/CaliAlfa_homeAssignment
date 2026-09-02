import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Configures the default Firebase app from GoogleService-Info.plist, which the target
    // copies into the bundle. React Native Firebase does not do this for you: it resolves
    // FIRApp lazily on first use, so this has to run before the JS bundle evaluates and
    // the auth feature subscribes its session listener.
    FirebaseApp.configure()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    let window = UIWindow(frame: UIScreen.main.bounds)
    self.window = window

    factory.startReactNative(
      withModuleName: "CaliAlfa",
      in: window,
      launchOptions: launchOptions
    )

    holdLaunchScreen(over: window)

    return true
  }

  /// How long the launch screen stays up after React Native has taken the window.
  private static let launchScreenHold: TimeInterval = 2

  /// The system tears its own copy of the launch screen down as soon as the root view controller
  /// is on screen, which happens before the JS bundle has finished evaluating — so the mark
  /// flashes past rather than reading as a splash. This puts an identical view back on top and
  /// removes it on a timer.
  ///
  /// The overlay is the launch storyboard itself rather than a second copy of that layout, so the
  /// two cannot drift apart when one is edited.
  ///
  /// This is a delay, not a readiness gate. The app is live underneath the whole time and nothing
  /// here waits on it: the timer only decides when it becomes visible, so a slow start shows for
  /// however long it takes and a fast one is still held. Deliberately trading startup time for a
  /// brand beat.
  private func holdLaunchScreen(over window: UIWindow) {
    guard
      let launchScreen = UIStoryboard(name: "LaunchScreen", bundle: nil)
        .instantiateInitialViewController()?.view
    else {
      // Nothing to hold if the storyboard is missing; the app is already usable underneath.
      return
    }

    launchScreen.frame = window.bounds
    launchScreen.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    window.addSubview(launchScreen)

    DispatchQueue.main.asyncAfter(deadline: .now() + Self.launchScreenHold) {
      UIView.animate(
        withDuration: 0.25,
        animations: { launchScreen.alpha = 0 },
        completion: { _ in launchScreen.removeFromSuperview() }
      )
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
