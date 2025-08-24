import os
from flask import Flask, request, render_template, redirect, url_for
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask import jsonify
import datetime 

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=template_dir)

# Google Sheets setup
scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
client = gspread.authorize(creds)

sheet = client.open("Registrations").sheet1  # Make sure the sheet name is correct

@app.route('/')
def index():
    data = data = sheet.get_all_values()[1:] 
    # Check if there's a 'status' query parameter (success or error)
    status = request.args.get('status')
    return render_template('index.html', users=data, status=status)

@app.route('/register', methods=['POST'])
def register():
    try:
        name = request.form['name']
        university_id = request.form['university_id']
        phone = request.form['phone']
        email = request.form['email']
        about_yourself = request.form.get('about_yourself', '') # Get "عرفنا عن نفسك" content
        category = request.form.get('category', '')
        e3lam_text = request.form.get('e3lam-text', '')
        mawared_text = request.form.get('mawared-text', '')
        about = request.form.get('about', '')
        offer = request.form.get('offer', '')
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # أضيفي كل القيم للصف كعمود جديد في الشيت
        row = [now, name, university_id, phone, email, about_yourself, category, e3lam_text, mawared_text, about, offer]
        
        # Force insert into correct row
        last_row = len(sheet.get_all_values()) + 1
        sheet.insert_row(row, last_row)

        print(f"Added row: {row}")
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)})


if __name__ == '__main__':
    app.run(debug=True, port=5500)