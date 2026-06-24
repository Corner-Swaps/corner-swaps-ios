import os
import sys
import time
import subprocess
from PIL import Image, ImageFilter, ImageDraw

PROJECT_DIR = "/Users/slava/Downloads/corner-swaps-ios"
ASSETS_DIR = os.path.join(PROJECT_DIR, "gofundme_promo_assets")
APP_JS = os.path.join(PROJECT_DIR, "app.js")
APP_JS_BAK = os.path.join(PROJECT_DIR, "app.js.bak")

# Target views and file paths
VIEWS = {
    "feed": {
        "raw": os.path.join(ASSETS_DIR, "view1_feed_raw.png"),
        "polished": os.path.join(ASSETS_DIR, "local_neighborhood_feed.jpg")
    },
    "profile": {
        "raw": os.path.join(ASSETS_DIR, "view2_profile_raw.png"),
        "polished": os.path.join(ASSETS_DIR, "user_profile_inventory.jpg")
    },
    "chat": {
        "raw": os.path.join(ASSETS_DIR, "view3_chat_raw.png"),
        "polished": os.path.join(ASSETS_DIR, "active_chat_interface.jpg")
    }
}

def log(msg):
    print(f"[*] {msg}")
    sys.stdout.flush()

def make_assets_dir():
    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)
        log(f"Created directory: {ASSETS_DIR}")
    else:
        log(f"Directory already exists: {ASSETS_DIR}")

def inject_test_flow():
    log("Injecting automated screenshot flow into app.js...")
    with open(APP_JS, "r") as f:
        content = f.read()
    
    # Backup
    with open(APP_JS_BAK, "w") as f:
        f.write(content)
        
    target_pattern = """                    window.isAppStartup = false;
                    if (leafletMap) {
                        leafletMap.invalidateSize();
                        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 50);
                        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 150);
                        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 400);
                    }"""
                    
    replacement = """                    window.isAppStartup = false;
                    if (leafletMap) {
                        leafletMap.invalidateSize();
                        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 50);
                        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 150);
                        setTimeout(() => { if (leafletMap) leafletMap.invalidateSize(); }, 400);
                    }
                    
                    // SCREENSHOT FLOW NAVIGATION SEQUENCE
                    setTimeout(() => {
                        console.log("LOG: [SCREENSHOT_FLOW] VIEW 1 READY");
                        
                        setTimeout(() => {
                            console.log("LOG: [SCREENSHOT_FLOW] Navigating to user profile...");
                            handleNavbarTap('profile_settings');
                            setTimeout(() => {
                                console.log("LOG: [SCREENSHOT_FLOW] VIEW 2 READY");
                                
                                setTimeout(() => {
                                    console.log("LOG: [SCREENSHOT_FLOW] Navigating to chat...");
                                    startChatConversation('Amelia');
                                    setTimeout(() => {
                                        console.log("LOG: [SCREENSHOT_FLOW] VIEW 3 READY");
                                    }, 2000);
                                }, 3000);
                            }, 2000);
                        }, 3000);
                    }, 2000);"""
                    
    if target_pattern not in content:
        raise ValueError("Could not find insertion pattern in app.js!")
        
    content = content.replace(target_pattern, replacement)
    
    with open(APP_JS, "w") as f:
        f.write(content)
    log("Successfully injected flow.")

def restore_app_js():
    log("Restoring app.js to original state...")
    if os.path.exists(APP_JS_BAK):
        os.replace(APP_JS_BAK, APP_JS)
        log("Restored app.js from backup.")
    else:
        log("No backup found to restore.")

def compile_and_build():
    log("Synchronizing compiled assets via sync_all.py...")
    subprocess.run(["python3", "sync_all.py"], cwd=PROJECT_DIR, check=True)
    
    log("Rebuilding Xcode project...")
    subprocess.run([
        "xcodebuild",
        "-project", "Corner Swaps.xcodeproj",
        "-scheme", "Corner Swaps",
        "-sdk", "iphonesimulator",
        "-configuration", "Debug",
        "clean", "build"
    ], cwd=PROJECT_DIR, check=True)
    
    log("Installing the app on the simulator...")
    app_path = os.path.expanduser("~/Library/Developer/Xcode/DerivedData/Corner_Swaps-cskulansoqcunydkedfhxnpxvbuo/Build/Products/Debug-iphonesimulator/Corner Swaps.app")
    subprocess.run(["xcrun", "simctl", "install", "booted", app_path], check=True)
    log("App installed.")

def run_screenshot_capture():
    log("Launching app to capture screenshots...")
    # Launch simulator and capture stdout in real-time
    process = subprocess.Popen([
        "xcrun", "simctl", "launch",
        "--terminate-running-process",
        "--console", "booted", "com.cornerswaps.app"
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    captured = {
        "feed": False,
        "profile": False,
        "chat": False
    }
    
    try:
        for line in process.stdout:
            sys.stdout.write(line)
            sys.stdout.flush()
            
            if "[SCREENSHOT_FLOW] VIEW 1 READY" in line:
                log("Tapping Screenshot 1: Local Neighborhood Feed...")
                time.sleep(0.5) # let rendering settle
                subprocess.run(["xcrun", "simctl", "io", "booted", "screenshot", VIEWS["feed"]["raw"]], check=True)
                captured["feed"] = True
                
            elif "[SCREENSHOT_FLOW] VIEW 2 READY" in line:
                log("Tapping Screenshot 2: User Profile/Inventory...")
                time.sleep(0.5)
                subprocess.run(["xcrun", "simctl", "io", "booted", "screenshot", VIEWS["profile"]["raw"]], check=True)
                captured["profile"] = True
                
            elif "[SCREENSHOT_FLOW] VIEW 3 READY" in line:
                log("Tapping Screenshot 3: Active Chat Interface...")
                time.sleep(0.5)
                subprocess.run(["xcrun", "simctl", "io", "booted", "screenshot", VIEWS["chat"]["raw"]], check=True)
                captured["chat"] = True
                break # Finished capturing
                
    except Exception as e:
        log(f"Error during screenshot capture: {e}")
    finally:
        log("Terminating app process...")
        process.terminate()
        subprocess.run(["xcrun", "simctl", "terminate", "booted", "com.cornerswaps.app"], stderr=subprocess.DEVNULL)
        
    return captured

def post_process_images():
    log("Processing captured screenshots with Pillow...")
    canvas_w, canvas_h = 1080, 1080
    target_h = 820
    
    c1 = (210, 222, 212) # Soft organic sage green
    c2 = (253, 251, 247) # Warm cream
    
    # Shadow styling
    shadow_offset_x = 0
    shadow_offset_y = 20
    shadow_blur_radius = 30
    shadow_opacity = 0.18
    radius = 36
    
    for view_name, paths in VIEWS.items():
        raw_path = paths["raw"]
        polished_path = paths["polished"]
        
        if not os.path.exists(raw_path):
            log(f"Warning: Raw screenshot not found for {view_name} at {raw_path}")
            continue
            
        img = Image.open(raw_path).convert("RGBA")
        
        # Scale screenshot
        target_w = int(img.width * (target_h / img.height))
        img_scaled = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Background gradient
        bg = Image.new("RGBA", (canvas_w, canvas_h))
        for y in range(canvas_h):
            for x in range(canvas_w):
                t = (x + y) / (canvas_w + canvas_h)
                r = int(c1[0] * (1 - t) + c2[0] * t)
                g = int(c1[1] * (1 - t) + c2[1] * t)
                b = int(c1[2] * (1 - t) + c2[2] * t)
                bg.putpixel((x, y), (r, g, b, 255))
                
        pos_x = (canvas_w - target_w) // 2
        pos_y = (canvas_h - target_h) // 2
        
        # Clip rounded corners mask
        mask = Image.new("L", (target_w, target_h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, target_w, target_h], radius=radius, fill=255)
        
        img_rounded = Image.new("RGBA", (target_w, target_h))
        img_rounded.paste(img_scaled, (0, 0), mask=mask)
        
        # Shadow mask
        shadow_draw = Image.new("L", (target_w, target_h), 0)
        draw = ImageDraw.Draw(shadow_draw)
        draw.rounded_rectangle([0, 0, target_w, target_h], radius=radius, fill=int(255 * shadow_opacity))
        
        # Shadow layer
        shadow_layer = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
        shadow_layer.paste((15, 25, 18, 255), (pos_x + shadow_offset_x, pos_y + shadow_offset_y), mask=shadow_draw)
        shadow_blurred = shadow_layer.filter(ImageFilter.GaussianBlur(shadow_blur_radius))
        
        # Composite
        final_img = Image.alpha_composite(bg, shadow_blurred)
        final_img.paste(img_rounded, (pos_x, pos_y), mask=mask)
        
        final_img.convert("RGB").save(polished_path, "JPEG", quality=95)
        log(f"Successfully saved polished asset: {polished_path}")

def main():
    try:
        make_assets_dir()
        inject_test_flow()
        compile_and_build()
        captured = run_screenshot_capture()
        
        log(f"Capture results: {captured}")
        
        if all(captured.values()):
            log("All screenshots captured successfully!")
        else:
            log("Warning: Not all screenshots were captured successfully.")
            
        post_process_images()
        
    finally:
        restore_app_js()
        log("Restoring and compiling app assets to ensure clean repository...")
        try:
            compile_and_build()
        except Exception as e:
            log(f"Error during final rebuild: {e}")
            
    log("Workflow complete!")

if __name__ == "__main__":
    main()
