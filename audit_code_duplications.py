#!/usr/bin/env python3
"""
Comprehensive audit tool to detect code duplications and redundancies in the app folder
"""

import os
import sys
import difflib
import hashlib
from pathlib import Path

def calculate_file_hash(file_path):
    """Calculate MD5 hash of a file's content"""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return None

def compare_files(file1, file2):
    """Compare two files and return similarity percentage"""
    try:
        with open(file1, 'r', encoding='utf-8', errors='ignore') as f1:
            content1 = f1.readlines()
        with open(file2, 'r', encoding='utf-8', errors='ignore') as f2:
            content2 = f2.readlines()
        
        matcher = difflib.SequenceMatcher(None, content1, content2)
        return matcher.ratio() * 100
    except:
        return 0

def find_duplicate_files():
    """Find duplicate files based on content hash"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("🔍 SCANNING FOR DUPLICATE FILES")
    print("=" * 60)
    
    file_hashes = {}
    potential_duplicates = {}
    
    # Walk through all files in app directory
    for root, dirs, files in os.walk(app_path):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            if file.endswith(('.py', '.js', '.html', '.css')):
                file_path = os.path.join(root, file)
                file_hash = calculate_file_hash(file_path)
                
                if file_hash:
                    if file_hash in file_hashes:
                        if file_hash not in potential_duplicates:
                            potential_duplicates[file_hash] = [file_hashes[file_hash]]
                        potential_duplicates[file_hash].append(file_path)
                    else:
                        file_hashes[file_hash] = file_path
    
    # Report exact duplicates
    exact_duplicates_found = False
    for hash_val, files in potential_duplicates.items():
        if len(files) > 1:
            exact_duplicates_found = True
            print(f"\n🔴 EXACT DUPLICATES FOUND:")
            for file_path in files:
                rel_path = os.path.relpath(file_path, app_path)
                file_size = os.path.getsize(file_path)
                print(f"   📄 {rel_path} ({file_size} bytes)")
    
    if not exact_duplicates_found:
        print("✅ No exact duplicate files found")
    
    return potential_duplicates

def find_similar_files():
    """Find files with similar names that might be duplicates"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🔍 SCANNING FOR SIMILAR FILES")
    print("=" * 60)
    
    all_files = []
    
    # Collect all relevant files
    for root, dirs, files in os.walk(app_path):
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            if file.endswith(('.py', '.js', '.html', '.css')):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, app_path)
                all_files.append((file, rel_path, file_path))
    
    # Find files with similar names
    similar_groups = {}
    backup_files = []
    new_versions = []
    
    for file, rel_path, full_path in all_files:
        base_name = file.lower()
        
        # Check for backup files
        if '.backup' in base_name or '_backup' in base_name:
            backup_files.append((file, rel_path, full_path))
            continue
            
        # Check for "new" versions
        if '_new.' in base_name or '_new_' in base_name:
            new_versions.append((file, rel_path, full_path))
            continue
            
        # Group by base name (without extension)
        base_without_ext = os.path.splitext(base_name)[0]
        if base_without_ext not in similar_groups:
            similar_groups[base_without_ext] = []
        similar_groups[base_without_ext].append((file, rel_path, full_path))
    
    # Report backup files
    if backup_files:
        print("\n🟡 BACKUP FILES FOUND:")
        for file, rel_path, full_path in backup_files:
            file_size = os.path.getsize(full_path)
            print(f"   📄 {rel_path} ({file_size} bytes)")
    
    # Report "new" versions
    if new_versions:
        print("\n🟡 'NEW' VERSION FILES FOUND:")
        for file, rel_path, full_path in new_versions:
            file_size = os.path.getsize(full_path)
            print(f"   📄 {rel_path} ({file_size} bytes)")
    
    # Report groups with multiple similar files
    print("\n🟡 SIMILAR NAME GROUPS:")
    for base_name, files in similar_groups.items():
        if len(files) > 1:
            print(f"\n   📁 Group: {base_name}")
            for file, rel_path, full_path in files:
                file_size = os.path.getsize(full_path)
                print(f"      📄 {rel_path} ({file_size} bytes)")

def analyze_code_similarity():
    """Analyze code similarity between related files"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🔍 ANALYZING CODE SIMILARITY")
    print("=" * 60)
    
    # Specific file pairs to check
    file_pairs = [
        ('routes_rental_assets.py', 'routes_rental_assets_new.py'),
        ('dataset_updater.py', 'dataset_updater.py.backup'),
        ('ml_predictor.py', 'ml_predictor.py.backup'),
        ('static/js/sewakan_aset_new.js', 'static/js/sewakan_aset_new.js.backup'),
        ('templates/dashboard_admin.html', 'templates/dashboard_admin.html.backup')
    ]
    
    for file1_rel, file2_rel in file_pairs:
        file1_path = os.path.join(app_path, file1_rel)
        file2_path = os.path.join(app_path, file2_rel)
        
        if os.path.exists(file1_path) and os.path.exists(file2_path):
            similarity = compare_files(file1_path, file2_path)
            
            print(f"\n📊 Comparing: {file1_rel} vs {file2_rel}")
            print(f"   Similarity: {similarity:.1f}%")
            
            if similarity > 95:
                print("   🔴 VERY HIGH SIMILARITY - Likely duplicate")
            elif similarity > 80:
                print("   🟡 HIGH SIMILARITY - Check for redundancy")
            elif similarity > 50:
                print("   🟢 MODERATE SIMILARITY - May share common code")
            else:
                print("   ✅ LOW SIMILARITY - Different functionality")
        else:
            print(f"\n❌ Cannot compare: {file1_rel} vs {file2_rel} (file not found)")

def find_redundant_routes():
    """Find potentially redundant route definitions"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🔍 SCANNING FOR REDUNDANT ROUTES")
    print("=" * 60)
    
    route_files = []
    
    # Find all route files
    for root, dirs, files in os.walk(app_path):
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            if file.startswith('routes_') and file.endswith('.py'):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, app_path)
                route_files.append((file, rel_path, file_path))
    
    print(f"Found {len(route_files)} route files:")
    
    all_routes = {}
    
    for file, rel_path, full_path in route_files:
        print(f"\n📄 {rel_path}")
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract route definitions
            import re
            route_pattern = r"@\w+\.route\(['\"](.*?)['\"].*?\)"
            routes = re.findall(route_pattern, content)
            
            for route in routes:
                if route in all_routes:
                    all_routes[route].append(rel_path)
                else:
                    all_routes[route] = [rel_path]
                print(f"   🛣️  {route}")
                
        except Exception as e:
            print(f"   ❌ Error reading file: {e}")
    
    # Find duplicate routes
    print("\n🔍 DUPLICATE ROUTES FOUND:")
    duplicate_found = False
    for route, files in all_routes.items():
        if len(files) > 1:
            duplicate_found = True
            print(f"\n🔴 Route '{route}' defined in:")
            for file in files:
                print(f"   📄 {file}")
    
    if not duplicate_found:
        print("✅ No duplicate routes found")

def generate_cleanup_recommendations():
    """Generate recommendations for cleanup"""
    print("\n💡 CLEANUP RECOMMENDATIONS")
    print("=" * 60)
    
    recommendations = [
        "1. 🗑️  REMOVE BACKUP FILES:",
        "   - Delete .backup files after confirming they're no longer needed",
        "   - Consider using git for version control instead of manual backups",
        "",
        "2. 🔄 CONSOLIDATE DUPLICATE ROUTES:",
        "   - Merge routes_rental_assets.py and routes_rental_assets_new.py",
        "   - Keep the more comprehensive version (likely routes_rental_assets_new.py)",
        "   - Update imports in __init__.py accordingly",
        "",
        "3. 🧹 REMOVE REDUNDANT FILES:",
        "   - Remove dataset_updater.py.backup and ml_predictor.py.backup",
        "   - Remove static/js/sewakan_aset_new.js.backup",
        "   - Remove templates/dashboard_admin.html.backup",
        "",
        "4. 📋 STANDARDIZE NAMING:",
        "   - Use consistent naming conventions",
        "   - Avoid _new suffixes in production code",
        "   - Consider renaming files for clarity",
        "",
        "5. ⚡ PERFORMANCE IMPROVEMENTS:",
        "   - Remove unused imports and functions",
        "   - Consolidate similar functionality",
        "   - Optimize database queries in duplicate routes"
    ]
    
    for rec in recommendations:
        print(rec)

def main():
    """Main audit function"""
    print("🔍 CODE DUPLICATION AUDIT REPORT")
    print("=" * 60)
    print(f"Timestamp: {os.popen('date /t && time /t').read().strip()}")
    print(f"Target Directory: app/")
    print("=" * 60)
    
    # Run all audits
    find_duplicate_files()
    find_similar_files()
    analyze_code_similarity()
    find_redundant_routes()
    generate_cleanup_recommendations()
    
    print("\n" + "=" * 60)
    print("🏁 AUDIT COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
