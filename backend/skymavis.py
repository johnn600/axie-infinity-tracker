import eel
import requests
import json

# ---------------------------------------------------------------
#API portion
#Developer console: https://developers.skymavis.com/console
#Documentation: https://docs.skymavis.com/reference/general
#---------------------------------------------------------------

#get the SLP balance of a ronin address
@eel.expose
def get_slp_count(ronin: str):
    url = f"https://api-gateway.skymavis.com/explorer/tokenbalances/{ronin}?token=ERC20"
    #API key from SkyMavis (my console account)
    headers = {
    "accept": "application/json",
    "X-API-Key": SKYMAVIS_API_KEY
    }
    #this returns a JSON object
    response = requests.get(url, headers=headers)
    print(response.text)

    # Parse the JSON object
    parsed_json = json.loads(response.text)
    #get the SLP balance (int)
    # Iterate through the "results" array
    for obj in parsed_json['results']:
        if obj['token_symbol'] == 'SLP':
            balance = obj['balance']
            return balance
        else:
            pass

#get the Axie count of a ronin address
@eel.expose
def get_axie_count(ronin: str):
    url = f"https://api-gateway.skymavis.com/explorer/tokenbalances/{ronin}?token=ERC721"
    #API key from SkyMavis (my console account)
    headers = {
    "accept": "application/json",
    "X-API-Key": SKYMAVIS_API_KEY
    }
    #this returns a JSON object
    response = requests.get(url, headers=headers)
    # Parse the JSON object
    parsed_json = json.loads(response.text)
    #get the axie count (int)
    # Iterate through the "results" array
    for obj in parsed_json['results']:
        if obj['token_symbol'] == 'AXIE':
            axie = obj['balance']
            return axie
        else:
            pass