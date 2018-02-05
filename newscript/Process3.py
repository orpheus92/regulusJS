import sys
import os

import numpy as np
import json
import pandas as pd
import fileinput, sys
import csv
import time
import os.path

from topopy.MorseSmaleComplex import MorseSmaleComplex

class Post_MSC():
    def load(self, hierarchy = None, base=None):
        if hierarchy is None:
            hierarchy = '../data/Tree_Hierarchy.csv'
        self.hierarchy = np.genfromtxt(hierarchy, delimiter=",")

        if base is None:
            base = '../data/Total_Partition.json'

        with open(base) as data_file:
            data = json.load(data_file)
            data_file.close()
        self.partition_copy = data.copy()

    def compute(self):
        hierarchy_sorted = self.hierarchy[np.argsort(self.hierarchy[:, 0])]
        # Normalize the persistence
        p_max = hierarchy_sorted[-2, 0]
        hierarchy_sorted[:, 0] = hierarchy_sorted[:, 0] / p_max

        # The hierarchy_sorted has same key as self.partition_copy
        hierarchy_sorted = np.flip(hierarchy_sorted[0:-2, :],0)

        #[r, c] = hierarchy_sorted.shape
        #p_map = {}
        #total_partitions = []
        # Convert to hierarchy to a python dictionary where persistence is the key and list of parent/children index and tree levels as values
        #for i in range(r):
        #    if hierarchy_sorted[i, 1] == 0:
        #        p_map[hierarchy_sorted[i, 0]] = self.mergemin(int(child[i]), int(parent[i]), self.base_copy, r - i)
        #
        #    else:
        #        p_map[hierarchy_sorted[i, 0]] = self.mergemax(int(child[i]), int(parent[i]), self.base_copy, r - i)
        p_list = hierarchy_sorted[:, 0]
        MinMax = hierarchy_sorted[:, 1]
        child = hierarchy_sorted[:, 2]
        parent = hierarchy_sorted[:, 3]
        ind = 0
        pkey = list(self.partition_copy.keys())
        level_p = {}
        #total = len(pkey)
        for key in pkey:
            level_p[ind] = self.partition_copy[key]
            ind = ind+1

        level_tree = {}
        # Tree level as the key
        level_tree[0] = list(level_p[0].keys())
        # Persistence as the key
        p_tree = {}
        p_tree[1] = list(level_p[0].keys())

        #p_list = p_list[1:]

        #ind = 0
        #cur_partitions = []
        #total_partitions = []
        #temp = level_tree[0]
        ab = self.str2int(level_tree[0][0])
        total_partitions = [" , ,0", self.int2str(ab[0],ab[1],0)]

        # Calculate partition information based on base partition indexing for each persistence level
        for ind, i in list(enumerate(p_list)):
            # if split
            #cur = level_p[ind]
            #if(MinMax[ind]==0):
                # Merge Min
            pind = self.strlist2intlist(list(level_p[ind].keys()),2)
            cind = self.strlist2intlist(list(level_p[ind+1].keys()),2)
            pcpair = self.pcrelation(MinMax[ind],int(child[ind]),int(parent[ind]),pind,cind,ind)
            #else:
                # Merge Max
            #curkey = list(cur.keys())
            #c = self.strlist2intlist(curkey)
            #d = list(cur_partitions)
            #cur_partitions = set(self.strlist2intlist(curkey) + list(cur_partitions))
            #level_tree[total - ind] = list(cur_partitions)
            #p_tree[i] = list(cur_partitions)
            total_partitions = total_partitions + pcpair ##+ self.partition_copy[i].keys()

            # if not split


        #self.p_tree = level_p

        #for i in range(len(level_tree)):
        #    c_pars = level_tree[i]
        #    for j in c_pars:
        #        total_partitions = total_partitions + [self.appendint(j, i), self.appendint(j, i + 1)]

        mlist = np.array(total_partitions)
        pc_pars = mlist.reshape(int(len(mlist) / 2), 2)
        self.pc_pars = pc_pars

    def save(self, finaltree=None ):
        #if p_par is None:
        #   p_par = '../data/P_Partition.json'

        if finaltree is None:
            finaltree = '../data/Final_Tree.csv'

        #with open(p_par, 'w') as fp:
        #    json.dump(self.p_tree, fp)
        #    fp.close()

        #line1 = ",,0," + self.pc_pars[0][0]
        ## Headers
        line0 = "P1,P2,Pi,C1,C2,Ci"

        df = pd.DataFrame(self.pc_pars)
        df.to_csv(finaltree, header=None, index=False)

        with open(finaltree, 'r') as original:
            data = original.read()
            original.close()
        with open(finaltree, 'w') as modified:
            modified.write(line0 + "\n" + data)
            modified.close()

        for line in fileinput.input([finaltree], inplace=True):
            line = line.replace("\"", "")
            line = line.replace(" ", "")
            # sys.stdout is redirected to the file
            sys.stdout.write(line)

    def pcrelation(self, minmax, child, parent, plevel,clevel,ind):
        pcpair = []
        #if split
        if(minmax == 0):
            for ppar in plevel:
                if(ppar[0]==parent):
                    if ([child,ppar[1]] in clevel):
                        pcpair.append(self.int2str(parent,ppar[1],ind))
                        pcpair.append(self.int2str(child, ppar[1], ind+1))
                        pcpair.append(self.int2str(parent, ppar[1], ind))
                        pcpair.append(self.int2str(parent, ppar[1], ind + 1))
                    else:
                        pcpair.append(self.int2str(parent,ppar[1],ind))
                        pcpair.append(self.int2str(parent,ppar[1],ind+1))
                else:
                    pcpair.append(self.int2str(ppar[0], ppar[1], ind))
                    pcpair.append(self.int2str(ppar[0], ppar[1], ind+1))

        else:
            for ppar in plevel:

                if (ppar[1] == parent):
                    if ([ppar[0], child] in clevel):
                        pcpair.append(self.int2str(ppar[0], parent,ind))
                        pcpair.append(self.int2str(ppar[0], child, ind + 1))
                        pcpair.append(self.int2str(ppar[0], parent, ind))
                        pcpair.append(self.int2str(ppar[0], parent, ind + 1))
                    else:
                        pcpair.append(self.int2str(ppar[0], parent, ind))
                        pcpair.append(self.int2str(ppar[0], parent, ind+1))
                else:
                    pcpair.append(self.int2str(ppar[0], ppar[1], ind))
                    pcpair.append(self.int2str(ppar[0], ppar[1], ind+1))

        #else

        return pcpair
    def mergemin(self, c, p, d, per):
        outlist = []
        indpair = list(d.keys())
        indpair2 = np.array([self.str2int(pair) for pair in indpair])
        listmax = indpair2[:, 1][indpair2[:, 0] == int(c)]
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

        return outlist

    def mergemax(self, c, p, d, per):
        outlist = []
        indpair = list(d.keys())
        indpair2 = np.array([self.str2int(pair) for pair in indpair])
        listmin = indpair2[:, 0][indpair2[:, 1] == int(c)]
        for minin in listmin:
            if self.int2str(minin, int(p)) in indpair:

                temp = d[self.int2str(minin, int(c))]
                d[self.int2str(minin, int(p))] = d[self.int2str(minin, int(p))] + temp
                del d[self.int2str(minin, int(c))]
                outlist.append(self.int2str(minin, int(p), per - 1))
                outlist.append(self.int2str(minin, int(c), per))

            else:
                d[self.int2str(minin, int(p))] = d.pop(self.int2str(minin, int(c)))
                outlist.append(self.int2str(minin, int(p), per - 1))
                outlist.append(self.int2str(minin, int(c), per))

        return outlist

    def str2int(self, str):
        str1, str2 = str.split(',')
        return [int(str1), int(str2)]

    def int2str(self, ind1, ind2, ind3=None):
        if ind3 is None:
            return str(ind1) + ', ' + str(ind2)
        else:
            return str(ind1) + ', ' + str(ind2) + ', ' + str(ind3)

    def strlist2intlist(self, strlist, num):
        newstr = []
        if(num ==3 ):
            for i in strlist:
                str1, str2, str3 = i.split(',')
                newstr.append([int(str1),int(str2),int(str3)])
        else:
            for i in strlist:
                str1, str2 = i.split(',')
                newstr.append([int(str1),int(str2)])
        return newstr

    def appendint(self,string, ind):
        return (string + ', ' + str(ind))

if __name__ == '__main__':
    # Using MSC library to calculate MSC, save base partitions and tree hierarchy

    graph = 'relaxed beta skeleton'
    gradient = 'steepest'
    knn = 100
    beta = 1.0
    normalization = 'feature'
    hierarchy = 'Hierarchy.csv'

    data = sys.argv[1]

    if len(sys.argv) >= 7:
        graph = sys.argv[2]
        gradient = sys.argv[3]
        knn = sys.argv[4]
        beta = sys.argv[5]
        normalization = sys.argv[6]
        if len(sys.argv) == 10:
            base = sys.argv[7]
            p_par = sys.argv[8]
            tree = sys.argv[9]
    #new_MSC = MSC(X, Y, debug=True)
    new_MSC = MorseSmaleComplex(graph, gradient, knn, beta, normalization,debug = True)
    # Load Raw Data
    new_MSC.LoadData(data)
    #new_MSC.loadData('../data/Pu_TOT.csv')

    # Compute MSC
    #new_MSC.compute(graph,gradient,knn,beta,normalization)
    #new_MSC.compute('relaxed beta skeleton', 'steepest', 100, 1.0, 'feature')

    # Save
    #new_MSC.Save(hierarchy,base)
    new_MSC.Save('../data/Tree_Hierarchy.csv', '../data/Total_Partition.json')
	

    # Create Post-Processing Object
    Post = Post_MSC()

    # Load MSC results
    #Post.load(hierarchy, base)
    Post.load('../data/Tree_Hierarchy.csv','../data/Total_Partition.json')

    # Post Processing
    Post.compute()

    # Save
    #Post.save(p_par,tree)
    Post.save('../data/Final_Tree.csv')

    #os.remove(hierarchy)



