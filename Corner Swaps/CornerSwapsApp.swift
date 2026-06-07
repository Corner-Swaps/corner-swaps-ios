import SwiftUI
import FirebaseCore

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        FirebaseApp.configure()
        
        // Force Firebase Debug Mode to bypass the Xcode bug
        UserDefaults.standard.set(true, forKey: "/google/firebase/debug_mode")
        UserDefaults.standard.set(true, forKey: "/google/measurement/debug_mode")
        
        return true
    }
}

@main
struct CornerSwapsApp: App {
    
    // register app delegate for Firebase setup
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

