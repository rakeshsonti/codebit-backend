# include<iostream>
using namespace std;
int main()
{
 int size;
 cin>>size;
 int arr[size];
 for(int i=0;i<size;i++)
 {
   int tmp;
   cin>>tmp;
   arr[i]=tmp;
 }
 
 for(int i=0;i<size/2;i++)
 {
   int tmp=arr[i];
   arr[i]=arr[size-i-1];
   arr[size-i-1]=tmp;
 }
 for(int i=0;i<size-1;i++)
 {
   cout<<arr[i]<<" ";
 }
 cout<<arr[size-1];
  return 0;
}