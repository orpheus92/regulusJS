import pyerg
points = [[0.360502, 0.535494],[0.476489, 0.560185],[0.503125, 0.601218],[0.462382, 0.666667],[0.504702, 0.5]]
import numpy as np
graph_rep = pyerg.Graph(np.array(points), 'beta skeleton', 3, 1, edges = None)
graph_rep.FullGraph()
graph_rep.Neighbors()