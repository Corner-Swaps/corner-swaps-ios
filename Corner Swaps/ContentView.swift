import SwiftUI
import WebKit

class LogMessageHandler: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if let bodyString = message.body as? String {
            NSLog("[JS LOG] %@", bodyString)
            print("[JS LOG] \(bodyString)")
            fflush(stdout)
        }
    }
}

class HapticMessageHandler: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        DispatchQueue.main.async {
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.prepare()
            generator.impactOccurred()
        }
    }
}

struct WebView: UIViewRepresentable {
    let html: String
    
    class Coordinator: NSObject, UIScrollViewDelegate, WKNavigationDelegate, WKUIDelegate {
        func viewForZooming(in scrollView: UIScrollView) -> UIView? {
            return nil
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url {
                let scheme = url.scheme?.lowercased() ?? ""
                let host = url.host?.lowercased() ?? ""
                
                // Intercept custom schemes (sms, mailto, tel, whatsapp, instagram, tiktok, fb, etc.)
                if scheme != "http" && scheme != "https" && scheme != "file" && scheme != "about" && scheme != "data" {
                    UIApplication.shared.open(url, options: [:], completionHandler: nil)
                    decisionHandler(.cancel)
                    return
                }
                
                // Intercept social app domains to open them natively in Safari/respective apps
                if host.contains("instagram.com") || host.contains("tiktok.com") || host.contains("facebook.com") || host.contains("fb.com") || host.contains("whatsapp.com") {
                    UIApplication.shared.open(url, options: [:], completionHandler: nil)
                    decisionHandler(.cancel)
                    return
                }
            }
            decisionHandler(.allow)
        }
        
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            NSLog("[SWIFT] Web view did finish navigation")
            print("[SWIFT] Web view did finish navigation")
            fflush(stdout)
            webView.hideAccessoryBar()
            
            // Make background transparent after loading to show ZStack themed background under keyboard
            webView.backgroundColor = .clear
            webView.scrollView.backgroundColor = .clear
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            NSLog("[SWIFT ERROR] didFailProvisionalNavigation: %@", error.localizedDescription)
            print("[SWIFT ERROR] didFailProvisionalNavigation: \(error.localizedDescription)")
            fflush(stdout)
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            NSLog("[SWIFT ERROR] didFail: %@", error.localizedDescription)
            print("[SWIFT ERROR] didFail: \(error.localizedDescription)")
            fflush(stdout)
        }

        // Handle JS Alert panel
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            NSLog("[SWIFT ALERT] %@", message)
            let alertController = UIAlertController(title: "Corner Swaps", message: message, preferredStyle: .alert)
            alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in
                completionHandler()
            }))
            
            if let rootVC = webView.window?.rootViewController {
                rootVC.present(alertController, animated: true, completion: nil)
            } else {
                completionHandler()
            }
        }
        
        // Handle JS Confirm panel
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            NSLog("[SWIFT CONFIRM] %@", message)
            let alertController = UIAlertController(title: "Corner Swaps", message: message, preferredStyle: .alert)
            alertController.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { _ in
                completionHandler(false)
            }))
            alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: { _ in
                completionHandler(true)
            }))
            
            if let rootVC = webView.window?.rootViewController {
                rootVC.present(alertController, animated: true, completion: nil)
            } else {
                completionHandler(false)
            }
        }

        // Handle target="_blank" and window.open links to open natively in Safari / native apps
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = navigationAction.request.url {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
            return nil
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        
        let logHandler = LogMessageHandler()
        configuration.userContentController.add(logHandler, name: "logHandler")
        
        let hapticHandler = HapticMessageHandler()
        configuration.userContentController.add(hapticHandler, name: "hapticHandler")
        
        let js = """
        if (document.documentElement) {
            document.documentElement.classList.add('native-app-env');
        }
        window.isNativeApp = true;
        window.onerror = function(message, source, lineno, colno, error) {
            window.webkit.messageHandlers.logHandler.postMessage("ERROR: " + message + " at " + source + ":" + lineno);
        };
        var originalLog = console.log;
        console.log = function() {
            originalLog.apply(console, arguments);
            window.webkit.messageHandlers.logHandler.postMessage("LOG: " + Array.from(arguments).join(" "));
        };
        var originalError = console.error;
        console.error = function() {
            originalError.apply(console, arguments);
            window.webkit.messageHandlers.logHandler.postMessage("ERROR: " + Array.from(arguments).join(" "));
        };
        """
        let userScript = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        configuration.userContentController.addUserScript(userScript)

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.delegate = context.coordinator
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        
        webView.isOpaque = false
        let splashColor = UIColor(red: 69/255.0, green: 122/255.0, blue: 86/255.0, alpha: 1.0)
        webView.backgroundColor = splashColor
        webView.scrollView.backgroundColor = splashColor
        webView.hideAccessoryBar()
        
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.alwaysBounceHorizontal = false
        
        NSLog("[SWIFT] Loading self-contained HTML string...")
        print("[SWIFT] Loading self-contained HTML string...")
        fflush(stdout)
        webView.loadHTMLString(html, baseURL: Bundle.main.resourceURL)
        
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
    }
}

struct ContentView: View {
    @Environment(\.colorScheme) var colorScheme
    @State private var webHTML: String? = nil
    @State private var initError: String? = nil
    
    var body: some View {
        ZStack {
            if colorScheme == .dark {
                Color(red: 16/255.0, green: 22/255.0, blue: 18/255.0)
            } else {
                Color(red: 69/255.0, green: 122/255.0, blue: 86/255.0)
            }
            
            if let error = initError {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(.yellow)
                    Text("Corner Swaps Diagnostics")
                        .font(.headline)
                        .foregroundColor(.white)
                    Text(error)
                        .font(.body)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(red: 69/255.0, green: 122/255.0, blue: 86/255.0))
            } else if let html = webHTML {
                WebView(html: html)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .ignoresSafeArea()
            } else {
                VStack {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    Text("Preparing app resources...")
                        .foregroundColor(.white)
                        .padding(.top, 8)
                }
            }
        }
        .edgesIgnoringSafeArea(.all)
        .onAppear {
            prepareWebAssets()
        }
    }
    
    private func prepareWebAssets() {
        let bundle = Bundle(for: LogMessageHandler.self)
        var bundleURL: URL? = bundle.url(forResource: "index", withExtension: "html")
        if bundleURL == nil {
            bundleURL = Bundle.main.url(forResource: "index", withExtension: "html")
        }
        
        guard let srcURL = bundleURL else {
            initError = "index.html not found in any bundle"
            return
        }
        
        do {
            let htmlString = try String(contentsOf: srcURL, encoding: .utf8)
            if htmlString.isEmpty {
                initError = "Loaded index.html is empty"
            } else {
                webHTML = htmlString
            }
        } catch {
            initError = "Error reading index.html: \(error.localizedDescription)"
        }
    }
}

#Preview {
    ContentView()
}

// MARK: - WKWebView Input Accessory Removal Extension
extension WKWebView {
    func hideAccessoryBar() {
        guard let contentView = self.scrollView.subviews.first(where: { 
            type(of: $0).description().hasPrefix("WKContent") 
        }) else { return }
        
        let objClass: AnyClass = type(of: contentView)
        let className = "\(objClass)_NoAccessory"
        
        var subclass: AnyClass? = NSClassFromString(className)
        if subclass == nil {
            subclass = objc_allocateClassPair(objClass, className, 0)
            if let subclass = subclass {
                let imp: @convention(block) (AnyObject) -> AnyObject? = { _ in nil }
                class_addMethod(subclass, Selector(("inputAccessoryView")), imp_implementationWithBlock(imp), "@@:")
                objc_registerClassPair(subclass)
            }
        }
        
        if let subclass = subclass {
            object_setClass(contentView, subclass)
        }
    }
}

