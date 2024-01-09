from flask import Flask,request,jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app,origins="http://localhost:3000")

def base64_to_pdf(base64_string, output_path):
    try:
        # Decode the Base64 string to binary data
        binary_data = base64.b64decode(base64_string)

        # Save the binary data to a PDF file
        with open(output_path, 'wb') as output_file:
            output_file.write(binary_data)

        print(f"PDF file saved to: {output_path}")
    except Exception as e:
        print(f"Error converting Base64 to PDF: {e}")

@app.route('/')
def hello():
    return "hello world"

@app.route('/upload',methods = ['POST'])
def upload():
    try:
        # Read the data in chunks from the request stream

        data = b''
        for chunk in request.stream:
            data += chunk

        # Decode the Base64 data
        decoded_data = base64.b64decode(data)

        # Process the decoded data as needed
        # For example, save it to a file or perform other operations
        # print(decoded_data)
        base64_to_pdf(data,"./output.pdf")
        return jsonify({'message': 'Base64 data processed successfully'})

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)