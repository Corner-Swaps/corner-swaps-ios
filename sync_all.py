import re
import os
import shutil

def sync_assets():
    root_dir = "/Users/slava/Downloads/corner-swaps-ios"
    app_js_path = os.path.join(root_dir, "app.js")
    styles_css_path = os.path.join(root_dir, "styles.css")
    index_html_path = os.path.join(root_dir, "index.html")

    print("Reading source files...")
    with open(app_js_path, 'r', encoding='utf-8') as f:
        app_js_content = f.read().strip()

    # Prepend lily_avatar_base64.js only if LILY_AVATAR_BASE64 is not already defined in app.js
    lily_avatar_path = os.path.join(root_dir, "lily_avatar_base64.js")
    if os.path.exists(lily_avatar_path):
        if "LILY_AVATAR_BASE64" not in app_js_content:
            print("Prepending lily_avatar_base64.js content to JS bundle...")
            with open(lily_avatar_path, 'r', encoding='utf-8') as f:
                lily_avatar_content = f.read().strip()
            app_js_content = lily_avatar_content + "\n" + app_js_content
        else:
            print("LILY_AVATAR_BASE64 is already defined in app.js, skipping prepend to avoid SyntaxError.")

    with open(styles_css_path, 'r', encoding='utf-8') as f:
        styles_css_content = f.read().strip()

    with open(index_html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # 1. Replace logo size class if needed
    target_logo = 'class="w-[140px] h-[140px] mb-4 object-contain"'
    replacement_logo = 'class="w-[64px] h-[64px] mb-4 object-contain"'
    html_content = html_content.replace(target_logo, replacement_logo)

    # 2. Sync JS content
    comment_marker = '<!-- Application Logic Javascript -->'
    comment_idx = html_content.find(comment_marker)
    if comment_idx == -1:
        print("Error: Could not find JS comment marker.")
        return False
    
    js_start_idx = html_content.find('<script>', comment_idx)
    if js_start_idx == -1:
        print("Error: Could not find <script> tag after comment.")
        return False
    js_start_idx += len('<script>')
    
    js_end_marker = '// Global scope ends'
    js_end_idx = html_content.find(js_end_marker, js_start_idx)
    if js_end_idx == -1:
        print("Error: Could not find JS end marker.")
        return False
    # Find </script> after the JS end marker
    js_script_end_idx = html_content.find('</script>', js_end_idx)
    if js_script_end_idx == -1:
        print("Error: Could not find </script> after JS end marker.")
        return False
    js_end_idx_pos = js_script_end_idx + len('</script>')

    # 3. Sync CSS content
    css_start_marker = '<style>/* Custom CSS for Barterland - Organic Modernism Theme */'
    css_end_marker = '</style>'
    
    css_start_idx = html_content.find(css_start_marker)
    if css_start_idx == -1:
        print("Error: Could not find CSS start marker.")
        return False
    
    css_start_idx_pos = css_start_idx + len(css_start_marker)
    css_end_idx = html_content.find(css_end_marker, css_start_idx_pos)
    if css_end_idx == -1:
        print("Error: Could not find CSS end marker.")
        return False

    # Construct compiled HTML
    # We perform the replacements. To avoid index shifting problems, we do CSS replacement first (since it is earlier in the file), then JS replacement.
    part1 = html_content[:css_start_idx_pos]
    part2 = "\n" + styles_css_content + "\n"
    part3 = html_content[css_end_idx:]

    html_content_temp = part1 + part2 + part3

    # Now find JS markers in the temp HTML
    comment_idx_temp = html_content_temp.find(comment_marker)
    if comment_idx_temp == -1:
        print("Error: Could not find JS comment marker in temp HTML.")
        return False
    
    js_start_idx = html_content_temp.find('<script>', comment_idx_temp)
    if js_start_idx == -1:
        print("Error: Could not find <script> tag after comment in temp HTML.")
        return False
    js_start_idx += len('<script>')
    
    js_end_idx = html_content_temp.find(js_end_marker, js_start_idx)
    if js_end_idx == -1:
        print("Error: Could not find JS end marker in temp HTML.")
        return False
    js_script_end_idx = html_content_temp.find('</script>', js_end_idx)
    if js_script_end_idx == -1:
        print("Error: Could not find </script> after JS end marker in temp HTML.")
        return False
    js_end_idx_pos = js_script_end_idx

    wrapped_js = "\n" + app_js_content + "\n"
    final_html_content = html_content_temp[:js_start_idx] + wrapped_js + html_content_temp[js_end_idx_pos:]

    # Save root index.html
    with open(index_html_path, 'w', encoding='utf-8') as f:
        f.write(final_html_content)
    print("Successfully compiled root index.html")

    # 4. Copy root files to Corner Swaps/ subdirectory
    dest_dir = os.path.join(root_dir, "Corner Swaps")
    
    print("Copying app.js to Corner Swaps...")
    shutil.copy2(app_js_path, os.path.join(dest_dir, "app.js"))
    
    print("Copying styles.css to Corner Swaps...")
    shutil.copy2(styles_css_path, os.path.join(dest_dir, "styles.css"))
    
    print("Copying index.html to Corner Swaps...")
    shutil.copy2(index_html_path, os.path.join(dest_dir, "index.html"))

    print("Synchronization completed successfully!")
    return True

if __name__ == "__main__":
    sync_assets()
