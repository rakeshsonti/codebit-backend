# include<stdio.h>
int main()
{
int size;
scanf("%d",&size);
int arr[size];
for(int i=0;i<size;i++)
{
int temp=0;
scanf("%d",&temp);
arr[i]=temp;
}
for(int j=0;j<size;j++)
{
printf("%d ",arr[j]);
}
}