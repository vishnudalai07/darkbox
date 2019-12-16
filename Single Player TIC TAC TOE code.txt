import random
print('Welcome to TIC TAC TOE GAME')
print('Your symbol is X')
print('Enter number from 0 to 8 to select your position')
print('TIC TAC TOE')
a=['0','1','2','3','4','5','6','7','8']
b=[[0,4,8],[0,3,6],[0,1,2],[1,4,7],[2,5,8],[3,4,5],[6,7,8],[2,4,6]]
re=[[0,4,8],[0,3,6],[0,1,2],[1,4,7],[2,5,8],[3,4,5],[6,7,8],[2,4,6]]
rem=[]
X=0
c=0
i=0
k=0
t=0
def func():
    print('      ')
    print('      ')
    print(a[0],'|',a[1],'|',a[2])
    print('---------')
    print(a[3],'|',a[4],'|',a[5])
    print('---------')
    print(a[6],'|',a[7],'|',a[8])
    if(a[0]==a[4]==a[8]=='X' or a[0]==a[3]==a[6]=='X' or a[0]==a[1]==a[2]=='X' or a[1]==a[4]==a[7]=='X' or a[2]==a[5]==a[8]=='X' or a[3]==a[5]==a[4]=='X' or a[6]==a[7]==a[8]=='X' or a[2]==a[4]==a[6]=='X'):
        print('Player 1 wOn')
        print('Congratulations')
        c=0
    elif(a[0]==a[4]==a[8]=='O' or a[0]==a[3]==a[6]=='O' or a[0]==a[1]==a[2]=='O' or a[1]==a[4]==a[7]=='O' or a[2]==a[5]==a[8]=='O' or a[3]==a[5]==a[4]=='O' or a[6]==a[7]==a[8]=='O' or a[2]==a[4]==a[6]=='O'):
        print('Player 2 wOn')
        print('Congratulations')
        c=0
    elif(i==8):
        print('Draw')
        print('You May Try Once Again')
    


for i in range(9):
    if(i%2==0):
        X=input('Player 1: ')
        X=int(X)
        a[X]='X'
        for j in range(8):
            for k in range(0,len(re[j])):
              if(re[j][k]==X):
                  b[j].remove(X)
    else:
        
         
        for j in range(8):
            if(len(b[j])>0):
                
                 for k in range(len(b[j])):
                    if(b[j][k]==X):
                        
                        t=k
                       
            while(len(b[t])==0):
                t=t+1
        X=random.choice(b[t])
        print(b)
        print(X)
        a[X]='O'
        for j in range(8):
            for k in range(0,len(re[j])):
              if(re[j][k]==X):
                  b[j].remove(X)                     
    
    if(c==0):
        func()
        
   
    
