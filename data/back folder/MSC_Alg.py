
import sys
import os
from Topolib.MSC.connect.method import myObj
from qtpy import QtWidgets as qtw

if __name__ == '__main__':
  app = qtw.QApplication(sys.argv)

  X = None
  Y = None

  main = myObj(X,Y,debug=True)

  main.loadData('Pu_TOT.csv')

