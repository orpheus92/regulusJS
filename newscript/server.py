#!/usr/bin/env python

import asyncio
import datetime
import random
import websockets

def resimulate(info):
    print("Resim") ##Using cyclus

def dataextract():
    print("Data")

def calcMSC():
    print("Calc MSC/PostProcesss")
    return("Complete")
async def updateDatabase(websocket, path):
    print("Path = ")
    #rint(path)
    while True:
        #now = datetime.datetime.utcnow().isoformat() + 'Z'
        #await websocket.send(now)
        #await websocket.recv()
        #await asyncio.sleep(random.random() * 3)
        await websocket.recv()
        #resimulate(info)
        #dataextract()
        #state = calcMSC()
        #await websocket.send(state)
        print("MSG: ")

start_server = websockets.serve(updateDatabase, 'localhost', 1234)
#start_server = websockets.serve(time, '127.0.0.1', 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()