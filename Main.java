
   import java.io.*;
   import java.util.*;
   class Main{
     public static void main(String args[]){
       Scanner sc=new Scanner(System.in);
       int size=sc.nextInt();
       int arr[]=new int[size];
       for(int i=0;i<size;i++)
       {
         arr[i]=sc.nextInt();
       }
       for(int i=0;i<size/2;i++)
       {
         int temp=arr[i];
         arr[i]=arr[size-1-i];
         arr[size-1-i]=temp;
       }
       for(int i=0;i<size-1;i++)
       {
         System.out.print(arr[i]+" ");
       }
       System.out.print(arr[size-1]);
     }
   }