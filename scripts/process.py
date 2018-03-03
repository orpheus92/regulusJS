import numpy as np
import json
import pandas as pd
import fileinput, sys
import argparse
from pathlib import Path

from topopy.MorseSmaleComplex import MorseSmaleComplex as MSC



class PostMSC(object):
    def load(self, hierarchy, base):
        self.hierarchy = np.genfromtxt(hierarchy, delimiter=",")

        with open(base) as data_file:
            self.base = json.load(data_file)

    def addnoise(self,hsorted):
        for i in range(len(hsorted)):
            hsorted[i,0] = hsorted[i,0] + i*np.finfo(float).eps
        return hsorted

    def compute(self):
        hierarchy_sorted = self.hierarchy[np.argsort(self.hierarchy[:, 0])]
        p_max = hierarchy_sorted[-1, 0]
        hierarchy_sorted[:, 0] = hierarchy_sorted[:, 0] / p_max
        num = len(hierarchy_sorted[:,0][hierarchy_sorted[:,0]==1])
        # print(num)
        # Remove indexes for the root from the hierarchy which did not merge to any parent
        hierarchy_sorted = hierarchy_sorted[0:-num, :]
        hierarchy_sorted = self.addnoise(hierarchy_sorted)
        child = hierarchy_sorted[:, 2]
        parent = hierarchy_sorted[:, 3]
        saddle = hierarchy_sorted[:, 4]

        [r, c] = hierarchy_sorted.shape
        p_map = {}
        total_partitions = []
        p_tree = {}
        for i in range(r):

            if hierarchy_sorted[i, 1] == 0:
                p_map[hierarchy_sorted[i, 0]] = self.mergemin(int(child[i]), int(parent[i]), self.base, r - i)
                p_tree[hierarchy_sorted[i, 0]] = self.getPartition(p_map[hierarchy_sorted[i, 0]],saddle[i])
            else:
                p_map[hierarchy_sorted[i, 0]] = self.mergemax(int(child[i]), int(parent[i]), self.base, r - i)
                p_tree[hierarchy_sorted[i, 0]] = self.getPartition(p_map[hierarchy_sorted[i, 0]],saddle[i])


        maxmin = self.hierarchy[np.argsort(self.hierarchy[:, 0])][-2:, :]
        if(maxmin[0,1]==0):
            p_tree[1]=[str(int(maxmin[0,2]))+', '+str(int(maxmin[1,2]))]+[str(-1)]
        else:
            p_tree[1]=[str(int(maxmin[1,2]))+', '+str(int(maxmin[0,2]))]+[str(-1)]
        self.p_tree = p_tree
        allP = list(p_map.keys())
        for p in allP:
            total_partitions = total_partitions + p_map[p]

        mlist = np.array(total_partitions)
        pc_pars = mlist.reshape(int(len(mlist) / 2), 2)
        self.pc_pars = pc_pars

    def save(self, p_par = None, finaltree=None ):
        with open(p_par, 'w') as fp:
            json.dump(self.p_tree, fp)
            fp.close()

        line1 = ",,0," + self.pc_pars[-1][0]
        ## Headers
        line0 = "P1,P2,Pi,C1,C2,Ci"

        simplify = self.simplify(self.pc_pars)

        df = pd.DataFrame(self.pc_pars)
        df.to_csv(finaltree, header=None, index=False)

        with open(finaltree, 'r') as original:
            data = original.read()
            original.close()

        with open(finaltree, 'w') as modified:
            modified.write(line0 + "\n" + line1 + "\n" + data)
            modified.close()

        for line in fileinput.input([finaltree], inplace=True):
            line = line.replace("\"", "")
            line = line.replace(" ", "")
            # sys.stdout is redirected to the file
            sys.stdout.write(line)

    def simplify(self,data):
        out = data
        return out

    def getPartition(self, pmap,saddle):
        pnum = self.strlist2intlist(pmap)
        return pnum[1:][::2]+[str(int(saddle))]

    def mergemin(self, c, p, d, per):
        outlist = []
        if c!=p:
            indpair = list(d.keys())
            indpair2 = np.array([self.str2int(pair) for pair in indpair])

            ##print(indpair2[:, 0] != int(c))

            listmax = indpair2[:, 1][indpair2[:, 0] == int(c)]
            listother = indpair2[indpair2[:, 0] != int(c)]

            for maxin in listmax:
                if self.int2str(int(p), maxin) in indpair:
                    temp = d[self.int2str(int(c), maxin)]
                    d[self.int2str(int(p), maxin)] = d[self.int2str(int(p), maxin)] + temp
                    del d[self.int2str(int(c), maxin)]
                    outlist.append(self.int2str(int(p), maxin, per - 1))
                    outlist.append(self.int2str(int(c), maxin, per))
                else:
                    d[self.int2str(int(p), maxin)] = d.pop(self.int2str(int(c), maxin))
                    outlist.append(self.int2str(int(p), maxin, per - 1))
                    outlist.append(self.int2str(int(c), maxin, per))
            for pair in listother:
                outlist.append(self.int2str(pair[0], pair[1], per - 1))
                outlist.append(self.int2str(pair[0], pair[1], per))
        return outlist

    def mergemax(self, c, p, d, per):
        outlist = []
        if c != p:
            indpair = list(d.keys())
            indpair2 = np.array([self.str2int(pair) for pair in indpair])
            listmin = indpair2[:, 0][indpair2[:, 1] == int(c)]
            listother = indpair2[indpair2[:, 1] != int(c)]
            for minin in listmin:
                if (self.int2str(minin, int(p)) in indpair):
                    temp = d[self.int2str(minin, int(c))]
                    d[self.int2str(minin, int(p))] = d[self.int2str(minin, int(p))] + temp
                    del d[self.int2str(minin, int(c))]
                    outlist.append(self.int2str(minin, int(p), per - 1))
                    outlist.append(self.int2str(minin, int(c), per))
                else:
                    d[self.int2str(minin, int(p))] = d.pop(self.int2str(minin, int(c)))
                    outlist.append(self.int2str(minin, int(p), per - 1))
                    outlist.append(self.int2str(minin, int(c), per))
            for pair in listother:
                outlist.append(self.int2str(pair[0], pair[1], per - 1))
                outlist.append(self.int2str(pair[0], pair[1], per))
        return outlist

    def str2int(self, str):
        str1, str2 = str.split(',')
        return [int(str1), int(str2)]

    def int2str(self, ind1, ind2, ind3=None):
        if ind3 is None:
            return str(ind1) + ', ' + str(ind2)
        else:
            return str(ind1) + ', ' + str(ind2) + ', ' + str(ind3)

    def strlist2intlist(self, strlist):
        newstr = []
        for i in strlist:
            str1, str2, str3 = i.split(',')
            newstr.append(self.int2str(int(str1), int(str2)))
        return newstr

    def appendint(self,string, ind):
        return (string + ', ' + str(ind))


def process(args=None):
    p = argparse.ArgumentParser(prog='analyze', description='Extract input dimension and a single measure')
    p.add_argument('filename', help='input data file [.csv format]')
    p.add_argument('-k', '--knn', type=int, default=100, help='knn')
    p.add_argument('-b', '--beta', type=float, default=1.0, help='beta')
    p.add_argument('-n', '--norm', default='feature', help='norm')
    p.add_argument('-g', '--gradient', default='steepest', help='gradient')
    p.add_argument('-G', '--graph', default='relaxed beta skeleton', help='graph')
    ns = p.parse_args(args)

    path = Path(ns.filename).parent

    try:
        msc = MSC(ns.graph, ns.gradient, ns.knn, ns.beta, ns.norm)
        msc.LoadData(ns.filename)
        msc.Save(path / 'Hierarchy.csv', path / 'Base_Partition.json')

        post = PostMSC()
        post.load(path / 'Hierarchy.csv', path / 'Base_Partition.json')
        post.compute()
        post.save(str(path / 'P_Partition.json'), str(path / 'Final_Tree.csv'))
    except ValueError as error:
        print(error)


if __name__ == '__main__':
    process()