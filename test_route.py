from flask import Flask, render_template
from app import app

@app.route('/test-user-assets')
def test_user_assets():
    return render_template('test_user_assets_loading.html')

if __name__ == '__main__':
    app.run(debug=True)
