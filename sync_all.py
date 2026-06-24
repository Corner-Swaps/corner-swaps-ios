import os
import shutil

def sync_assets():
    root_dir = "/Users/slava/Downloads/corner-swaps-ios"
    app_js_path = os.path.join(root_dir, "app.js")
    styles_css_path = os.path.join(root_dir, "styles.css")
    index_html_path = os.path.join(root_dir, "index.html")

    print("Reading source files...")
    with open(index_html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Ensure logo size class is correct (64px) for the native app
    target_logo = 'class="w-[140px] h-[140px] mb-4 object-contain"'
    replacement_logo = 'class="w-[64px] h-[64px] mb-4 object-contain"'
    if target_logo in html_content:
        print("Adjusting logo size class in index.html...")
        html_content = html_content.replace(target_logo, replacement_logo)
        with open(index_html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

    dest_dir = os.path.join(root_dir, "Corner Swaps")
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    print("Copying app.js to Corner Swaps...")
    shutil.copy2(app_js_path, os.path.join(dest_dir, "app.js"))

    print("Copying styles.css to Corner Swaps...")
    shutil.copy2(styles_css_path, os.path.join(dest_dir, "styles.css"))

    print("Copying index.html to Corner Swaps...")
    shutil.copy2(index_html_path, os.path.join(dest_dir, "index.html"))

    # Copy binary assets if they exist
    assets = ["safe_spot.jpg", "lily_avatar.jpg", "final_logo.png"]
    for asset in assets:
        asset_path = os.path.join(root_dir, asset)
        if os.path.exists(asset_path):
            print(f"Copying {asset} to Corner Swaps...")
            shutil.copy2(asset_path, os.path.join(dest_dir, asset))

    print("Synchronization completed successfully!")
    return True

if __name__ == "__main__":
    sync_assets()
