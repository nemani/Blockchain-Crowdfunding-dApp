from flask import Flask, request
import json
app = Flask(__name__)

contracts_list = []

@app.route("/")
def hello():
	return json.dumps(contracts_list)


@app.route("/get_data", methods=["GET"])
def retlist():
	return json.dumps(contracts_list)

@app.route("/data", methods=["POST"])
def add_new_to_list():
	print(contracts_list)
	name = request.form.get("name")
	Address = request.form.get("Address")
	info = {}
	info['Address'] = Address
	info['name'] = name
	contracts_list.append(info)
	# contracts_list.append(a["contact"])
	return "Successfully Added new contact"

@app.after_request
def after_request(response):
	header = response.headers
	header['Access-Control-Allow-Headers'] = 'Content-Type'
	header['Access-Control-Allow-Origin'] = '*'
	return response

if __name__ == '__main__':
	app.run(port=8080, debug=True)