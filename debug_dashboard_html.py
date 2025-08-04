import requests

def debug_dashboard_html():
    """Debug actual HTML content returned by dashboard"""
    
    print("🔍 DEBUG: User Dashboard HTML Content")
    print("=" * 50)
    
    try:
        response = requests.get('http://127.0.0.1:5000/user-dashboard')
        html = response.text
        
        # Save HTML to file for inspection
        with open('debug_dashboard_output.html', 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"✅ Dashboard status: {response.status_code}")
        print(f"📄 HTML length: {len(html)} characters")
        
        # Check for key patterns
        patterns = [
            ('dashboard-user-history.js', 'History JS reference'),
            ('viewRentalDetails', 'viewRentalDetails mentions'),
            ('Lihat Detail', 'Lihat Detail text'),
            ('onclick=', 'onclick attributes'),
            ('</body>', 'Body closing tags'),
            ('</html>', 'HTML closing tags'),
            ('<script', 'Script tags'),
            ('{{ url_for', 'Flask template syntax')
        ]
        
        print("\n🔍 Pattern Analysis:")
        for pattern, desc in patterns:
            count = html.count(pattern)
            print(f"   {desc}: {count} occurrences")
            
        # Check template rendering
        if '{{' in html or '}}' in html:
            print("\n❌ Template not rendered! Flask may have issues.")
            template_vars = []
            import re
            matches = re.findall(r'\{\{[^}]+\}\}', html)
            for match in matches[:5]:  # Show first 5 unrendered variables
                template_vars.append(match)
            print(f"   Unrendered variables: {template_vars}")
        else:
            print("\n✅ Template rendered successfully")
            
        print(f"\n📁 HTML saved to: debug_dashboard_output.html")
        print("   Open this file to inspect the actual content")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_dashboard_html()
