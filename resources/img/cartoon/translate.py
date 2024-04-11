# -*- coding: utf-8 -*-
"""
Created on 2024-04-11 14:46:15
Last edit 2024-04-11 15:17:32
@author: 김태룡 (GoldBigDragon)
@purpose: Translate cartoons
"""
import os
try:
  import requests
except ImportError:
  print("Trying to Install required module: requests")
  os.system('python -m pip install requests')
import requests
import json
import threading


# DeepL: https://www.deepl.com/ko/translator
global DEEP_L_API_TOKEN
DEEP_L_API_TOKEN = '!!!Write your DEEP_L API token!!!'
global HEADERS
HEADERS = {'Content-Type': 'application/json', 'Authorization': 'DeepL-Auth-Key ' + DEEP_L_API_TOKEN}
global DEEP_L_URL
DEEP_L_URL = 'https://api-free.deepl.com/v2/translate'

TRANSALTE_CONTENTS = [
"번역 대상 문장을 작성하세요.",
"배열 형식으로 작성해도 됩니다."
]

TRANSLATE_LANGUAGES = ["EN", "JA", "ZH", "RU"]
TRANSLATE_RESULTS = {}

def sendAPI(contents, language):
    global HEADERS
    global DEEP_L_URL
    res = requests.post(DEEP_L_URL, data=json.dumps({"text": contents, "target_lang": language}), headers=HEADERS)
    statusCode = res.status_code
    if statusCode == 200:
        result = res.json()
        res.close()
        TRANSLATE_RESULTS[language] = result['translations']
    else:
        res.close()
        if statusCode == 400:
            TRANSLATE_RESULTS[language] = {"statusCode":400, "message":"BAD REQUEST"}
        elif statusCode == 500:
            TRANSLATE_RESULTS[language] = {"statusCode":500, "message":"INTERNAL SERVER ERROR"}
        elif statusCode == 403:
            TRANSLATE_RESULTS[language] = {"statusCode":403, "message":"NO PERMISSION"}
        else:
            TRANSLATE_RESULTS[language] = {"statusCode":404, "message":"PAGE NOT FOUND"}
    return
threads = []
for language in TRANSLATE_LANGUAGES:
    threads.append(threading.Thread(target=sendAPI, args=(TRANSALTE_CONTENTS, language,)))
for i in range(0, len(TRANSLATE_LANGUAGES)):
    threads[i].start()
for i in range(0, len(TRANSLATE_LANGUAGES)):
    threads[i].join()

for i in range(0, len(TRANSALTE_CONTENTS)):
    print("E:", TRANSLATE_RESULTS["EN"][i]["text"])
    print("K:", TRANSALTE_CONTENTS[i])
    print("J:", TRANSLATE_RESULTS["JA"][i]["text"])
    print("C:", TRANSLATE_RESULTS["ZH"][i]["text"])
    print("R:", TRANSLATE_RESULTS["RU"][i]["text"])
    print("----")
