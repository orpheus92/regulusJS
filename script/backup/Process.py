import sys
import os

import numpy as np
import json
import pandas as pd
import fileinput, sys
import csv
import time
import os.path

# Load Source FIle, and calculate the MSC  
from Topolib.MSC.connect.method import MSC


def convertind(str):
    str1,str2 = str.split(',')
    return [int(str1),int(str2)]

def convert(str):
    newstr = []
    for i in str:
        str1,str2,str3 = i.split(',')
        newstr.append(convertkey(int(str1), int(str2)))
    return newstr

def convt(stra, ind):

    return(stra+', '+str(ind))

def convertkey(ind1,ind2):
    return str(ind1)+', '+str(ind2)

def convertkey3(ind1,ind2,ind3):
    return str(ind1)+', '+str(ind2)+', '+str(ind3)

def mergemin(c,p,d,per):
    outlist = []
    indpair = list(d.keys())
    indpair2 = np.array([convertind(pair) for pair in indpair ])
    listmax = indpair2[:,1][indpair2[:,0]==int(c)]
    for maxin in listmax:
        if convertkey(int(p),maxin) in indpair:

            temp = d[convertkey(int(c),maxin)]
            d[convertkey(int(p),maxin)]=d[convertkey(int(p),maxin)]+temp
            del d[convertkey(int(c),maxin)]
            outlist.append(convertkey3(int(p),maxin,per-1))
            outlist.append(convertkey3(int(c),maxin,per))

        else:
            d[convertkey(int(p),maxin)] = d.pop(convertkey(int(c),maxin))
            outlist.append(convertkey3(int(p),maxin,per-1))
            outlist.append(convertkey3(int(c),maxin,per))

    return outlist

def mergemax(c,p,d,per):
    outlist = []
    indpair = list(d.keys())
    indpair2 = np.array([convertind(pair) for pair in indpair ])
    listmin = indpair2[:,0][indpair2[:,1]==int(c)]
    for minin in listmin:
        if convertkey(minin,int(p)) in indpair:

            temp = d[convertkey(minin,int(c))]
            d[convertkey(minin,int(p))]=d[convertkey(minin,int(p))]+temp
            del d[convertkey(minin,int(c))]
            outlist.append(convertkey3(minin,int(p),per-1))
            outlist.append(convertkey3(minin,int(c),per))

        else:
            d[convertkey(minin, int(p))] = d.pop(convertkey(minin, int(c)))
            outlist.append(convertkey3(minin, int(p),per-1))
            outlist.append(convertkey3(minin, int(c),per))

    return outlist

if __name__ == '__main__':
    # Using MSC library to calculate MSC, save base partitions and tree hierarchy
    X = None
    Y = None

    new_MSC = MSC(X, Y, debug=True)

    new_MSC.loadData('../data/Pu_TOT.csv')
    new_MSC.compute()
    # assign name /dir for the files to be saved
    new_MSC.save('../data/Hierarchy.csv', '../data/Base_Partition.json')

    # Post-process the data files
    hierarchy = np.genfromtxt('../data/Hierarchy.csv', delimiter=",")
    # sort hierarchy based on persistence
    hierarchy_sorted = hierarchy[np.argsort(hierarchy[:, 0])]

    with open('../data/Base_Partition.json') as data_file:
        data = json.load(data_file)
    # Not sure if necessary, get rid of it for now
    Pinter = hierarchy_sorted[-1,0]+1

    child = hierarchy_sorted[hierarchy_sorted[:, 0] < Pinter][:, 2]
    parent = hierarchy_sorted[hierarchy_sorted[:, 0] < Pinter][:, 3]
    tomerge = hierarchy_sorted[hierarchy_sorted[:, 0] < Pinter]

    newdict = data.copy()

    [r, c] = tomerge.shape
    perdict = {}
    totallist = [];
    for i in range(r):
        if tomerge[i, 1] == 0:
            perdict[tomerge[i, 0]] = mergemin(int(child[i]), int(parent[i]), newdict, r - i)

        else:
            perdict[tomerge[i, 0]] = mergemax(int(child[i]), int(parent[i]), newdict, r - i)

    plist = tomerge[:, 0]
    pre = plist[-1]
    curlist = []
    treedata = {}
    treedata[0] = convert([perdict[tomerge[-1, 0]][0]])
    totaltree = {}
    totaltree[-1] = convert([perdict[tomerge[-1, 0]][0]])
    plist = plist[1:]
    total = len(plist)

    for ind, i in reversed(list(enumerate(plist))):
        curlist = set(convert(perdict[i]) + list(curlist))
        treedata[total - ind] = list(curlist)
        totaltree[i] = list(curlist)
        pre = i

        totallist = totallist + perdict[i]

    with open('../data/Tree_Data.json', 'w') as fp:
        json.dump(totaltree, fp)
    num = len(totaltree)

    for i in range(num):
        clist = treedata[i]
        for j in clist:
            totallist = totallist + [convt(j, i), convt(j, i + 1)]

    mlist = np.array(totallist)
    pclist = mlist.reshape(int(len(mlist) / 2), 2)
    ## Root Node
    line1 = ",,0," + pclist[0][0]
    ## Headers
    line0 = "P1,P2,Pi,C1,C2,Ci"

    df = pd.DataFrame(pclist)
    df.to_csv("../data/Tree_Merge.csv", header=None, index=False)

    with open('../data/Tree_Merge.csv', 'r') as original:
        data = original.read()
    with open('../data/Tree_Merge.csv', 'w') as modified:
        modified.write(line0 + "\n" + line1 + "\n" + data)

    for line in fileinput.input(["../data/Tree_Merge.csv"], inplace=True):
        line = line.replace("\"", "")
        line = line.replace(" ", "")
        # sys.stdout is redirected to the file
        sys.stdout.write(line)



