#include<stdio.h>
int main()
{
  int size;
  scanf("%d",&size);
  int arr[size];
  for(int i=0;i<size;i++)
  {
    scanf("%d",&arr[i]);
  }
  int total=0;
  for(int j=0;j<size;j++)
  {
    total=total+arr[j];
  }
  printf("%d\n",total);
  return 0;
}