import java.io.*;
import java.util.*;
class Main {
  public static void reverseArray(int arr[],int size)
  {
    for(int i=0;i<size/2;i++)
    {
      int tmp=arr[i];
      arr[i]=arr[size-i-1];
      arr[size-i-1]=tmp;
    }
    for(int j=0;j<size-1;j++)
    {
      System.out.print(arr[j]+" ");
    }
    System.out.print(arr[size-1]);
  }
  
  public static void main (String[] args) {
    Scanner sc=new Scanner(System.in);
    int size=sc.nextInt();
    int arr[]=new int[size];
    for(int i=0;i<size;i++)
    {
      arr[i]=sc.nextInt();
    }
    reverseArray(arr,size);

  }
}